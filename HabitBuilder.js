// Habit data structure
class Habit {
    constructor(id, title, description, frequency, reminder, category, startDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.frequency = frequency; // daily, weekly, monthly
        this.reminder = reminder;
        this.category = category;
        this.startDate = startDate;
        this.streak = 0;
        this.completionHistory = [];
        this.status = 'active';
        this.createdAt = new Date().toISOString();
    }
}

// Habit tracker class
class HabitTracker {
    constructor() {
        this.habits = [];
        this.loadHabits();
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Add habit button
        document.getElementById('addHabitBtn').addEventListener('click', () => this.openHabitModal());
        
        // Form submission
        document.getElementById('habitForm').addEventListener('submit', (e) => this.handleHabitSubmit(e));
        
        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => this.closeHabitModal());
        document.getElementById('cancelHabit').addEventListener('click', () => this.closeHabitModal());
        
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => this.filterHabits());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterHabits());
        document.getElementById('searchHabits').addEventListener('input', () => this.filterHabits());
    }

    // Load habits from localStorage
    loadHabits() {
        const savedHabits = localStorage.getItem('habits');
        this.habits = savedHabits ? JSON.parse(savedHabits) : [];
        this.renderHabits();
    }

    // Save habits to localStorage
    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    // Open habit modal
    openHabitModal(habitId = null) {
        const modal = document.getElementById('habitModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('habitForm');

        if (habitId) {
            // Edit existing habit
            const habit = this.habits.find(h => h.id === habitId);
            modalTitle.textContent = 'Edit Habit';
            this.populateHabitForm(habit);
        } else {
            // Add new habit
            modalTitle.textContent = 'Add New Habit';
            form.reset();
        }

        modal.style.display = 'block';
    }

    // Close habit modal
    closeHabitModal() {
        document.getElementById('habitModal').style.display = 'none';
        document.getElementById('habitForm').reset();
    }

    // Handle habit form submission
    handleHabitSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('habitTitle').value,
            description: document.getElementById('habitDescription').value,
            frequency: document.getElementById('habitFrequency').value,
            reminder: document.getElementById('habitReminder').value,
            category: document.getElementById('habitCategory').value,
            startDate: document.getElementById('habitStartDate').value
        };

        const habitId = document.getElementById('habitForm').dataset.habitId;
        
        if (habitId) {
            // Update existing habit
            this.updateHabit(habitId, formData);
        } else {
            // Create new habit
            this.createHabit(formData);
        }

        this.closeHabitModal();
        this.renderHabits();
    }

    // Create new habit
    createHabit(formData) {
        const newHabit = new Habit(
            Date.now().toString(),
            formData.title,
            formData.description,
            formData.frequency,
            formData.reminder,
            formData.category,
            formData.startDate
        );

        this.habits.push(newHabit);
        this.saveHabits();
        this.showNotification('Habit created successfully!');
    }

    // Update existing habit
    updateHabit(habitId, formData) {
        const index = this.habits.findIndex(h => h.id === habitId);
        if (index !== -1) {
            this.habits[index] = {
                ...this.habits[index],
                ...formData
            };
            this.saveHabits();
            this.showNotification('Habit updated successfully!');
        }
    }

    // Delete habit
    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.renderHabits();
            this.showNotification('Habit deleted successfully!');
        }
    }

    // Mark habit as complete for today
    markHabitComplete(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (habit) {
            const today = new Date().toISOString().split('T')[0];
            
            if (!habit.completionHistory.includes(today)) {
                habit.completionHistory.push(today);
                this.updateStreak(habit);
                this.saveHabits();
                this.renderHabits();
                this.showNotification('Habit marked as complete!');
            }
        }
    }

    // Update habit streak
    updateStreak(habit) {
        const today = new Date();
        const sortedHistory = habit.completionHistory.sort();
        let streak = 0;
        
        // Calculate streak based on frequency
        switch(habit.frequency) {
            case 'daily':
                for (let i = sortedHistory.length - 1; i >= 0; i--) {
                    const date = new Date(sortedHistory[i]);
                    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
                    
                    if (diffDays <= 1) {
                        streak++;
                    } else {
                        break;
                    }
                }
                break;
                
            case 'weekly':
                // Implementation for weekly streaks
                break;
                
            case 'monthly':
                // Implementation for monthly streaks
                break;
        }
        
        habit.streak = streak;
    }

    // Populate form with habit data
    populateHabitForm(habit) {
        const form = document.getElementById('habitForm');
        form.dataset.habitId = habit.id;
        
        document.getElementById('habitTitle').value = habit.title;
        document.getElementById('habitDescription').value = habit.description;
        document.getElementById('habitFrequency').value = habit.frequency;
        document.getElementById('habitReminder').value = habit.reminder;
        document.getElementById('habitCategory').value = habit.category;
        document.getElementById('habitStartDate').value = habit.startDate;
    }

    // Filter habits based on current filter settings
    filterHabits() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchHabits').value.toLowerCase();

        const filteredHabits = this.habits.filter(habit => {
            const matchesStatus = statusFilter === 'all' || habit.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || habit.category === categoryFilter;
            const matchesSearch = habit.title.toLowerCase().includes(searchQuery) ||
                                habit.description.toLowerCase().includes(searchQuery);

            return matchesStatus && matchesCategory && matchesSearch;
        });

        this.renderHabits(filteredHabits);
    }

    // Render habits to the page
    renderHabits(habitsToRender = this.habits) {
        const container = document.getElementById('activeHabits');
        container.innerHTML = '';

        habitsToRender.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            container.appendChild(habitElement);
        });
    }

    // Create habit element
    createHabitElement(habit) {
        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.completionHistory.includes(today);
        
        const habitDiv = document.createElement('div');
        habitDiv.className = 'habit-card';
        habitDiv.innerHTML = `
            <h3>${habit.title}</h3>
            <div class="habit-meta">
                <span class="category">${habit.category}</span>
                <span class="frequency">${habit.frequency}</span>
            </div>
            <p>${habit.description}</p>
            <div class="habit-stats">
                <span class="streak">Current Streak: ${habit.streak} ${habit.frequency}</span>
                <span class="total">Total Completions: ${habit.completionHistory.length}</span>
            </div>
            <div class="habit-actions">
                <button onclick="habitTracker.markHabitComplete('${habit.id}')" 
                        class="primary-btn" 
                        ${isCompletedToday ? 'disabled' : ''}>
                    ${isCompletedToday ? 'Completed Today' : 'Mark Complete'}
                </button>
                <button onclick="habitTracker.openHabitModal('${habit.id}')" class="secondary-btn">Edit</button>
                <button onclick="habitTracker.deleteHabit('${habit.id}')" class="secondary-btn">Delete</button>
            </div>
        `;

        return habitDiv;
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize habit tracker
const habitTracker = new HabitTracker();

// Handle window click to close modal
window.onclick = function(event) {
    const modal = document.getElementById('habitModal');
    if (event.target === modal) {
        habitTracker.closeHabitModal();
    }
};