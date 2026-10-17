const media = window.matchMedia('(prefers-color-scheme: dark)');

function storedTheme(): 'dark' | 'light' | null {
  const stored = localStorage.getItem('theme');
  return stored === 'dark' || stored === 'light' ? stored : null;
}

function preferredTheme(): 'dark' | 'light' {
  return storedTheme() ?? (media.matches ? 'dark' : 'light');
}

function applyTheme(theme: 'dark' | 'light') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function initTheme() {
  applyTheme(preferredTheme());
}

function handleToggleClick() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('theme', next);
}

initTheme();
document.addEventListener('astro:after-swap', initTheme);
media.addEventListener('change', () => {
  if (!storedTheme()) applyTheme(media.matches ? 'dark' : 'light');
});

document.addEventListener('astro:page-load', () => {
  const button = document.getElementById('themeToggle');
  if (!button || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';
  button.addEventListener('click', handleToggleClick);
});
