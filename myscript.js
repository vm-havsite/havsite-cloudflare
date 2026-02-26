// Apply theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.getElementById('html-root').classList.add('dark-mode');
    }
  
  // Toggle theme and save preference to localStorage
  function toggleTheme() {
    const htmlRoot = document.getElementById('html-root');
    if (htmlRoot.classList.contains('dark-mode')) {
      htmlRoot.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      htmlRoot.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    location.reload();
  }