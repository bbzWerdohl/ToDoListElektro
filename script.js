const defaultData = [
    {
        id: 0,
        categorie: "Allgemein",
        title: "Aufgaben hinterlägen",
        beschreibung: "Hinterlägen alle Aufgaben",
        created_at: "05.06.2024",
        isFertig: false,
        isImArbeit: true,
        creator: "Elvis",
        task_status_inWork: 'Elvis',
        task_status_completed: '',
        completed_at: ''
    },
];

function saveDataToLocalStorage(data) {
    localStorage.setItem('tasks', JSON.stringify(data));
}

function loadDataFromLocalStorage() {
    const data = localStorage.getItem('tasks');
    const tasks = data ? JSON.parse(data) : defaultData;
    assignUniqueIds(tasks);
    return tasks;
}

function assignUniqueIds(data) {
    let currentId = 0;

    data.forEach(task => {
        if (!task.id) {
            task.id = currentId++;
        }
    });
}

let data = loadDataFromLocalStorage();

// Function to create a mapping of category names to category list elements
function createCategoryMap() {
    const categories = {};
    document.querySelectorAll('.categorie').forEach(categoryDiv => {
        const categoryName = categoryDiv.querySelector('h3').textContent.trim();
        const categoryList = categoryDiv.querySelector('.categorie_list');
        categories[categoryName] = categoryList;
    });
    return categories;
}

// Function to render tasks in their respective categories
function renderTasks(data, categoryMap) {
    data.sort((a, b) => {
        // Completed tasks go to the bottom
        if (a.isFertig && !b.isFertig) return 1;
        if (!a.isFertig && b.isFertig) return -1;

        // Tasks in work go to the top
        if (a.isImArbeit && !b.isImArbeit) return -1;
        if (!a.isImArbeit && b.isImArbeit) return 1;
    });
    
    data.forEach(task => {
        const taskElem = document.createElement('div');
        taskElem.classList.add('task');
        
        // Assign classes based on task status
        if (task.isFertig) {
            taskElem.classList.add('task-complete');
        } else if (task.isImArbeit) {
            taskElem.classList.add('task-in-work');
        }

        // Create task element content
        taskElem.innerHTML = `
            <h4>${task.title}</h4>
            <div class="taskElemInfo">
                <small>Erstellt am: ${task.created_at}</small>
                ${task.isFertig ? `<p>Fertig am: ${task.completed_at}</p><p>Gefertigt von: ${task.task_status_completed}</p>` : ''}
                ${task.isImArbeit ? `<p>Bearbeiter: ${task.task_status_inWork}</p>` : ''}
            </div>
        `;

        // Add task element to the appropriate category list
        const categoryList = categoryMap[task.categorie];
        if (categoryList) {
            categoryList.appendChild(taskElem);
        }

        // Event listener to open task info modal
        taskElem.addEventListener('click', () => openTaskInfoModal(task));
    });
}

