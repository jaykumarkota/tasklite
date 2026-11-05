/**
 * Renders the task form in #add-task-container and submits valid task details
 * to the callback owned by app.js.
 */
export function initializeAddTask({ onSubmit }) {
  if (typeof onSubmit !== 'function') {
    throw new TypeError('initializeAddTask requires an onSubmit callback.');
  }

  const container = document.querySelector('#add-task-container');
  if (!container) {
    throw new Error('Add Task module requires #add-task-container.');
  }

  container.innerHTML = `
    <form class="add-task-form" novalidate>
      <div class="add-task-form__heading">
        <div>
          <h3>Create a task</h3>
          <p>Capture the details and choose a priority to get started.</p>
        </div>
      </div>

      <div class="add-task-form__fields">
        <div class="add-task-field">
          <label for="add-task-title">Task title <span aria-hidden="true">*</span></label>
          <input
            id="add-task-title"
            name="title"
            type="text"
            placeholder="e.g. Prepare project update"
            autocomplete="off"
            required
            aria-describedby="add-task-title-error"
          />
          <span class="add-task-field__error" id="add-task-title-error"></span>
        </div>

        <div class="add-task-field">
          <label for="add-task-priority">Priority</label>
          <select id="add-task-priority" name="priority">
            <option value="Low">Low</option>
            <option value="Medium" selected>Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div class="add-task-field add-task-field--full">
          <label for="add-task-description">Description <span aria-hidden="true">*</span></label>
          <textarea
            id="add-task-description"
            name="description"
            rows="4"
            placeholder="Add a few details about this task"
            required
            aria-describedby="add-task-description-error"
          ></textarea>
          <span class="add-task-field__error" id="add-task-description-error"></span>
        </div>
      </div>

      <div class="add-task-form__footer">
        <p class="add-task-form__feedback" role="status" aria-live="polite"></p>
        <button class="add-task-form__submit" type="submit">Add task</button>
      </div>
    </form>
  `;

  const form = container.querySelector('.add-task-form');
  const titleInput = form.elements.title;
  const descriptionInput = form.elements.description;
  const priorityInput = form.elements.priority;
  const feedback = form.querySelector('.add-task-form__feedback');
  const fields = [
    { input: titleInput, error: form.querySelector('#add-task-title-error'), label: 'Task title' },
    {
      input: descriptionInput,
      error: form.querySelector('#add-task-description-error'),
      label: 'Description',
    },
  ];
  let hasSubmitted = false;

  function validateField(field) {
    const isValid = Boolean(field.input.value.trim());
    field.input.setAttribute('aria-invalid', String(!isValid));
    field.error.textContent = isValid ? '' : `${field.label} is required.`;
    return isValid;
  }

  function validateForm() {
    return fields.map(validateField).every(Boolean);
  }

  function updateValidationAfterEdit() {
    if (!hasSubmitted) return;
    const isValid = validateForm();
    feedback.textContent = isValid ? '' : 'Please complete the required fields.';
    if (isValid) feedback.removeAttribute('data-state');
    else feedback.dataset.state = 'error';
  }

  fields.forEach(({ input }) => {
    input.addEventListener('input', updateValidationAfterEdit);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hasSubmitted = true;
    feedback.textContent = '';
    feedback.removeAttribute('data-state');

    if (!validateForm()) {
      feedback.textContent = 'Please complete the required fields.';
      feedback.dataset.state = 'error';
      fields.find(({ input }) => !input.value.trim()).input.focus();
      return;
    }

    const taskInput = {
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      priority: priorityInput.value,
    };

    try {
      onSubmit(taskInput);
    } catch (error) {
      feedback.textContent = 'The task could not be added. Please try again.';
      feedback.dataset.state = 'error';
      console.error('TaskLite could not add the task.', error);
      return;
    }

    form.reset();
    fields.forEach(({ input, error }) => {
      input.removeAttribute('aria-invalid');
      error.textContent = '';
    });
    hasSubmitted = false;
    feedback.textContent = 'Task added successfully.';
    feedback.dataset.state = 'success';
    titleInput.focus();
  });
}
