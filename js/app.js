import { initializeAddTask } from './add-task.js';
import { renderTaskList } from './task-list.js';
import { initializeFilters } from './filters.js';
import { initializeTheme } from './theme.js';

export const STORAGE_KEY = 'tasklite.tasks';
/** @type {Array<{id:number,title:string,description:string,priority:'Low'|'Medium'|'High',completed:boolean,createdAt:string}>} */
let tasks = loadTasks();
let activeFilter = () => true;

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(savedTasks)) {
      console.error('TaskLite could not load saved tasks: expected an array.');
      return [];
    }
    return savedTasks;
  } catch (error) {
    console.error('TaskLite could not load saved tasks from LocalStorage.', error);
    return [];
  }
}
function saveTasks(nextTasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
  tasks = nextTasks;
  refreshDashboard();
}
export function getTasks() { return [...tasks]; }

/** Adds a validated task object supplied by Member 2 and returns the new task. */
export function addTask(taskInput) {
  let id = Date.now();
  while (tasks.some((existingTask) => existingTask.id === id)) id += 1;
  const task = { ...taskInput, id, completed: false, createdAt: new Date().toISOString() };
  saveTasks([...tasks, task]);
  return task;
}
/** Sets completion for a task ID. Returns the updated task, or null if absent. */
export function updateTaskCompletion(id, completed) {
  const task = tasks.find((item) => item.id === Number(id));
  if (!task) return null;
  const updatedTask = { ...task, completed: Boolean(completed) };
  saveTasks(tasks.map((item) => item.id === task.id ? updatedTask : item));
  return updatedTask;
}
/** Removes a task by ID. Returns true only when a task was removed. */
export function deleteTask(id) {
  const nextTasks = tasks.filter((task) => task.id !== Number(id));
  if (nextTasks.length === tasks.length) return false;
  saveTasks(nextTasks);
  return true;
}
/** Applies Member 4's predicate or filter function without changing stored tasks. */
export function filterTasks(filter) { return typeof filter === 'function' ? tasks.filter(filter) : getTasks(); }
/** Updates the dashboard's aggregate values for the given task collection. */
export function updateDashboardStatistics(taskCollection = tasks) {
  const stats = { total: taskCollection.length, completed: taskCollection.filter((t) => t.completed).length, pending: taskCollection.filter((t) => !t.completed).length, high: taskCollection.filter((t) => t.priority === 'High').length };
  Object.entries(stats).forEach(([name, value]) => { const node = document.querySelector(`[data-stat="${name}"]`); if (node) node.textContent = value; });
  const summary = document.querySelector('#stats-summary'); if (summary) summary.textContent = `${stats.pending} task${stats.pending === 1 ? '' : 's'} remaining`;
  return stats;
}
function refreshDashboard() { updateDashboardStatistics(); renderTaskList(filterTasks(activeFilter), taskActions); }
const taskActions = { onToggle: updateTaskCompletion, onDelete: deleteTask };

initializeAddTask({ onSubmit: addTask });
initializeFilters({
  tasks: getTasks,
  onChange: (filter) => {
    activeFilter = filter;
    renderTaskList(filterTasks(activeFilter), taskActions);
  },
});
initializeTheme();
refreshDashboard();
