class Task {
    id;
    name;
    status;

    constructor(name, status, id) {
        this.name = name;
        this.status = false;
        this.id = id
    }

}


tasks = Array();


/**
 * Updates the interface
 */
function updateUI(){
    updateSubtitle();
    displayFilter();
    displayTasks();
    updateTaskID();
    cursorFocusTask();
}

/**
 * Function to update the id of each task
 */
function updateTaskID() {
    for (let i = 0; i < tasks.length; i++) {
        tasks[i].id = i;
    }
}


/**
 * Update inner HTML describing number of tasks to do depending on the presence of tasks.
 */
function updateSubtitle() {
    
    if (tasks.length == 0){
       $("#sub").text("Nothing to do! Good job");
    }
    else {
        let notDone = 0;
        for (let i = 0; i < tasks.length; i++) {
            if (! tasks[i].status){
                notDone++;
            }
        }
        $("#sub").text("Total: " + tasks.length + " - Unfinished: " + notDone)
    }
}

/**
 * Displays tasks of todo list
 */
function displayTasks() {

    // Get filter
    let filterName = $("#filter-name").text();

    // Reset table
    $("#tasks").empty();

    // Loop on all tasks and add each one of them to the string representing the html
    for (let i = 0; i < tasks.length; i++) {
        if (checkFilter(tasks[i], filterName)) {
            $("#tasks").append(formatTask(tasks[i], i))
            $("#tasks").append($("<hr>"))

        }
    }

}


/**
 * Returns a boolean based on the respect of the filter
 * @param {Task} task the task to check
 * @param {String} filterName name of the filter
 */
function checkFilter(task, filterName="") {
    // For each possible filter, check which one it is and its meaning

    // Tasks completed only
    if (filterName == "Done only" && !task.status){
        return false;
    }

    // Tasks not done yet
    if (filterName == "Not done only" && task.status){
        return false;
    } 

    return true;
}

/**
 * @param {Task} task : the task in which we are interested;
 * @param {Number} index : the index of the task in tasks
 * @returns {HTMLDivElement} : Element representing a task in HTML
 */
function formatTask(task, index){

    // Create row
    let row = document.createElement("div");
    row.className = "row movable";
    row.draggable = true;
    // index of task in tasks
    row.id = index;

    // Column 0 with state of task
    let col0 = document.createElement("div");
    col0.className = "col-sm";

    let icon = document.createElement("i");
    icon.className = (task.status ? "fas fa-check" : "fas fa-times")

    col0.appendChild(icon);

    // Column 1 with name of task
    let col1 = document.createElement("div");
    col1.className = "col-sm" + (task.status ? " strike-through": "");
    col1.innerText = task.name;

    // Column 2 with update state button
    let col2 = document.createElement("div");
    col2.className = "col-sm";

    let button = document.createElement("button");
    button.type = "button";
    button.className = (task.status ? "btn btn-danger" : "btn btn-success");
    button.textContent = (task.status ? " Not done " : " Done ");
    button.onclick = () => {updateState(index)};

    let a = document.createElement("a");
    a.className= (task.status ? " far fa-square " : "far fa-check-square");
    a.style.color = "whitesmoke";
    
    button.appendChild(a);
    col2.appendChild(button);

    // Column 3 with modification buttons
    let col3 = document.createElement("div");
    col3.className = "col-sm";

    let buttonGroup = document.createElement("div");
    buttonGroup.className = "btn-group";
    buttonGroup.role = "group";

    // Remove button
    let button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "btn btn-danger";
    button2.onclick = () => {removeTask(index)};

    let a2 = document.createElement("a");
    a2.className="fas fa-trash";
    
    button2.appendChild(a2);

    // Edit button
    let button3 = document.createElement("button");
    button3.type = "button";
    button3.className = "btn btn-secondary";
    button3.onclick = () => {displayTaskForm("javascript:modifyTask(" + index +")", task.name)};

    let a3 = document.createElement("a");
    a3.className="fas fa-pen";
    button3.appendChild(a3);

    buttonGroup.appendChild(button3);
    buttonGroup.appendChild(button2);

    col3.appendChild(buttonGroup);
    
    // Apend columns to row
    row.appendChild(col0);
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);

    
    // Event listeners
    row.addEventListener('dragstart', dragStart, false);
    row.addEventListener('dragover', dragOver, false);
    row.addEventListener('dragenter', dragEnter, false);
    row.addEventListener('dragleave', dragLeave, false);
    row.addEventListener('dragend', dragEnd, false);
    row.addEventListener('drop', drop, false);
    

    return row

}

