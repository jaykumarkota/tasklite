/**
 * Member 3 contract: render tasks in #task-list-container.
 * Call actions.onToggle(task.id, checkbox.checked) and actions.onDelete(task.id).
 */
export function renderTaskList(tasks, actions) {
  const container = document.querySelector('#task-list-container');
  if (!container) {
    throw new Error('Task List module requires #task-list-container.');
  }

  if (!Array.isArray(tasks)) {
    throw new TypeError('renderTaskList requires an array of tasks.');
  }

  const callbacks = actions || {};
  container.replaceChildren();
  container.setAttribute('aria-label', 'Task list');

  if (tasks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'task-list-empty';
    emptyState.setAttribute('role', 'status');
    emptyState.innerHTML = '<span class="task-list-empty__mark" aria-hidden="true">&#10003;</span>';
    const message = document.createElement('p');
    message.textContent = 'Nothing on your list yet. Add a task to get started.';
    emptyState.append(message);
    container.append(emptyState);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'task-list';

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = 'task-card';
    if (task.completed) item.classList.add('is-completed');

    const completion = document.createElement('input');
    completion.className = 'task-card__completion';
    completion.type = 'checkbox';
    completion.checked = Boolean(task.completed);
    completion.setAttribute('aria-label', `Mark ${task.title} as ${task.completed ? 'pending' : 'completed'}`);
    completion.dataset.taskAction = 'toggle';
    completion.dataset.taskId = String(task.id);

    const content = document.createElement('div');
    content.className = 'task-card__content';

    const heading = document.createElement('div');
    heading.className = 'task-card__heading';
    const title = document.createElement('h3');
    title.className = 'task-card__title';
    title.textContent = task.title || 'Untitled task';
    const priority = document.createElement('span');
    const priorityName = ['Low', 'Medium', 'High'].includes(task.priority) ? task.priority : 'Medium';
    priority.className = `task-priority task-priority--${priorityName.toLowerCase()}`;
    priority.textContent = priorityName;
    heading.append(title, priority);

    const description = document.createElement('p');
    description.className = 'task-card__description';
    description.textContent = task.description || 'No description provided.';
    content.append(heading, description);

    const status = document.createElement('span');
    status.className = 'task-card__status';
    status.textContent = task.completed ? 'Completed' : 'Pending';
    status.setAttribute('aria-live', 'polite');

    const remove = document.createElement('button');
    remove.className = 'task-card__delete';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.title || 'task'}`);
    remove.dataset.taskAction = 'delete';
    remove.dataset.taskId = String(task.id);

    item.append(completion, content, status, remove);
    list.append(item);
  });

  list.addEventListener('change', (event) => {
    const control = event.target.closest('[data-task-action="toggle"]');
    if (control && list.contains(control) && typeof callbacks.onToggle === 'function') {
      callbacks.onToggle(Number(control.dataset.taskId), control.checked);
    }
  });

  list.addEventListener('click', (event) => {
    const control = event.target.closest('[data-task-action="delete"]');
    if (control && list.contains(control) && typeof callbacks.onDelete === 'function') {
      callbacks.onDelete(Number(control.dataset.taskId));
    }
  });

  container.append(list);
}

export const initializeTaskList = renderTaskList;
