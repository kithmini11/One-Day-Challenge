class HabitTracker {
    constructor() {
        this.habits = JSON.parse(localStorage.getItem('habits')) || [];
        this.initializeEventListeners();
        this.updateStats();
        this.renderHabits();
        this.initializeModalStyles();
    }

    initializeModalStyles() {
        // Add modal styles to the document
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            
            .modal-content {
                background: white;
                padding: 2rem;
                border-radius: 1rem;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .modal-input {
                width: 100%;
                margin-bottom: 1rem;
                padding: 0.75rem;
                border: 1px solid #e2e8f0;
                border-radius: 0.5rem;
                font-size: 1rem;
            }
            
            .modal-button {
                flex: 1;
                padding: 0.75rem;
                border: none;
                border-radius: 0.5rem;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .modal-button.primary {
                background: #6366f1;
                color: white;
            }
            
            .modal-button.secondary {
                background: #e2e8f0;
            }
            
            .modal-button:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    initializeEventListeners() {
        document.getElementById('addHabitBtn')?.addEventListener('click', () => this.showAddHabitModal());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.filterHabits());
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.filterHabits());
        document.getElementById('searchHabits')?.addEventListener('input', () => this.filterHabits());
    }

    createModalContainer(content) {
        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = content;
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        return modal;
    }

    createModalHtml(habit = null) {
        return `
            <div class="modal-content">
                <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: bold;">
                    ${habit ? 'Edit' : 'Add New'} Habit
                </h2>
                <input type="text" 
                    id="${habit ? 'editHabitTitle' : 'habitTitle'}" 
                    class="modal-input"
                    value="${habit ? this.escapeHtml(habit.title) : ''}" 
                    placeholder="Habit title">
                    
                <textarea 
                    id="${habit ? 'editHabitDescription' : 'habitDescription'}" 
                    class="modal-input"
                    placeholder="Description"
                    rows="3">${habit ? this.escapeHtml(habit.description) : ''}</textarea>
                    
                <select id="${habit ? 'editHabitCategory' : 'habitCategory'}" class="modal-input">
                    ${this.createCategoryOptions(habit?.category)}
                </select>
                
                ${habit ? `
                    <select id="editHabitStatus" class="modal-input">
                        <option value="active" ${habit.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="paused" ${habit.status === 'paused' ? 'selected' : ''}>Paused</option>
                    </select>
                ` : ''}
                
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button onclick="habitTracker.${habit ? `saveEdit('${habit.id}')` : 'addHabit()'}" 
                        class="modal-button primary">
                        ${habit ? 'Save Changes' : 'Add Habit'}
                    </button>
                    <button onclick="habitTracker.closeModal()" 
                        class="modal-button secondary">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    createCategoryOptions(selectedCategory = null) {
        const categories = ['health', 'productivity', 'mindfulness', 'fitness', 'learning'];
        return categories.map(category => `
            <option value="${category}" ${selectedCategory === category ? 'selected' : ''}>
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
        `).join('');
    }


    initializeEventListeners() {
        document.getElementById('addHabitBtn')?.addEventListener('click', () => this.showAddHabitModal());
        document.getElementById('statusFilter')?.addEventListener('change', () => this.filterHabits());
        document.getElementById('categoryFilter')?.addEventListener('change', () => this.filterHabits());
        document.getElementById('searchHabits')?.addEventListener('input', () => this.filterHabits());
    }

    getCategoryStyle(category) {
        const styles = {
            health: { bg: '#dcfce7', text: '#166534' },
            productivity: { bg: '#dbeafe', text: '#1e40af' },
            mindfulness: { bg: '#f3e8ff', text: '#6b21a8' },
            fitness: { bg: '#fff7ed', text: '#9a3412' },
            learning: { bg: '#fae8ff', text: '#86198f' }
        };
        return styles[category.toLowerCase()] || styles.health;
    }

    updateStats() {
        const totalHabits = this.habits.length;
        const today = new Date().toISOString().split('T')[0];
        const completedToday = this.habits.filter(habit => 
            habit.completionHistory.includes(today)
        ).length;
        const todayProgress = totalHabits ? Math.round((completedToday / totalHabits) * 100) : 0;
        const longestStreak = Math.max(...this.habits.map(h => h.streak), 0);
        const activeStreaks = this.habits.filter(habit => 
            habit.status === 'active'
        ).reduce((acc, habit) => acc + habit.streak, 0);

        document.getElementById('totalHabits')?.textContent = totalHabits;
        document.getElementById('todayProgress')?.textContent = `${todayProgress}%`;
        document.getElementById('longestStreak')?.textContent = longestStreak;
        document.getElementById('activeStreaks')?.textContent = activeStreaks;
    }

    filterHabits() {
        const status = document.getElementById('statusFilter')?.value || 'all';
        const category = document.getElementById('categoryFilter')?.value || 'all';
        const search = (document.getElementById('searchHabits')?.value || '').toLowerCase();

        let filtered = this.habits;

        if (status !== 'all') {
            filtered = filtered.filter(h => h.status === status);
        }
        if (category !== 'all') {
            filtered = filtered.filter(h => h.category === category);
        }
        if (search) {
            filtered = filtered.filter(h => 
                h.title.toLowerCase().includes(search) || 
                h.description.toLowerCase().includes(search)
            );
        }

        this.renderHabits(filtered);
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    createHabitCard(habit) {
        if (!habit || !habit.id) return null;

        const today = new Date().toISOString().split('T')[0];
        const isCompletedToday = habit.completionHistory.includes(today);
        const categoryStyle = this.getCategoryStyle(habit.category);

        const card = document.createElement('div');
        card.className = 'habit-card';
        card.innerHTML = `
            <div class="habit-header">
                <h3 class="habit-title">${this.escapeHtml(habit.title)}</h3>
                <div class="habit-actions">
                    <button class="icon-btn edit-btn" onclick="habitTracker.editHabit('${habit.id}')">✏️</button>
                    <button class="icon-btn delete-btn" onclick="habitTracker.deleteHabit('${habit.id}')">🗑️</button>
                </div>
            </div>
            <p>${this.escapeHtml(habit.description)}</p>
            <span class="habit-category" style="background: ${categoryStyle.bg}; color: ${categoryStyle.text}">
                ${this.escapeHtml(habit.category)}
            </span>
            <div class="habit-streak">🔥 ${habit.streak} day streak</div>
            <button 
                class="complete-btn ${isCompletedToday ? 'completed' : ''}"
                onclick="habitTracker.markComplete('${habit.id}')"
                ${isCompletedToday ? 'disabled' : ''}
            >
                ${isCompletedToday ? '✅ Completed Today' : '⭐ Mark Complete'}
            </button>
        `;
        return card;
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    renderHabits(filteredHabits = this.habits) {
        const grid = document.getElementById('habitsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        filteredHabits.forEach(habit => {
            const card = this.createHabitCard(habit);
            if (card) {
                grid.appendChild(card);
            }
        });
    }

    markComplete(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toISOString().split('T')[0];
        if (!habit.completionHistory.includes(today)) {
            habit.completionHistory.push(today);
            habit.streak += 1;
            this.saveHabits();
            this.updateStats();
            this.renderHabits();
            this.showNotification(`🎉 Great job completing "${this.escapeHtml(habit.title)}"!`);
        }
    }

    showAddHabitModal() {
        const modalHtml = this.createModalHtml();
        const modal = this.createModalContainer(modalHtml);
        document.body.appendChild(modal);
    }

    createModalContainer(content) {
        const modal = document.createElement('div');
        modal.id = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        modal.innerHTML = content;
        return modal;
    }

    createModalHtml(habit = null) {
        return `
            <div style="background: rgba(255, 255, 255, 0.9); padding: 2rem; border-radius: 1rem; max-width: 500px; width: 90%;">
                <h2 style="margin-bottom: 1rem;">${habit ? 'Edit' : 'Add New'} Habit</h2>
                <input type="text" id="${habit ? 'editHabitTitle' : 'habitTitle'}" 
                    value="${habit ? this.escapeHtml(habit.title) : ''}" 
                    placeholder="Habit title" 
                    style="width: 100%; margin-bottom: 1rem; padding: 0.5rem;">
                <textarea id="${habit ? 'editHabitDescription' : 'habitDescription'}" 
                    placeholder="Description" 
                    style="width: 100%; margin-bottom: 1rem; padding: 0.5rem;">${habit ? this.escapeHtml(habit.description) : ''}</textarea>
                ${this.createCategorySelect(habit)}
                ${habit ? this.createStatusSelect(habit) : ''}
                <div style="display: flex; gap: 1rem;">
                    <button onclick="habitTracker.${habit ? `saveEdit('${habit.id}')` : 'addHabit()'}" 
                        style="flex: 1; padding: 0.5rem; background: #6366f1; color: white; border: none; border-radius: 0.5rem;">
                        ${habit ? 'Save' : 'Add'}
                    </button>
                    <button onclick="habitTracker.closeModal()" 
                        style="flex: 1; padding: 0.5rem; background: #e2e8f0; border: none; border-radius: 0.5rem;">
                        Cancel
                    </button>
                </div>
            </div>
        `;
    }

    createCategorySelect(habit = null) {
        const categories = ['health', 'productivity', 'mindfulness', 'fitness', 'learning'];
        return `
            <select id="${habit ? 'editHabitCategory' : 'habitCategory'}" 
                style="width: 100%; margin-bottom: 1rem; padding: 0.5rem;">
                ${categories.map(category => `
                    <option value="${category}" ${habit && habit.category === category ? 'selected' : ''}>
                        ${category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                `).join('')}
            </select>
        `;
    }

    createStatusSelect(habit) {
        return `
            <select id="editHabitStatus" style="width: 100%; margin-bottom: 1rem; padding: 0.5rem;">
                <option value="active" ${habit.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="paused" ${habit.status === 'paused' ? 'selected' : ''}>Paused</option>
            </select>
        `;
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.remove();
        }
    }

    addHabit() {
        const title = document.getElementById('habitTitle')?.value.trim();
        const description = document.getElementById('habitDescription')?.value.trim();
        const category = document.getElementById('habitCategory')?.value;

        if (!title) {
            this.showNotification('Please enter a habit title');
            return;
        }

        const newHabit = {
            id: Date.now().toString(),
            title,
            description,
            category,
            status: 'active',
            streak: 0,
            completionHistory: []
        };

        this.habits.push(newHabit);
        this.saveHabits();
        this.updateStats();
        this.renderHabits();
        this.closeModal();
        this.showNotification('✨ New habit added successfully!');
    }

    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const modalHtml = this.createModalHtml(habit);
        const modal = this.createModalContainer(modalHtml);
        document.body.appendChild(modal);
    }

    saveEdit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const title = document.getElementById('editHabitTitle')?.value.trim();
        if (!title) {
            this.showNotification('Please enter a habit title');
            return;
        }

        habit.title = title;
        habit.description = document.getElementById('editHabitDescription')?.value.trim() || '';
        habit.category = document.getElementById('editHabitCategory')?.value || 'health';
        habit.status = document.getElementById('editHabitStatus')?.value || 'active';

        this.saveHabits();
        this.updateStats();
        this.renderHabits();
        this.closeModal();
        this.showNotification('✅ Habit updated successfully!');
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.updateStats();
            this.renderHabits();
            this.showNotification('🗑️ Habit deleted');
        }
    }

    saveHabits() {
        try {
            localStorage.setItem('habits', JSON.stringify(this.habits));
        } catch (error) {
            console.error('Error saving habits:', error);
            this.showNotification('Error saving habits. Please try again.');
        }
    }
}

// Initialize the habit tracker
const habitTracker = new HabitTracker();