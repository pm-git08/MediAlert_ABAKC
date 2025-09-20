document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const settingsForm = document.getElementById('settings-form');
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserEmail = document.getElementById('sidebar-user-email');

    const notifReminders = document.getElementById('notif-reminders');
    const notifStreak = document.getElementById('notif-streak');
    
    const themeSelector = document.getElementById('theme-selector');
    const textSizeSelector = document.getElementById('text-size-selector');

    // Get the currently logged-in user's email
    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

    // --- Main Functions ---
    const loadSettings = () => {
        if (!loggedInUserEmail) {
            // If no user is logged in, redirect to login page
            window.location.href = 'login.html';
            return;
        }

        // Load settings specific to the logged-in user
        const settings = JSON.parse(localStorage.getItem(`userSettings_${loggedInUserEmail}`)) || {};
        
        // --- Profile Section ---
        // The name is blank ('') if it has never been set
        userNameInput.value = settings.userName || '';
        // The email is always the one the user logged in with
        userEmailInput.value = loggedInUserEmail;
        
        // Update the sidebar display
        sidebarUserName.textContent = settings.userName || 'Guest';
        sidebarUserEmail.textContent = loggedInUserEmail;

        // --- Notifications Section (using ?? for default values) ---
        notifReminders.checked = settings.notifications?.reminders ?? true;
        notifStreak.checked = settings.notifications?.streak ?? true;

        // --- Appearance Section ---
        const theme = localStorage.getItem('theme') || 'system';
        themeSelector.querySelector('.active')?.classList.remove('active');
        themeSelector.querySelector(`[data-value="${theme}"]`).classList.add('active');
        
        const textSize = localStorage.getItem('textSize') || 'normal';
        textSizeSelector.querySelector('.active')?.classList.remove('active');
        textSizeSelector.querySelector(`[data-value="${textSize}"]`).classList.add('active');
    };

    const saveSettings = (e) => {
        e.preventDefault();
        // Create a settings object with the current values
        const newSettings = {
            userName: userNameInput.value,
            // We don't need to save the email as it's our key, but it's harmless
            userEmail: loggedInUserEmail, 
            notifications: {
                reminders: notifReminders.checked,
                streak: notifStreak.checked,
            }
        };
        // Save the settings using the email as a unique key
        localStorage.setItem(`userSettings_${loggedInUserEmail}`, JSON.stringify(newSettings));

        // Update sidebar in real-time
        sidebarUserName.textContent = userNameInput.value || 'Guest';
        sidebarUserEmail.textContent = loggedInUserEmail;
        
        // Show a temporary success message on the save button
        const saveButton = settingsForm.querySelector('.submit-btn');
        saveButton.textContent = 'Saved!';
        saveButton.style.backgroundColor = 'var(--secondary-color)'; // Green feedback
        setTimeout(() => {
            saveButton.textContent = 'Save Changes';
            saveButton.style.backgroundColor = 'var(--primary-color)';
        }, 2000);
    };

    // --- Event Listeners ---
    settingsForm.addEventListener('submit', saveSettings);
    
    themeSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const theme = e.target.dataset.value;
            localStorage.setItem('theme', theme);
            themeSelector.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
            applyTheme(theme);
        }
    });

    textSizeSelector.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const size = e.target.dataset.value;
            localStorage.setItem('textSize', size);
            document.documentElement.setAttribute('data-text-size', size);
            textSizeSelector.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');
        }
    });
    
    // --- Initial Load ---
    loadSettings();
});

function applyTheme(theme) {
    if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}