/**
 * Updates the state of the specified task
 * @param {Number} taskID : index of task in tasks
 */
function updateState(taskID){
    // Change state of task
    tasks[taskID].status = !tasks[taskID].status;

    updateUI();
}

/**
 * Removes the task from the list of tasks
 * @param {Number} taskID : index of task in tasks
 */
function removeTask(taskID){
    // Cancel any edit happening
    endEdit();
    // Remove task
    tasks.splice(taskID, 1);

    updateUI();
}

/**
 * Add a new task to list of tasks
 */
function addTask() {
    // Create task
    let newTask;
    
    // Get task name from form
    taskName = $("#task-input").val()

    // Add caracteristics to newTask
    newTask = new Task(taskName, false, tasks.length);

    // Add task to list of tasks
    tasks.push(newTask);

    // Reset value of field
    $("#task-input").val("")
    updateUI();

}

/**
 * Generates a form to input task name
 * @param {String} action String representing the action to execute on form submit
 * @param {String} taskName name of the task to modify.
 */
function displayTaskForm(action="javascript:addTask()", taskName="") {

    let taskForm = document.getElementById("task-form");
    taskForm.innerHTML = "";

    let formTitle = document.createElement("h4");
    formTitle.textContent = (action == "javascript:addTask()") ? "Add a task" : ("Modify task: " + taskName);

    let form = document.createElement("form");
    form.action = action;
    form.onsubmit = () => {return validateTask()};

    let formInput = document.createElement("input");
    formInput.id = "task-input";
    formInput.type = "text";
    formInput.placeholder = "Enter task name";
    formInput.value = taskName;

    let formSubmit = document.createElement("input");
    formSubmit.id = "submit";
    formSubmit.type = "submit";
    formSubmit.value = "Submit";


    // Actually adding elements to form
    form.appendChild(formInput);
    form.appendChild(formSubmit);


    // Add a cancel button if not adding task (bcs it is then modifying)
    if (action != "javascript:addTask()"){
        let formCancel = document.createElement("input");
        formCancel.type = "button";
        formCancel.value = "Cancel";
        formCancel.onclick = () => {endEdit()};

        // Adding cancel button to form
        form.appendChild(formCancel);
    }

    // Update actual HTML
    taskForm.appendChild(formTitle);
    taskForm.appendChild(form);

    cursorFocusTask("task-input");
}

/**
 * Places the cursor 
 * @param {String} field String representing id of field to place cursor in
 */
function cursorFocusTask(field="task-input") {
    document.getElementById(field).focus();
    document.getElementById(field).select();
}

function validateTask(field="task-input") {
    // Get value from form
    let taskName = $("#" + field).val();

    // Check not only whitespace
    if (taskName.trim() == ""){
        window.alert("Task can not be empty or whitespaces only");
        // Reset value of field
        $("#" + field).val("");
        return false;
    }
    cursorFocusTask();

    return true;
}

/**
 * Modifies the name of the task at taskID
 * @param {Number} taskID index of task to modidy in tasks
 */
function modifyTask(taskID) {

    // Change name of task
    tasks[taskID].name = $("#task-input").val();

    endEdit();

}

/**
 * Ends the editing of a task
 */
function endEdit(){
    // Reset task form and update UI
    displayTaskForm();
    updateUI()
}

