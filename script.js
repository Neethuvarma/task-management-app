const API_URL =
    "https://6abe1d0cc4d5ac54830207ba.mockapi.io/api/tasks";


let tasks = [];

let editingTaskId = null;


// ========================================
// GET ALL TASKS
// ========================================

async function fetchTasks() {

    const loading =
        document.getElementById("loading");

    loading.classList.remove("hidden");

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch tasks");
        }

        tasks = await response.json();

        renderTasks();

        updateStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to load tasks",
            true
        );

    } finally {

        loading.classList.add("hidden");
    }
}


// ========================================
// DISPLAY TASKS
// ========================================

function renderTasks() {

    const taskList =
        document.getElementById("taskList");

    const emptyState =
        document.getElementById("emptyState");

    const search =
        document.getElementById("searchInput")
            .value
            .toLowerCase();

    const filter =
        document.getElementById("filterStatus")
            .value;


    const filteredTasks =
        tasks.filter(task => {

            const title =
                String(
                    task.title || ""
                ).toLowerCase();


            const matchesSearch =
                title.includes(search);


            const matchesStatus =
                filter === "all" ||
                task.status === filter;


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    filteredTasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className = "task-card";


        const statusClass =
            getStatusClass(task.status);


        card.innerHTML = `

            <div class="task-top">

                <div class="task-title">
                    ${escapeHTML(task.title)}
                </div>

                <span class="status ${statusClass}">
                    ${escapeHTML(task.status)}
                </span>

            </div>


            <div class="task-date">
                📅 End Date:
                <strong>
                    ${formatDate(task.endDate)}
                </strong>
            </div>


            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editTask('${task.id}')"
                >
                    ✏️ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask('${task.id}')"
                >
                    🗑️ Delete
                </button>

            </div>

        `;


        taskList.appendChild(card);

    });

}


// ========================================
// CREATE TASK
// ========================================

async function createTask(taskData) {

    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(taskData)

            });


        if (!response.ok) {
            throw new Error(
                "Failed to create task"
            );
        }


        const newTask =
            await response.json();


        tasks.push(newTask);


        renderTasks();

        updateStats();


        showToast(
            "Task added successfully!"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Failed to add task",
            true
        );

    }

}


// ========================================
// UPDATE TASK
// ========================================

async function updateTask(
    id,
    taskData
) {

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(taskData)

                }
            );


        if (!response.ok) {
            throw new Error(
                "Failed to update task"
            );
        }


        const updatedTask =
            await response.json();


        tasks =
            tasks.map(task =>
                task.id === id
                    ? updatedTask
                    : task
            );


        renderTasks();

        updateStats();


        showToast(
            "Task updated successfully!"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Failed to update task",
            true
        );

    }

}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Failed to delete task"
            );
        }


        tasks =
            tasks.filter(
                task => task.id !== id
            );


        renderTasks();

        updateStats();


        showToast(
            "Task deleted successfully!"
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Failed to delete task",
            true
        );

    }

}


// ========================================
// OPEN MODAL
// ========================================

function openModal() {

    editingTaskId = null;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add New Task";


    document.getElementById(
        "taskForm"
    ).reset();


    document.getElementById(
        "taskModal"
    ).classList.add("show");

}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

    document.getElementById(
        "taskModal"
    ).classList.remove("show");

}


// ========================================
// EDIT TASK
// ========================================

function editTask(id) {

    const task =
        tasks.find(
            task => task.id === id
        );


    if (!task) {
        return;
    }


    editingTaskId = id;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Task";


    document.getElementById(
        "taskTitle"
    ).value =
        task.title || "";


    document.getElementById(
        "endDate"
    ).value =
        task.endDate || "";


    document.getElementById(
        "status"
    ).value =
        task.status || "Pending";


    document.getElementById(
        "taskModal"
    ).classList.add("show");

}


// ========================================
// FORM SUBMIT
// ========================================

document.getElementById(
    "taskForm"
).addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const title =
            document.getElementById(
                "taskTitle"
            ).value.trim();


        const endDate =
            document.getElementById(
                "endDate"
            ).value;


        const status =
            document.getElementById(
                "status"
            ).value;


        if (!title || !endDate) {

            showToast(
                "Please fill all fields",
                true
            );

            return;

        }


        const taskData = {

            title: title,

            endDate: endDate,

            status: status

        };


        if (editingTaskId) {

            await updateTask(
                editingTaskId,
                taskData
            );

        } else {

            await createTask(
                taskData
            );

        }


        closeModal();

    }
);


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStats() {

    document.getElementById(
        "totalTasks"
    ).textContent =
        tasks.length;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "Pending"
        ).length;


    document.getElementById(
        "progressTasks"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "In Progress"
        ).length;


    document.getElementById(
        "completedTasks"
    ).textContent =
        tasks.filter(
            task =>
                task.status === "Completed"
        ).length;

}


// ========================================
// STATUS CSS CLASS
// ========================================

function getStatusClass(status) {

    if (status === "Completed") {
        return "status-completed";
    }


    if (status === "In Progress") {
        return "status-progress";
    }


    return "status-pending";

}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "Not specified";
    }


    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ========================================
// PREVENT HTML INJECTION
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


// ========================================
// TOAST MESSAGE
// ========================================

function showToast(
    message,
    isError = false
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent = message;


    toast.style.background =
        isError
            ? "#dc2626"
            : "#111827";


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


// ========================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ========================================

document.getElementById(
    "taskModal"
).addEventListener(
    "click",
    function(event) {

        if (
            event.target === this
        ) {

            closeModal();

        }

    }
);


// ========================================
// INITIAL LOAD
// ========================================

fetchTasks();