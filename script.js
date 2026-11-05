"use strict";

const STORAGE_KEY = "taskboard.tasks";
const PRIORITY_LABELS = { low: "Низький", medium: "Середній", high: "Високий" };

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const priorityInput = document.querySelector("#priority");
const deadlineInput = document.querySelector("#deadline");
const descriptionInput = document.querySelector("#description");
const message = document.querySelector("#form-message");
const list = document.querySelector("#task-list");
const counter = document.querySelector("#counter");

let tasks = loadTasks();
render();

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();

    if (title === "") {
        message.textContent = "Введи назву задачі";
        titleInput.focus();
        return;
    }

    tasks.push({
        id: nextId(),
        title: title,
        priority: priorityInput.value,
        deadline: deadlineInput.value,
        description: descriptionInput.value.trim(),
        done: false,
    });

    form.reset();
    message.textContent = "";
    saveTasks();
    render();
});

list.addEventListener("click", (event) => {
    const item = event.target.closest(".task");
    if (!item) {
        return;
    }

    const id = Number(item.dataset.id);

    if (event.target.matches(".toggle")) {
        const task = tasks.find((t) => t.id === id);
        if (task) {
            task.done = !task.done;
        }
    } else if (event.target.matches(".delete")) {
        tasks = tasks.filter((t) => t.id !== id);
    } else {
        return;
    }

    saveTasks();
    render();
});

function nextId() {
    return tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        // сховище недоступне
    }
}

function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = `task priority-${task.priority}` + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "toggle";
    check.checked = task.done;
    check.setAttribute("aria-label", "Виконано");

    const body = document.createElement("div");
    body.className = "task-body";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;
    body.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "task-meta";
    const parts = [`Пріоритет: ${PRIORITY_LABELS[task.priority]}`];
    if (task.deadline) {
        parts.push(`Термін: ${task.deadline}`);
    }
    meta.textContent = parts.join(" · ");
    body.appendChild(meta);

    if (task.description) {
        const desc = document.createElement("p");
        desc.className = "task-desc";
        desc.textContent = task.description;
        body.appendChild(desc);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "delete";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Видалити задачу");

    li.append(check, body, remove);
    return li;
}

function render() {
    list.innerHTML = "";
    tasks.forEach((task) => list.appendChild(createTaskElement(task)));
    const done = tasks.filter((t) => t.done).length;
    counter.textContent =
        tasks.length === 0 ? "Задач немає" : `Усього: ${tasks.length}, виконано: ${done}`;
}