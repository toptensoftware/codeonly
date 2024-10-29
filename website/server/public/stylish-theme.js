if (!window.stylish)
    window.stylish = new EventTarget();


(function()
{
    let D = 'dark';
    let A = 'auto';
    let L = 'light';

    // Load a theme - either D, L or A
    window.stylish.loadTheme = function(name)
    {
        let cl = document.documentElement.classList;
        cl.remove(D, L);
        if (name != A)
            cl.add(name);
    };

    // Query preferred theme
    let prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Listen for preferred theme changes
    prefersDark.addEventListener('change', event => {
        let wasDarkMode = window.stylish.darkMode;
        preferredTheme = prefersDark.matches ? D : L;
        selectedTheme = A;
        setTheme();
        window.stylish.setThemeSwitches();
        if (wasDarkMode != window.stylish.darkMode)
            fireDarkModeChange();
    });

    // Retrieve the currently selected theme
    let selectedTheme = window.localStorage.getItem("stylish-theme") ?? A;
    let preferredTheme = prefersDark.matches ? D : L;
    if (preferredTheme == selectedTheme)
        selectedTheme = "auto";

    setTheme();

    // Check/uncheck all ".theme-switch"s
    function setTheme()
    {
        window.stylish.loadTheme(selectedTheme);
        window.localStorage.setItem("stylish-theme", selectedTheme);
    }

    // Set all theme switches
    window.stylish.setThemeSwitches = function()
    {
        document.querySelectorAll("input[type=checkbox].theme-switch").forEach(x => {
            x.checked = window.stylish.darkMode
        });
    }

    Object.defineProperty(window.stylish, "darkMode", {
        get() {
            return selectedTheme == D || 
                    (selectedTheme == A && preferredTheme == D);
        }
    });

    function fireDarkModeChange()
    {
        let ev = new Event("darkModeChanged");
        ev.darkMode = window.stylish.darkMode;
        window.stylish.dispatchEvent(ev);
    }


    window.stylish.toggleTheme = function()
    {
        if (selectedTheme == A)
            selectedTheme = preferredTheme == D ? L : D;
        else
            selectedTheme = A;
        setTheme();
        window.stylish.setThemeSwitches();
        fireDarkModeChange();
    }


})();