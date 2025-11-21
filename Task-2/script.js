 const form = document.getElementById('contact-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Check required fields
            if (!name || !email || !message) {
                alert('All fields are required!');
                return;
            }

            // Validate email format (simple regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address!');
                return;
            }

            // If valid, show success and reset form
            alert('Form submitted successfully!');
            form.reset();
        });

        // Dynamic To-Do List (DOM Manipulation)
        const todoInput = document.getElementById('todo-input');
        const addTodoBtn = document.getElementById('add-todo');
        const todoList = document.getElementById('todo-list');

        addTodoBtn.addEventListener('click', function() {
            const task = todoInput.value.trim();
            if (task) {
                // Create list item
                const li = document.createElement('li');
                li.textContent = task;

                // Create remove button
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', function() {
                    todoList.removeChild(li);
                });

                // Append button to li, then li to list
                li.appendChild(removeBtn);
                todoList.appendChild(li);

                // Clear input
                todoInput.value = '';
            }
        });