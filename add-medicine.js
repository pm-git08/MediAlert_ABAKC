document.addEventListener('DOMContentLoaded', () => {
    const frequencySelect = document.getElementById('med-frequency');
    const daySelector = document.getElementById('day-selector');
    const addTimeBtn = document.getElementById('add-time-btn');
    const timeList = document.getElementById('time-list');
    const form = document.getElementById('new-med-form');

    const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');
    
    // If no one is logged in, redirect to the login page
    if (!loggedInUserEmail) {
        window.location.href = 'login.html';
        return; // Stop the script from running further
    }

    // Load settings specific to the logged-in user
    const userSettings = JSON.parse(localStorage.getItem(`userSettings_${loggedInUserEmail}`)) || {};
    const displayName = userSettings.userName || 'Guest';
    
    // Update sidebar
    document.getElementById('sidebar-user-name').textContent = displayName;
    document.getElementById('sidebar-user-email').textContent = loggedInUserEmail;
    

    // Show/hide the day selector based on frequency
    frequencySelect.addEventListener('change', () => {
        if (frequencySelect.value === 'specific_days') {
            daySelector.classList.remove('hidden');
        } else {
            daySelector.classList.add('hidden');
        }
    });

    // Add another time input field
    addTimeBtn.addEventListener('click', () => {
        const newTimeInput = document.createElement('input');
        newTimeInput.type = 'time';
        newTimeInput.classList.add('med-time');
        timeList.appendChild(newTimeInput);
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Get existing medications from localStorage or create empty array
        const allMeds = JSON.parse(localStorage.getItem('allMeds')) || [];

        // 2. Collect data from the form
        const selectedDays = [];
        if (frequencySelect.value === 'specific_days') {
            document.querySelectorAll('input[name="day"]:checked').forEach(checkbox => {
                selectedDays.push(parseInt(checkbox.value));
            });
        }

        const times = [];
        document.querySelectorAll('.med-time').forEach(timeInput => {
            if (timeInput.value) {
                // Convert 24h to 12h AM/PM format
                const [hours, minutes] = timeInput.value.split(':');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                let hours12 = hours % 12;
                hours12 = hours12 ? hours12 : 12; // Hour '0' should be '12'
                const formattedTime = `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;
                times.push(formattedTime);
            }
        });
        
        const newMed = {
            id: Date.now(), // Unique ID for the medication
            name: document.getElementById('med-name').value,
            dosage: document.getElementById('med-dosage').value,
            frequency: frequencySelect.value,
            days: selectedDays, // Array of day numbers (0=Sun, 1=Mon...)
            times: times, // Array of times
        };

        // 3. Add new medication to the array
        allMeds.push(newMed);

        // 4. Save the updated array back to localStorage
        localStorage.setItem('allMeds', JSON.stringify(allMeds));

        // 5. Redirect back to the dashboard
        window.location.href = 'index.html';
    });
});