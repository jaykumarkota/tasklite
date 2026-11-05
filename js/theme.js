const THEME_STORAGE_KEY = 'tasklite.theme';
const THEMES = ['light', 'dark'];

/** Applies the saved theme and mounts an accessible theme toggle in the top bar. */
export function initializeTheme() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) {
    throw new Error('Theme module requires .topbar.');
  }

  const root = document.documentElement;
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  let theme = THEMES.includes(savedTheme) ? savedTheme : 'light';
  const actions = document.createElement('div');
  const toggle = document.createElement('button');
  const icon = document.createElement('span');
  const label = document.createElement('span');

  actions.className = 'topbar-actions';
  toggle.type = 'button';
  toggle.className = 'theme-toggle';
  toggle.setAttribute('aria-pressed', String(theme === 'dark'));
  icon.className = 'theme-toggle__icon';
  icon.setAttribute('aria-hidden', 'true');
  label.className = 'theme-toggle__label';
  toggle.append(icon, label);

  function applyTheme(nextTheme) {
    theme = nextTheme;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    toggle.dataset.theme = theme;
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    icon.textContent = theme === 'dark' ? '☾' : '☀';
    label.textContent = `${theme === 'dark' ? 'Dark' : 'Light'} theme`;
    toggle.setAttribute(
      'aria-label',
      `Current theme: ${theme}. Switch to ${theme === 'dark' ? 'light' : 'dark'} theme.`,
    );
  }

  applyTheme(theme);
  toggle.addEventListener('click', () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  });

  const profileButton = topbar.querySelector('.profile-button');
  if (profileButton) actions.append(profileButton);
  actions.append(toggle);
  topbar.append(actions);
}
