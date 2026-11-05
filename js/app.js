import { initializeAddTask } from './add-task.js';
import { renderTaskList } from './task-list.js';
import { initializeFilters } from './filters.js';
import { initializeTheme } from './theme.js';

export const STORAGE_KEY = 'tasklite.tasks';
/** @type {Array<{id:number,title:string,description:string,priority:'Low'|'Medium'|'High',completed:boolean,createdAt:string}>} */
let tasks = loadTasks();

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch { return []; }
}
function persistTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
export function getTasks() { return [...tasks]; }

/** Adds a validated task object supplied by Member 2 and returns the new task. */
export function addTask(taskInput) {
  const task = { id: Date.now(), completed: false, createdAt: new Date().toISOString(), ...taskInput };
  tasks.push(task); persistTasks(); refreshDashboard(); return task;
}
/** Sets completion for a task ID. Returns the updated task, or null if absent. */
export function updateTaskCompletion(id, completed) {
  const task = tasks.find((item) => item.id === Number(id));
  if (!task) return null;
  task.completed = Boolean(completed); persistTasks(); refreshDashboard(); return task;
}
/** Removes a task by ID. Returns true only when a task was removed. */
export function deleteTask(id) {
  const before = tasks.length; tasks = tasks.filter((task) => task.id !== Number(id));
  if (tasks.length === before) return false;
  persistTasks(); refreshDashboard(); return true;
}
/** Applies Member 4's predicate or filter function without changing stored tasks. */
export function filterTasks(filter) { return typeof filter === 'function' ? tasks.filter(filter) : getTasks(); }
/** Updates the dashboard's aggregate values for the given task collection. */
export function updateDashboardStatistics(taskCollection = tasks) {
  const stats = { total: taskCollection.length, completed: taskCollection.filter((t) => t.completed).length, active: taskCollection.filter((t) => !t.completed).length, high: taskCollection.filter((t) => t.priority === 'High').length };
  Object.entries(stats).forEach(([name, value]) => { const node = document.querySelector(`[data-stat="${name}"]`); if (node) node.textContent = value; });
  const summary = document.querySelector('#stats-summary'); if (summary) summary.textContent = `${stats.active} task${stats.active === 1 ? '' : 's'} remaining`;
  return stats;
}
function refreshDashboard() { updateDashboardStatistics(); renderTaskList(getTasks(), taskActions); }
const taskActions = { onToggle: updateTaskCompletion, onDelete: deleteTask };

initializeAddTask({ onSubmit: addTask });
initializeFilters({ tasks: getTasks, onChange: (filter) => renderTaskList(filterTasks(filter), taskActions) });
initializeTheme();
refreshDashboard();
