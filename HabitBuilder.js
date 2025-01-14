// Habit data structure
class Habit {
    constructor(id, name, description, category, frequency, reminderTime) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.frequency = frequency;
        this.reminderTime = reminderTime;
        this.status = 'active';
        this.streak = 0;
        this.longestStreak = 0;
        this.completedDates = [];
        this.createdAt = new Date().toISOString();
    }
}

// Habit builder class
class HabitBuilder {
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
            const habit = this.habits.find(h => h.id === habitId);
            form.elements['habitId'].value = habit.id;
            form.elements['name'].value = habit.name;
            form.elements['description'].value = habit.description;
            form.elements['category'].value = habit.category;
            form.elements['frequency'].value = habit.frequency;
            form.elements['reminderTime'].value = habit.reminderTime;
            modalTitle.textContent = 'Edit Habit';
        } else {
            form.reset();
            form.elements['habitId'].value = '';
            modalTitle.textContent = 'Add New Habit';
        }

        modal.style.display = 'block';
    }

    // Close habit modal
    closeHabitModal() {
        const modal = document.getElementById('habitModal');
        modal.style.display = 'none';
    }

    // Handle habit form submission
    handleHabitSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const habitId = form.elements['habitId'].value;
        const name = form.elements['name'].value;
        const description = form.elements['description'].value;
        const category = form.elements['category'].value;
        const frequency = form.elements['frequency'].value;
        const reminderTime = form.elements['reminderTime'].value;

        if (habitId) {
            const habit = this.habits.find(h => h.id === habitId);
            habit.name = name;
            habit.description = description;
            habit.category = category;
            habit.frequency = frequency;
            habit.reminderTime = reminderTime;
        } else {
            const newHabit = new Habit(Date.now().toString(), name, description, category, frequency, reminderTime);
            this.habits.push(newHabit);
        }

        this.saveHabits();
        this.renderHabits();
        this.closeHabitModal();
    }

    // Render habits
    renderHabits() {
        const habitList = document.getElementById('habitList');
        habitList.innerHTML = '';

        this.habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            habitItem.innerHTML = `
                <h3>${habit.name}</h3>
                <p>${habit.description}</p>
                <p>Category: ${habit.category}</p>
                <p>Frequency: ${habit.frequency}</p>
                <p>Reminder Time: ${habit.reminderTime}</p>
                <button onclick="habitBuilder.editHabit('${habit.id}')">Edit</button>
                <button onclick="habitBuilder.deleteHabit('${habit.id}')">Delete</button>
            `;
            habitList.appendChild(habitItem);
        });
    }

    // Edit habit
    editHabit(habitId) {
        this.openHabitModal(habitId);
    }

    // Delete habit
    deleteHabit(habitId) {
        this.habits = this.habits.filter(h => h.id !== habitId);
        this.saveHabits();
        this.renderHabits();
    }

    // Filter habits
    filterHabits() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchHabits').value.toLowerCase();

        const filteredHabits = this.habits.filter(habit => {
            const matchesStatus = statusFilter === 'all' || habit.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || habit.category === categoryFilter;
            const matchesSearch = habit.name.toLowerCase().includes(searchQuery) || habit.description.toLowerCase().includes(searchQuery);
            return matchesStatus && matchesCategory && matchesSearch;
        });

        this.renderFilteredHabits(filteredHabits);
    }

    // Render filtered habits
    renderFilteredHabits(habits) {
        const habitList = document.getElementById('habitList');
        habitList.innerHTML = '';

        habits.forEach(habit => {
            const habitItem = document.createElement('div');
            habitItem.className = 'habit-item';
            habitItem.innerHTML = `
                <h3>${habit.name}</h3>
                <p>${habit.description}</p>
                <p>Category: ${habit.category}</p>
                <p>Frequency: ${habit.frequency}</p>
                <p>Reminder Time: ${habit.reminderTime}</p>
                <button onclick="habitBuilder.editHabit('${habit.id}')">Edit</button>
                <button onclick="habitBuilder.deleteHabit('${habit.id}')">Delete</button>
            `;
            habitList.appendChild(habitItem);
        });
    }
}

// Initialize HabitBuilder
const habitBuilder = new HabitBuilder();