# TaskLite

TaskLite is a small, frontend-only task management dashboard built to demonstrate a five-person GitHub workflow. It uses HTML5, CSS3, ES6 modules, and browser LocalStorage—no backend or dependencies.

## Run locally

Open `index.html` in a modern browser, or serve the `tasklite` folder with a static server. For example, if Python is installed:

```powershell
cd tasklite
py -m http.server 5500
```

Then visit `http://localhost:5500`.

## Project structure

```
tasklite/
├── index.html              # Dashboard shell and module mount points
├── css/
│   ├── style.css           # Shared layout, variables, and responsive styles
│   ├── add-task.css        # Member 2
│   ├── task-list.css       # Member 3
│   ├── filters.css         # Member 4
│   └── theme.css           # Member 5
└── js/
    ├── app.js              # Team Lead: state, persistence, integration, statistics
    ├── add-task.js         # Member 2
    ├── task-list.js        # Member 3
    ├── filters.js          # Member 4
    └── theme.js            # Member 5
```

## Ownership and interfaces

| Owner | Files / mount point | Responsibility |
| --- | --- | --- |
| Team Lead | `index.html`, `css/style.css`, `js/app.js` | Dashboard, task state, LocalStorage, integration, and statistics |
| Member 2 | `js/add-task.js`, `css/add-task.css`, `#add-task-container` | Add-task form and client-side validation |
| Member 3 | `js/task-list.js`, `css/task-list.css`, `#task-list-container` | Task display, completion and delete controls |
| Member 4 | `js/filters.js`, `css/filters.css`, `#filters-container` | Search and filter controls |
| Member 5 | `js/theme.js`, `css/theme.css` | Theme switching and UI polish |

`app.js` is the only module that owns the task array and LocalStorage key (`tasklite.tasks`). The task shape is:

```js
{ id: number, title: string, description: string, priority: 'Low' | 'Medium' | 'High', completed: boolean, createdAt: string }
```

- Member 2 calls `onSubmit({ title, description, priority })` received by `initializeAddTask`; `app.js` creates the remaining fields through `addTask`.
- Member 3 receives `renderTaskList(tasks, { onToggle, onDelete })`; call `onToggle(id, completed)` and `onDelete(id)` from its controls.
- Member 4 calls `onChange(predicate)` from `initializeFilters`; the predicate receives a task and returns whether it is visible.
- `app.js` exposes `addTask`, `updateTaskCompletion`, `deleteTask`, `filterTasks`, `getTasks`, and `updateDashboardStatistics` for integration and testing.

## Contribution workflow

1. Create a focused branch: `git switch -c feature/add-task`.
2. Work only in your owned files unless the team lead agrees otherwise.
3. Keep module exports and contracts above stable; coordinate before changing them.
4. Test with a static server, then commit with a clear message.
5. Open a pull request for review before merging.
