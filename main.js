window.addEventListener('load', () => {
	// Navbar and login modal logic
	const navLogin = document.getElementById('nav-login');
	const navUser = document.getElementById('nav-user');
	const loginModal = document.getElementById('login-modal');
	const closeLoginModal = document.getElementById('close-login-modal');
	const loginForm = document.getElementById('login-form');
	let loggedInUser = localStorage.getItem('loggedInUser') || null;

	// Demo credentials
	const DEMO_USER = { username: 'user', password: 'pass' };

	function updateNavbar() {
		if (loggedInUser) {
			navLogin.innerHTML = '<a href="#">Logout</a>';
			navUser.style.display = 'block';
			navUser.textContent = `Hello, ${loggedInUser}`;
		} else {
			navLogin.innerHTML = '<a href="#">Login</a>';
			navUser.style.display = 'none';
			navUser.textContent = '';
		}
	}

	navLogin.onclick = function(e) {
		e.preventDefault();
		if (loggedInUser) {
			// Logout
			loggedInUser = null;
			localStorage.removeItem('loggedInUser');
			updateNavbar();
		} else {
			// Show login modal
			loginModal.style.display = 'flex';
		}
	};

	closeLoginModal.onclick = function() {
		loginModal.style.display = 'none';
	};

	window.onclick = function(event) {
		if (event.target === loginModal) {
			loginModal.style.display = 'none';
		}
	};

	loginForm.onsubmit = function(e) {
		e.preventDefault();
		const username = document.getElementById('username').value;
		const password = document.getElementById('password').value;
		if (username === DEMO_USER.username && password === DEMO_USER.password) {
			loggedInUser = username;
			localStorage.setItem('loggedInUser', username);
			updateNavbar();
			loginModal.style.display = 'none';
			loginForm.reset();
		} else {
			alert('Invalid username or password!');
		}
	};

	updateNavbar();

	// Initialize the app immediately (no login)
	initializeApp();

	function initializeApp() {
		const form = document.querySelector("#new-task-form");
		const input = document.querySelector("#new-task-input");
		const reminderInput = document.querySelector("#new-task-reminder");
		const list_el = document.querySelector("#tasks");
		const sidebarTasks = document.getElementById('sidebar-tasks');

		// Load tasks from localStorage
		let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

		function saveTasks() {
			localStorage.setItem('tasks', JSON.stringify(tasks));
		}

		function renderSidebar() {
			sidebarTasks.innerHTML = '';
			tasks.forEach((taskObj, idx) => {
				const li = document.createElement('li');
				li.textContent = taskObj.text || '(No Title)';
				li.title = taskObj.text;
				li.addEventListener('click', () => {
					// Scroll to and highlight the corresponding task
					const taskDivs = list_el.querySelectorAll('.task');
					if (taskDivs[idx]) {
						taskDivs[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
						taskDivs.forEach(div => div.classList.remove('active-sidebar-task'));
						taskDivs[idx].classList.add('active-sidebar-task');
						setTimeout(() => {
							taskDivs[idx].classList.remove('active-sidebar-task');
						}, 1500);
					}
				});
				sidebarTasks.appendChild(li);
			});
		}

		function renderTasks() {
			list_el.innerHTML = '';
			const now = new Date();
			tasks.forEach((taskObj, idx) => {
				const task_el = document.createElement('div');
				task_el.classList.add('task');
				if (taskObj.reminder) {
					task_el.classList.add('reminder-set');
					const reminderDate = new Date(taskObj.reminder);
					if (reminderDate <= now) {
						task_el.classList.add('reminder-due');
					}
				}

				const task_content_el = document.createElement('div');
				task_content_el.classList.add('content');
				task_el.appendChild(task_content_el);

				const task_input_el = document.createElement('input');
				task_input_el.classList.add('text');
				task_input_el.type = 'text';
				task_input_el.value = taskObj.text;
				task_input_el.setAttribute('readonly', 'readonly');
				task_content_el.appendChild(task_input_el);

				if (taskObj.reminder) {
					const reminderLabel = document.createElement('div');
					reminderLabel.style.fontSize = '0.9rem';
					reminderLabel.style.color = '#ffb300';
					reminderLabel.textContent = '⏰ ' + new Date(taskObj.reminder).toLocaleString();
					task_content_el.appendChild(reminderLabel);
				}

				const task_actions_el = document.createElement('div');
				task_actions_el.classList.add('actions');
				const task_edit_el = document.createElement('button');
				task_edit_el.classList.add('edit');
				task_edit_el.innerText = 'Edit';
				const task_delete_el = document.createElement('button');
				task_delete_el.classList.add('delete');
				task_delete_el.innerText = 'Delete';
				task_actions_el.appendChild(task_edit_el);
				task_actions_el.appendChild(task_delete_el);
				task_el.appendChild(task_actions_el);
				list_el.appendChild(task_el);

				// Edit logic
				task_edit_el.addEventListener('click', (e) => {
					if (task_edit_el.innerText.toLowerCase() == "edit") {
						task_edit_el.innerText = "Save";
						task_input_el.removeAttribute("readonly");
						task_input_el.focus();
					} else {
						task_edit_el.innerText = "Edit";
						task_input_el.setAttribute("readonly", "readonly");
						tasks[idx].text = task_input_el.value;
						saveTasks();
						renderSidebar();
					}
				});
				// Delete logic
				task_delete_el.addEventListener('click', (e) => {
					tasks.splice(idx, 1);
					saveTasks();
					renderTasks();
					renderSidebar();
				});
				// Reminder due notification
				if (taskObj.reminder) {
					const reminderDate = new Date(taskObj.reminder);
					if (reminderDate <= now && !taskObj.notified) {
						alert(`Reminder: ${taskObj.text}`);
						tasks[idx].notified = true;
						saveTasks();
					}
				}
			});
		}

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			const task = input.value.trim();
			const reminder = reminderInput.value;
			if (!task) return;
			tasks.push({ text: task, reminder: reminder || null, notified: false });
			saveTasks();
			renderTasks();
			renderSidebar();
			input.value = '';
			reminderInput.value = '';
		});

		// Periodically check for reminders
		setInterval(renderTasks, 60000); // every minute

		// Initial render
		renderTasks();
		renderSidebar();
	}
});

// Highlight style for sidebar-selected task
const style = document.createElement('style');
style.innerHTML = `.active-sidebar-task { outline: 3px solid #e2187d !important; box-shadow: 0 0 8px #e2187d; }`;
document.head.appendChild(style);