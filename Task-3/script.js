 const STATS = {
            quizCount: 0,
            jokeCount: 0,
            imageCount: 0,
        };

        const questionBanks = {
            python: [
                { q: 'Which keyword is used to create a function in Python?', opts: ['function', 'def', 'fun', 'create'], a: 1, exp: 'The "def" keyword is short for "define" and is used to create a function in Python.' },
                { q: 'Which of these is a mutable data type in Python?', opts: ['Tuple', 'String', 'List', 'Frozen Set'], a: 2, exp: 'Lists are mutable, meaning their elements can be changed after creation. Tuples and Strings are immutable.' },
                { q: 'How do you start a single-line comment in Python?', opts: ['//', '#', '/*', '--'], a: 1, exp: 'Python uses the "#" symbol to denote a single-line comment.' },
                { q: 'What does the "range()" function return?', opts: ['A list of numbers', 'A generator', 'A range object', 'An iterator'], a: 2, exp: 'The `range()` function returns an immutable sequence object of type `range`, which can be iterated over but is not a list itself until explicitly cast (e.g., `list(range(5))`).' },
                { q: 'What is the correct way to check if a key exists in a dictionary `d`?', opts: ['`d.hasKey("key")`', '`"key" in d.keys()`', '`"key" in d`', '`d["key"] != null`'], a: 2, exp: 'The most Pythonic and efficient way to check for a key\'s existence in a dictionary is using the `in` operator: `"key" in dictionary`.' },
            ],
            java: [
                { q: 'Which data type is not primitive in Java?', opts: ['int', 'boolean', 'String', 'char'], a: 2, exp: '`String` is a class (an object) in Java, while `int`, `boolean`, and `char` are primitive types.' },
                { q: 'Which method is the starting point for a Java application?', opts: ['`init()`', '`start()`', '`main(String[] args)`', '`run()`'], a: 2, exp: 'The standard entry point for any standalone Java application is the public static `main(String[] args)` method.' },
                { q: 'Which keyword is used to prevent a class from being subclassed?', opts: ['`static`', '`abstract`', '`final`', '`private`'], a: 2, exp: 'The `final` keyword can be applied to a class to prevent it from being inherited (subclassed).' },
                { q: 'What is the default value of a boolean variable in Java?', opts: ['`0`', '`null`', '`false`', '`true`'], a: 2, exp: 'The default value for an uninitialized class-level (or instance) boolean variable in Java is `false`.' },
                { q: 'Which operator is used to create an object of a class?', opts: ['`.` (dot)', '`new`', '`this`', '`class`'], a: 1, exp: 'The `new` operator is used to allocate memory and call the constructor to create a new object instance.' },
            ],
            javascript: [
                { q: 'Which keyword is used to declare a block-scoped variable?', opts: ['`var`', '`const`', '`let`', '`block`'], a: 2, exp: '`let` is used to declare a variable with block scope, meaning it is only accessible within the block of code where it is defined. `var` is function-scoped, and `const` is also block-scoped but immutable.' },
                { q: 'What does the `===` operator do?', opts: ['Compares value only', 'Compares value and type', 'Assigns a value', 'Compares type only'], a: 1, exp: 'The strict equality operator (`===`) checks for both value and data type equality without type coercion.' },
                { q: 'How do you correctly write an IF statement for checking if "i" is NOT equal to 5?', opts: ['`if i <> 5`', '`if (i != 5)`', '`if (i !== 5)`', '`if i =! 5`'], a: 2, exp: 'The strict inequality operator (`!==`) checks if values are not equal OR if they are not of the same type. `if (i !== 5)` is generally preferred for strict comparisons.' },
                { q: 'What is the purpose of the `setTimeout` function?', opts: ['To run a function immediately', 'To stop script execution', 'To execute a function after a specified delay', 'To run a function on loop'], a: 2, exp: '`setTimeout(func, delay)` executes a function or specified piece of code once after a set time delay (in milliseconds).' },
                { q: 'Which is NOT a valid way to create an object literal?', opts: ['`{name: "A"}`', '`new Object()`', '`new {}`', '`Object.create(null)`'], a: 2, exp: '`new {}` is not a valid way to create an object in JavaScript. The other three are valid methods (literal, constructor, and prototypal inheritance).' },
            ]
        };

        // --- General Functions ---

        /**
         * Switches the active section and updates the navigation link style.
         * @param {string} id - The ID of the section to show.
         * @param {HTMLElement} el - The clicked navigation list item.
         */
        function showSection(id, el) {
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.getElementById(id).style.display = 'block';
            document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
            if (el) el.classList.add('active');
            
            // Re-initialize carousel if moving to it
            if (id === 'carousel' && !autoPlayInterval) {
                initCarousel();
            }
        }

        /** Updates the dashboard stats from the global STATS object. */
        function updateStats() {
            document.getElementById('quizCount').textContent = STATS.quizCount;
            document.getElementById('jokeCount').textContent = STATS.jokeCount;
            document.getElementById('imageCount').textContent = STATS.imageCount;
        }

        /** Toggles between Dark and Light mode. */
        function toggleTheme() {
            const body = document.body;
            const themeIcon = document.getElementById('themeIcon');
            
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                themeIcon.className = 'fas fa-moon';
                localStorage.setItem('theme', 'dark');
            } else {
                body.classList.add('light-mode');
                themeIcon.className = 'fas fa-sun';
                localStorage.setItem('theme', 'light');
            }
        }

        /** Loads theme preference on page load. */
        function loadTheme() {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme === 'light') {
                toggleTheme(); // Call toggle to switch to light mode
            }
        }


        // --- Quiz Module ---
        
        let currentTopic = null;
        let currentQuestions = [];
        let currentQIndex = 0;
        let quizScore = 0;
        let quizTimer = null;
        let timeRemaining = 60; // 60 seconds per question

        /**
         * Shuffles an array in place using the Fisher-Yates algorithm.
         * @param {Array} array - The array to shuffle.
         */
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        /**
         * Starts the quiz with the selected topic.
         * @param {string} topic - The key of the question bank.
         * @param {HTMLElement} el - The clicked topic button.
         */
        function selectTopic(topic, el) {
            currentTopic = topic;
            currentQIndex = 0;
            quizScore = 0;

            // Update active button
            document.querySelectorAll('.topic-btn').forEach(btn => btn.classList.remove('active'));
            el.classList.add('active');

            // Shuffle questions and options for a fresh quiz experience
            currentQuestions = [...questionBanks[topic]];
            shuffleArray(currentQuestions);
            currentQuestions.forEach(q => shuffleArray(q.opts)); // Shuffle options too

            renderQuestion();
        }

        /** Renders the current question and options. */
        function renderQuestion() {
            if (currentQIndex >= currentQuestions.length) {
                showQuizResult();
                return;
            }

            const qData = currentQuestions[currentQIndex];
            timeRemaining = 60; // Reset timer for the new question
            startQuizTimer();

            const quizHTML = `
                <div class="quiz-container">
                    <div class="quiz-status">
                        <p class="meta">Question ${currentQIndex + 1} of ${currentQuestions.length}</p>
                        <p class="meta">Time Left: <span id="timerDisplay" class="timer">60s</span></p>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((currentQIndex) / currentQuestions.length) * 100}%;"></div>
                    </div>
                    
                    <p class="question-text">${qData.q}</p>
                    
                    <div class="options" id="optionsContainer">
                        ${qData.opts.map((opt, i) => `
                            <div class="opt" data-index="${i}" onclick="checkAnswer(this)">
                                ${opt}
                            </div>
                        `).join('')}
                    </div>

                    <div id="explanationBox" class="explanation">
                        <strong>Explanation:</strong> <span id="explanationText"></span>
                    </div>

                    <div class="controls">
                        <button class="btn" id="nextBtn" onclick="nextQuestion()" disabled>Next Question <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
            `;
            document.getElementById('quizArea').innerHTML = quizHTML;
        }

        /** Starts or resets the timer for the current question. */
        function startQuizTimer() {
            clearInterval(quizTimer);
            const timerDisplay = document.getElementById('timerDisplay');
            if (!timerDisplay) return;

            timerDisplay.textContent = `${timeRemaining}s`;

            quizTimer = setInterval(() => {
                timeRemaining--;
                timerDisplay.textContent = `${timeRemaining}s`;

                if (timeRemaining <= 10) {
                    timerDisplay.style.color = varToRgbValue('--error');
                } else if (timeRemaining <= 30) {
                    timerDisplay.style.color = varToRgbValue('--warning');
                } else {
                    timerDisplay.style.color = varToRgbValue('--success');
                }

                if (timeRemaining <= 0) {
                    clearInterval(quizTimer);
                    checkAnswer(null); // Timeout - incorrect answer
                }
            }, 1000);
        }
        
        /** Helper function to get the actual computed value of a CSS variable. */
        function varToRgbValue(variable) {
            return getComputedStyle(document.documentElement).getPropertyValue(variable);
        }


        /**
         * Checks the selected answer against the correct answer.
         * @param {HTMLElement|null} selectedOpt - The clicked option element or null for timeout.
         */
        function checkAnswer(selectedOpt) {
            clearInterval(quizTimer);
            
            const qData = currentQuestions[currentQIndex];
            const correctIndex = qData.opts.findIndex(opt => opt === questionBanks[currentTopic].find(q => q.q === qData.q).opts[questionBanks[currentTopic].find(q => q.q === qData.q).a]);
            let isCorrect = false;

            document.querySelectorAll('.opt').forEach(opt => {
                opt.onclick = null; // Disable further clicks
                opt.classList.add('selected');

                const index = parseInt(opt.getAttribute('data-index'));
                if (index === correctIndex) {
                    opt.classList.add('correct');
                }
            });

            if (selectedOpt) {
                const selectedIndex = parseInt(selectedOpt.getAttribute('data-index'));
                if (selectedIndex === correctIndex) {
                    quizScore++;
                    isCorrect = true;
                } else {
                    selectedOpt.classList.add('wrong');
                }
            } else {
                // Timeout case
                // No need to highlight wrong, only the correct one is shown
            }

            // Show explanation
            document.getElementById('explanationText').textContent = qData.exp;
            document.getElementById('explanationBox').style.display = 'block';
            document.getElementById('nextBtn').disabled = false;
        }

        /** Moves to the next question. */
        function nextQuestion() {
            currentQIndex++;
            renderQuestion();
        }

        /** Displays the final quiz score. */
        function showQuizResult() {
            STATS.quizCount++;
            updateStats();
            
            const total = currentQuestions.length;
            const scoreHTML = `
                <div class="score-display">
                    <h3>Quiz Complete! 🎉</h3>
                    <p class="meta">Topic: ${currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}</p>
                    <span class="final-score">${quizScore} / ${total}</span>
                    <p>Your score is **${(quizScore / total * 100).toFixed(0)}%**.</p>
                    <div class="controls" style="justify-content: center;">
                        <button class="btn" onclick="showSection('dashboard', document.querySelector('[data-target=\"dashboard\"]'))"><i class="fas fa-home"></i> Go to Dashboard</button>
                        <button class="btn ghost" onclick="selectTopic(currentTopic, document.querySelector('.topic-btn.active'))"><i class="fas fa-redo"></i> Retake Quiz</button>
                    </div>
                </div>
            `;
            document.getElementById('quizArea').innerHTML = scoreHTML;
        }

        // --- Joke Module ---

        /** Fetches a joke from a public API. */
        async function getJoke() {
            const jokeOut = document.getElementById('jokeOut');
            jokeOut.innerHTML = 'Fetching a joke... <i class="fas fa-spinner fa-spin"></i>';
            
            try {
                // Using the Official Joke API
                const response = await fetch('https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single');
                const data = await response.json();

                if (data.joke) {
                    jokeOut.textContent = data.joke;
                    STATS.jokeCount++;
                    updateStats();
                } else if (data.setup && data.delivery) {
                    jokeOut.textContent = `${data.setup} ... ${data.delivery}`;
                    STATS.jokeCount++;
                    updateStats();
                } else {
                    jokeOut.textContent = 'Oops! Failed to fetch a joke. Try again.';
                }
            } catch (error) {
                console.error('Error fetching joke:', error);
                jokeOut.textContent = 'Network error or API is down. Try again later.';
            }
        }


        // --- Carousel Module ---

        const images = [
            'https://picsum.photos/900/400?random=1',
            'https://picsum.photos/900/400?random=2',
            'https://picsum.photos/900/400?random=3',
            'https://picsum.photos/900/400?random=4',
            'https://picsum.photos/900/400?random=5'
        ];
        let currentImageIndex = 0;
        let autoPlayInterval = null;
        const SLIDE_DURATION = 5000; // 5 seconds

        /** Initializes the carousel by setting the first image and indicators. */
        function initCarousel() {
            const slide = document.getElementById('slide');
            const indicatorsContainer = document.getElementById('indicators');

            if (slide && indicatorsContainer) {
                slide.src = images[currentImageIndex];
                slide.alt = `Random Image ${currentImageIndex + 1}`;
                
                indicatorsContainer.innerHTML = images.map((_, i) => `
                    <div class="indicator" data-index="${i}" onclick="goToSlide(${i})"></div>
                `).join('');
                updateIndicators();
                STATS.imageCount++;
                updateStats();
            }
        }

        /** Updates the active state of the carousel indicators. */
        function updateIndicators() {
            document.querySelectorAll('.indicator').forEach((ind, i) => {
                ind.classList.toggle('active', i === currentImageIndex);
            });
        }

        /** Moves to the next image in the carousel. */
        function nextSlide() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            updateSlide();
        }

        /** Moves to the previous image in the carousel. */
        function prevSlide() {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            updateSlide();
        }

        /**
         * Directly jumps to a specific slide index.
         * @param {number} index - The index of the slide to show.
         */
        function goToSlide(index) {
            currentImageIndex = index;
            updateSlide();
            // Reset auto-play timer on manual interaction
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION);
            }
        }

        /** Updates the image source and indicators. */
        function updateSlide() {
            const slide = document.getElementById('slide');
            if (slide) {
                slide.style.opacity = '0.5'; // Fade effect start
                setTimeout(() => {
                    slide.src = images[currentImageIndex];
                    slide.alt = `Random Image ${currentImageIndex + 1}`;
                    slide.style.opacity = '1'; // Fade effect end
                    updateIndicators();
                    STATS.imageCount++;
                    updateStats();
                }, 100); // Small delay for the fade effect
            }
        }

        /** Toggles the auto-play functionality. */
        function toggleAutoPlay() {
            const btn = document.getElementById('autoPlayBtn');
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
                btn.innerHTML = '<i class="fas fa-play"></i> Start Auto-Play';
                btn.classList.remove('ghost');
            } else {
                autoPlayInterval = setInterval(nextSlide, SLIDE_DURATION);
                btn.innerHTML = '<i class="fas fa-pause"></i> Stop Auto-Play';
                btn.classList.add('ghost');
                nextSlide(); // Start immediately
            }
        }

        // --- Initialization ---
        window.onload = () => {
            loadTheme();
            updateStats();
            initCarousel(); // Initialize carousel on load even if not visible
        };