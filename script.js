document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA (Vitals and Streak remain) ---
    const weeklyVitals = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        systolic: [120, 122, 118, 125, 123, 124, 122],
        diastolic: [80, 81, 79, 82, 80, 82, 81],
    };

    const streakData = {
        current: 14,
        longest: 32,
        last7Days: [true, true, false, true, true, true, true] 
    };
    // login credential
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
    

    // This variable will hold the schedule for today, combining saved and quick-added meds
    let todayMeds = [];

    // --- DYNAMICALLY BUILD TODAY'S SCHEDULE FROM localStorage ---
    const getTodaySchedule = () => {
        const allMeds = JSON.parse(localStorage.getItem('allMeds')) || [];
        const today = new Date();
        const todayDay = today.getDay(); // 0=Sunday, 1=Monday, etc.
        let todaySchedule = [];

        allMeds.forEach(med => {
            let shouldBeTakenToday = false;
            
            if (med.frequency === 'daily') {
                shouldBeTakenToday = true;
            } else if (med.frequency === 'specific_days') {
                if (med.days.includes(todayDay)) {
                    shouldBeTakenToday = true;
                }
            }
            
            if (shouldBeTakenToday) {
                med.times.forEach(time => {
                    todaySchedule.push({
                        name: med.name,
                        dosage: med.dosage,
                        time: time,
                        taken: false // Default to not taken for the day
                    });
                });
            }
        });
        return todaySchedule;
    };


    // --- RENDER FUNCTIONS ---
    const renderMedications = () => {
        const medsList = document.getElementById('meds-list');
        if (!medsList) return;
        medsList.innerHTML = ''; 

        // Sort meds by time
        todayMeds.sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.time}`);
            const timeB = new Date(`1970/01/01 ${b.time}`);
            return timeA - timeB;
        });

        if (todayMeds.length === 0) {
            medsList.innerHTML = `<li class="no-meds">No medications scheduled for today.</li>`;
            return;
        }

        todayMeds.forEach(med => {
            const li = document.createElement('li');
            if (med.taken) {
                li.classList.add('taken');
            }
            li.innerHTML = `
                <div class="med-info">
                    <div class="icon"><i class="fa-solid fa-pills"></i></div>
                    <div class="details">
                        <p>${med.name} (${med.dosage})</p>
                        <small>${med.time}</small>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-taken">Taken</button>
                    <button class="btn-skip">Skip</button>
                </div>
            `;
            medsList.appendChild(li);
        });
    };

    const renderVitalsChart = () => {
        const ctx = document.getElementById('vitalsChart');
        if (!ctx) return;
        new Chart(ctx, { type: 'line', data: { labels: weeklyVitals.labels, datasets: [ { label: 'Systolic (mmHg)', data: weeklyVitals.systolic, borderColor: '#4f46e5', backgroundColor: 'rgba(79, 70, 229, 0.1)', tension: 0.4, fill: true, }, { label: 'Diastolic (mmHg)', data: weeklyVitals.diastolic, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true, } ] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: false, title: { display: true, text: 'Pressure (mmHg)' } } }, plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } } } });
    };

    const renderStreakCard = () => {
        const streakCard = document.getElementById('streak-card');
        if (!streakCard) return;
        const countEl = streakCard.querySelector('.streak-count');
        const labelEl = streakCard.querySelector('.streak-label');
        const longestEl = document.getElementById('longest-streak-val');
        const trackerEl = streakCard.querySelector('.weekly-tracker');
        longestEl.textContent = streakData.longest;
        if (streakData.current === 0) {
            countEl.textContent = '0';
            labelEl.textContent = 'Start a new streak today!';
        } else {
            countEl.textContent = streakData.current;
            labelEl.textContent = streakData.current === 1 ? 'Day in a row!' : 'Days in a row!';
        }
        trackerEl.innerHTML = '';
        streakData.last7Days.forEach((daySuccess) => {
            const dayDot = document.createElement('div');
            dayDot.classList.add('day-dot');
            if (daySuccess) { dayDot.classList.add('active'); }
            trackerEl.appendChild(dayDot);
        });
    };

    // --- EVENT LISTENERS ---
    const addEventListeners = () => {
        const medsList = document.getElementById('meds-list');
        if (!medsList) return;
        medsList.addEventListener('click', (e) => {
            const target = e.target;
            const listItem = target.closest('li');
            if (!listItem || listItem.classList.contains('taken')) return;

            if (target.classList.contains('btn-taken')) {
                listItem.classList.add('taken');
            } else if (target.classList.contains('btn-skip')) {
                 listItem.classList.add('taken');
                 listItem.style.opacity = '0.4';
            }
        });
    };
    
    // --- MODAL FUNCTIONALITY (RESTORED) ---
    // This handles the "quick add" modal on the dashboard
    const setupModal = () => {
        const modalOverlay = document.getElementById('modal-overlay');
        const addMedBtn = document.getElementById('add-med-btn');
        const closeBtn = document.querySelector('.close-btn');
        const addMedForm = document.getElementById('add-med-form');

        if (!modalOverlay || !addMedBtn || !closeBtn || !addMedForm) return;

        addMedBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden');
        });

        const closeModal = () => {
            modalOverlay.classList.add('hidden');
        };

        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        addMedForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const medName = document.getElementById('med-name').value;
            const medDosage = document.getElementById('med-dosage').value;
            const medTime24 = document.getElementById('med-time').value;

            const [hours, minutes] = medTime24.split(':');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            let hours12 = hours % 12;
            hours12 = hours12 ? hours12 : 12; // Hour '0' should be '12'
            const medTime12 = `${String(hours12).padStart(2, '0')}:${minutes} ${ampm}`;

            const newMed = {
                name: medName,
                dosage: medDosage,
                time: medTime12,
                taken: false
            };
            
            // Add the quick-add med to the current day's schedule and re-render
            todayMeds.push(newMed);
            renderMedications(); 
            addMedForm.reset();
            closeModal();
        });
    };

    // --- INITIALIZE DASHBOARD ---
    todayMeds = getTodaySchedule(); // Generate the schedule for today from localStorage
    renderMedications(); // Render the generated schedule
    renderVitalsChart();
    renderStreakCard();
    addEventListeners();
    setupModal(); // Initialize the quick-add modal functionality

});