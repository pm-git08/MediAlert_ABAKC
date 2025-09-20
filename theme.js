// This script should be loaded in the <head> of all your HTML files
// to prevent a "flash" of the wrong theme on page load.

(function() {
    function applyTheme(theme) {
        if (theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    function applyTextSize(size) {
        document.documentElement.setAttribute('data-text-size', size || 'normal');
    }

    const savedTheme = localStorage.getItem('theme') || 'system';
    const savedTextSize = localStorage.getItem('textSize') || 'normal';

    applyTheme(savedTheme);
    applyTextSize(savedTextSize);
})();