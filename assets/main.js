(function(){
  const root = document.documentElement;
  const THEME_KEY = 'theme-preference';
  const saved = localStorage.getItem(THEME_KEY);
  if(saved){
    root.setAttribute('data-theme', saved);
  }else{
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }
  const toggle = document.getElementById('themeToggle');
  if(toggle){
    toggle.addEventListener('click', ()=>{
      const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', current);
      localStorage.setItem(THEME_KEY, current);
    });
  }
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
})();