// Function to open the task info modal and handle editing
function openTaskInfoModal(task) {
    const taskInfoModal = document.querySelector('#task_info_modal');
    const taskInfoContent = document.querySelector('#task_info_content');
    
    // Populate task info modal with task details
    taskInfoContent.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.beschreibung}</p>
        <small>Erstellt am: ${task.created_at}</small>
        <small>Erstellt von: ${task.creator}</small>
        ${task.isFertig ? `<p>Fertig am: ${task.completed_at}</p><p>Gefertigt von: ${task.task_status_completed}</p>` : ''}
        ${task.isImArbeit ? `<p>Bearbeiter: ${task.task_status_inWork}</p>` : ''}
        <button id="edit_button">Bearbeiten</button>
        <button id="delete_button">Löschen</button> <!-- Add delete button -->
        <div id="edit_section" style="display: none;">
            <label>
                <input type="checkbox" id="fertig_checkbox" ${task.isFertig ? 'checked' : ''}>
                Fertig
            </label>
            <label>
                <input type="checkbox" id="im_arbeit_checkbox" ${task.isImArbeit ? 'checked' : ''}>
                Im Arbeit
            </label>
            <input type="text" id="task_name_input" placeholder="Name" value="${task.isImArbeit ? task.task_status_inWork : task.task_status_completed}">
            <button id="save_button">Speichern</button>
        </div>
    `;

    // Initialize the checkboxes and input fields
    const fertigCheckbox = taskInfoModal.querySelector('#fertig_checkbox');
    const imArbeitCheckbox = taskInfoModal.querySelector('#im_arbeit_checkbox');
    const taskNameInput = taskInfoModal.querySelector('#task_name_input');
    
    fertigCheckbox.checked = task.isFertig;
    imArbeitCheckbox.checked = task.isImArbeit;

    // Event listener for the edit button
    taskInfoModal.querySelector('#edit_button').addEventListener('click', () => {
        const editSection = taskInfoModal.querySelector('#edit_section');
        editSection.style.display = 'block';
    });

    // Event listener for the save button
    taskInfoModal.querySelector('#save_button').addEventListener('click', () => {
        const taskName = taskNameInput.value;

        // Update task state based on checkbox status
        if (imArbeitCheckbox.checked) {
            task.task_status_inWork = taskName;
        } else {
            task.task_status_inWork = '';
        }

        if (fertigCheckbox.checked) {
            task.task_status_completed = taskName;
            task.completed_at = new Date().toLocaleString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).replace(',', '');
        } else {
            task.task_status_completed = '';
            task.completed_at = '';
        }

        // Update task properties
        task.isFertig = fertigCheckbox.checked;
        task.isImArbeit = imArbeitCheckbox.checked;

        // Save updated data
        saveDataToLocalStorage(data);

        // Re-render tasks
        const categoryMap = createCategoryMap();
        const categoryLists = document.querySelectorAll('.categorie_list');
        categoryLists.forEach(list => list.innerHTML = '');
        renderTasks(data, categoryMap);

        // Hide edit section and close the modal
        taskInfoModal.querySelector('#edit_section').style.display = 'none';
        taskInfoModal.classList.remove('modal_open');
    });

    // Event listener for the delete button
    taskInfoModal.querySelector('#delete_button').addEventListener('click', () => {
        deleteTask(task.id);
        taskInfoModal.classList.remove('modal_open');
    });

    // Open the task info modal
    taskInfoModal.classList.add('modal_open');
}

// Function to delete a task by its ID
function deleteTask(taskId) {
    data = data.filter(task => task.id !== taskId);
    saveDataToLocalStorage(data);

    // Re-render tasks
    const categoryMap = createCategoryMap();
    const categoryLists = document.querySelectorAll('.categorie_list');
    categoryLists.forEach(list => list.innerHTML = '');
    renderTasks(data, categoryMap);
}

function openCreateTaskModal() {
    const createTaskModal = document.querySelector('#create_task_modal');
    createTaskModal.classList.add('modal_open');
}
document.querySelector('#create_task_button').addEventListener('click', openCreateTaskModal);

// Event listeners for closing modals
document.querySelector('#create_task_modal .close').addEventListener('click', () => {
    document.querySelector('#create_task_modal').classList.remove('modal_open');
});

document.querySelector('#task_info_modal .close').addEventListener('click', () => {
    document.querySelector('#task_info_modal').classList.remove('modal_open');
});

// Function to open the create task modal
function openCreateTaskModal() {
    const createTaskModal = document.querySelector('#create_task_modal');
    createTaskModal.classList.add('modal_open');

    // Event listener for the form submission
    document.querySelector('#create_task_form').addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form values
        const categorieSelect = this.querySelector('#categorie_select');
        const categorie = categorieSelect.options[categorieSelect.selectedIndex].value;
        const taskName = this.querySelector('.task_name').value;
        const details = this.querySelector('.details').value;
        const nameOfCreator = this.querySelector('.nameOfCreator').value;

        const newTask = {
            id: data.length, // Assign a unique ID
            categorie: categorie,
            title: taskName,
            beschreibung: details,
            created_at: new Date().toLocaleDateString('de-DE'),
            isFertig: false,
            isImArbeit: false,
            creator: nameOfCreator,
            task_status_inWork: '',
            task_status_completed: '',
            completed_at: ''
        };

        // Add the new task to the data array
        data.push(newTask);

        // Save updated data
        saveDataToLocalStorage(data);

        // Re-render tasks
        const categoryMap = createCategoryMap();
        const categoryLists = document.querySelectorAll('.categorie_list');
        categoryLists.forEach(list => list.innerHTML = '');
        renderTasks(data, categoryMap);

        // Close the modal
        createTaskModal.classList.remove('modal_open');

        // Reset the form
        this.reset();
    });
}



// Initial render of tasks
const categoryMap = createCategoryMap();
renderTasks(data, categoryMap);