document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeBtn');
  const html = document.documentElement; // Usamos html en lugar de body
  
  // Cargar tema guardado o usar preferencia del sistema
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  
  // Aplicar tema inicial
  html.setAttribute('data-theme', currentTheme);
  updateThemeButton(currentTheme);
  
  // Alternar tema
  themeBtn.addEventListener('click', () => {
    const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  });
  
  function updateThemeButton(theme) {
    themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    themeBtn.title = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }
});

// El código ya alterna correctamente entre modo claro y oscuro.