/**
 * Display the selecter filter
 */
function displayFilter() {

    // Save name of pre-existing filter 
    let filterName = $("#filter-name").text();
    //console.log(filterName)

    // Display filter only if one is selected
    $("#filter-selected").text( filterName =="" ? "": ("Filter: " + filterName))
}


/**
 * Sets the filter-name to represent what to display
 * @param {String} filter name of the filter to display
 */
function setFilter(filter="") {

    $("#filter-name").text(filter);

    updateUI();
}


/**
 * Sets the sort-type to represent what to display
 * @param {String} order name of the order to display
 */
function setOrder(order="") {
    
    $("#sort-type").text(order);

    sortTasks();
}

function sortTasks() {
    let sortType = $("#sort-type").text();

    // If type of sorting is not nothing then it is either alphabetically increasing or decreasing
    if (sortType != "") {
        tasks.sort(compareStrings);
    }

    if (sortType == "Decreasing order"){
        tasks.reverse();
    }

    endEdit();
    
}

/**
 * Returns an integer based on the comparison of the name of the 2 tasks
 * @param {Task} task1 first task
 * @param {Task} task2 second task 
 */
function compareStrings(task1, task2) {
    return (task1.name.toUpperCase()).localeCompare(task2.name.toUpperCase());
}

// Functions to manage the drag and drop

// Moving element inside array
function move(oldID, newID) {
    tasks.splice(newID, 0, tasks.splice(oldID, 1)[0]);
};

// Dragging the row
function dragStart(e) {

    // Change the opacity
    $(this).css("opacity", "0.3");

    // Save element id
    baseID = this.id;

}

// Restore element
function dragEnd(e) {
    $(this).css("opacity", "1");
}

function dragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }

    return false;
}

// Add a class when passing above a droppable place with a dragged object
function dragEnter(e) {
    $(this).addClass("over");
}

// Removing the class added by dragEnter when leaving 
function dragLeave(e) {
    $(this).removeClass("over");
}

// Function for the drop (swap content emplacements)
function drop(e) {

    // Stop the propagation of the event
    e.stopPropagation();

    // Check that base element is not the same as the one on which we drop
    if (baseID !== this.id) {
        tasks.splice(this.id, 0, tasks.splice(baseID, 1)[0]);

        //console.log(this.id)
        //console.log("base: "+ baseID)
    }
  
  endEdit();
}

// EXPORT - IMPORT


function exportList(){
    // Data as json
    let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));

    // Create temporary element. His purpose is to offer a download function
    let element = document.createElement('a');
    element.setAttribute('href', 'data:' + data);
    element.setAttribute('download', "list.json");

    element.style.display = 'none';
    document.body.appendChild(element);

    // Simulate a click on the element.
    element.click();

    // Remove temporary element
    document.body.removeChild(element);
}


function importList(){
    //console.log("filedata at the start: " + document.getElementById("file-content").value);
    //console.log("input-file at the start: " + document.getElementById("input-file").value);

    if(document.getElementById("input-file").value){
        // Get content
        let fileData = document.getElementById("file-content").textContent;

        //console.log("Before parsing: " + fileData);

        let data = JSON.parse(fileData);

        // Add tasks from file to list of tasks
        for (let i = 0; i < data.length; i++) {
            tasks.push(data[i]);
        }

        // Reset input file and file data
        document.getElementById("input-file").value = "";
        document.getElementById("file-content").textContent = "";

        //console.log("filedata at the end: " + document.getElementById("file-content").value);
        //console.log("input-file at the end: " + document.getElementById("input-file").value);
    }

    updateUI();
}

function addEventListenerInputFile(){
    document.getElementById('input-file').addEventListener('change', handleFileSelect, false);
}
  
function handleFileSelect(event){
    const reader = new FileReader()
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0])
}
  
function handleFileLoad(event){
    console.log(event);
    document.getElementById('file-content').textContent = event.target.result;
}