const FILTERS = [
  { value: 'all', label: 'All Tasks' },
  { value: 'pending', label: 'Pending Tasks' },
  { value: 'completed', label: 'Completed Tasks' }
];

export function createTaskFilter(searchText = '', status = 'all') {
  const query = searchText.trim().toLowerCase();
  const selectedStatus = FILTERS.some((filter) => filter.value === status) ? status : 'all';

  return (task) => {
    const title = typeof task?.title === 'string' ? task.title.toLowerCase() : '';
    const matchesSearch = title.includes(query);
    const matchesStatus = selectedStatus === 'all'
      || (selectedStatus === 'completed' ? Boolean(task?.completed) : !task?.completed);
    return matchesSearch && matchesStatus;
  };
}

/**
 * Mounts search and status filters in #filters-container.
 * `tasks` may be the current task array or a getter returning it.
 * Calls onChange with a task predicate whenever the search or status changes.
 */
export function initializeFilters({ tasks, onChange } = {}) {
  const container = document.querySelector('#filters-container');
  if (!container) {
    throw new Error('Search and Filters module requires #filters-container.');
  }
  if (!Array.isArray(tasks) && typeof tasks !== 'function') {
    throw new TypeError('initializeFilters requires a task array or task getter.');
  }
  if (typeof onChange !== 'function') {
    throw new TypeError('initializeFilters requires an onChange callback.');
  }

  let selectedStatus = 'all';

  const controls = document.createElement('div');
  controls.className = 'filters-controls';

  const searchLabel = document.createElement('label');
  searchLabel.className = 'filters-search';
  searchLabel.htmlFor = 'task-search';
  searchLabel.textContent = 'Search tasks';

  const searchInput = document.createElement('input');
  searchInput.className = 'filters-search__input';
  searchInput.id = 'task-search';
  searchInput.type = 'search';
  searchInput.placeholder = 'Search by task title';
  searchInput.autocomplete = 'off';
  searchInput.setAttribute('aria-label', 'Search tasks by title');
  searchLabel.append(searchInput);

  const filterGroup = document.createElement('div');
  filterGroup.className = 'filters-tabs';
  filterGroup.setAttribute('role', 'group');
  filterGroup.setAttribute('aria-label', 'Filter tasks by status');

  const filterButtons = FILTERS.map(({ value, label }) => {
    const button = document.createElement('button');
    button.className = 'filters-tab';
    button.type = 'button';
    button.dataset.filter = value;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(value === selectedStatus));
    if (value === selectedStatus) button.classList.add('is-active');
    filterGroup.append(button);
    return button;
  });

  const emptyResults = document.createElement('p');
  emptyResults.className = 'filters-empty';
  emptyResults.setAttribute('role', 'status');
  emptyResults.setAttribute('aria-live', 'polite');
  emptyResults.hidden = true;

  controls.append(searchLabel, filterGroup);
  container.replaceChildren(controls, emptyResults);

  function updateResults() {
    const currentTasks = typeof tasks === 'function' ? tasks() : tasks;
    if (!Array.isArray(currentTasks)) {
      throw new TypeError('The task getter must return an array.');
    }

    const predicate = createTaskFilter(searchInput.value, selectedStatus);
    const resultCount = currentTasks.filter(predicate).length;
    const hasActiveFilter = searchInput.value.trim().length > 0 || selectedStatus !== 'all';
    emptyResults.hidden = resultCount !== 0 || (currentTasks.length === 0 && !hasActiveFilter);
    if (!emptyResults.hidden) {
      emptyResults.textContent = 'No tasks match the selected search or filter.';
    }
    onChange(predicate);
  }

  searchInput.addEventListener('input', updateResults);
  filterGroup.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filterGroup.contains(button)) return;

    selectedStatus = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isSelected = filterButton.dataset.filter === selectedStatus;
      filterButton.classList.toggle('is-active', isSelected);
      filterButton.setAttribute('aria-pressed', String(isSelected));
    });
    updateResults();
  });

  updateResults();
}
