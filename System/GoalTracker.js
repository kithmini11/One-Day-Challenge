// Goal data structure
class Goal {
    constructor(id, title, description, category, dueDate, priority, milestones = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.dueDate = dueDate;
        this.priority = priority;
        this.milestones = milestones;
        this.progress = 0;
        this.status = 'active';
        this.createdAt = new Date().toISOString();
    }
}

// Goal tracker class
class GoalTracker {
    constructor() {
        this.goals = [];
        this.loadGoals();
        this.initializeEventListeners();
    }

    // Initialize all event listeners
    initializeEventListeners() {
        // Add goal button
        document.getElementById('addGoalBtn').addEventListener('click', () => this.openGoalModal());
        
        // Form submission
        document.getElementById('goalForm').addEventListener('submit', (e) => this.handleGoalSubmit(e));
        
        // Modal close button
        document.querySelector('.close-modal').addEventListener('click', () => this.closeGoalModal());
        document.getElementById('cancelGoal').addEventListener('click', () => this.closeGoalModal());
        
        // Add milestone button
        document.getElementById('addMilestoneBtn').addEventListener('click', () => this.addMilestoneField());
        
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => this.filterGoals());
        document.getElementById('categoryFilter').addEventListener('change', () => this.filterGoals());
        document.getElementById('searchGoals').addEventListener('input', () => this.filterGoals());
    }

    // Load goals from localStorage
    loadGoals() {
        const savedGoals = localStorage.getItem('goals');
        this.goals = savedGoals ? JSON.parse(savedGoals) : [];
        this.renderGoals();
    }

    // Save goals to localStorage
    saveGoals() {
        localStorage.setItem('goals', JSON.stringify(this.goals));
    }

    // Open goal modal
    openGoalModal(goalId = null) {
        const modal = document.getElementById('goalModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('goalForm');

        if (goalId) {
            // Edit existing goal
            const goal = this.goals.find(g => g.id === goalId);
            modalTitle.textContent = 'Edit Goal';
            this.populateGoalForm(goal);
        } else {
            // Add new goal
            modalTitle.textContent = 'Add New Goal';
            form.reset();
            document.getElementById('milestoneContainer').innerHTML = '';
        }

        modal.style.display = 'block';
    }

    // Close goal modal
    closeGoalModal() {
        document.getElementById('goalModal').style.display = 'none';
        document.getElementById('goalForm').reset();
    }

    // Add milestone field to form
    addMilestoneField() {
        const container = document.getElementById('milestoneContainer');
        const milestoneDiv = document.createElement('div');
        milestoneDiv.className = 'milestone-item';
        milestoneDiv.innerHTML = `
            <input type="text" class="milestone-input" placeholder="Enter milestone">
            <button type="button" class="remove-milestone secondary-btn">Remove</button>
        `;

        milestoneDiv.querySelector('.remove-milestone').addEventListener('click', () => {
            container.removeChild(milestoneDiv);
        });

        container.appendChild(milestoneDiv);
    }

    // Handle goal form submission
    handleGoalSubmit(e) {
        e.preventDefault();

        const formData = {
            title: document.getElementById('goalTitle').value,
            description: document.getElementById('goalDescription').value,
            category: document.getElementById('goalCategory').value,
            dueDate: document.getElementById('goalDueDate').value,
            priority: document.getElementById('goalPriority').value,
            milestones: Array.from(document.querySelectorAll('.milestone-input'))
                .map(input => input.value)
                .filter(value => value.trim() !== '')
        };

        const goalId = document.getElementById('goalForm').dataset.goalId;
        
        if (goalId) {
            // Update existing goal
            this.updateGoal(goalId, formData);
        } else {
            // Create new goal
            this.createGoal(formData);
        }

        this.closeGoalModal();
        this.renderGoals();
    }

    // Create new goal
    createGoal(formData) {
        const newGoal = new Goal(
            Date.now().toString(),
            formData.title,
            formData.description,
            formData.category,
            formData.dueDate,
            formData.priority,
            formData.milestones
        );

        this.goals.push(newGoal);
        this.saveGoals();
        this.showNotification('Goal created successfully!');
    }

    // Update existing goal
    updateGoal(goalId, formData) {
        const index = this.goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            this.goals[index] = {
                ...this.goals[index],
                ...formData
            };
            this.saveGoals();
            this.showNotification('Goal updated successfully!');
        }
    }

    // Delete goal
    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            this.goals = this.goals.filter(g => g.id !== goalId);
            this.saveGoals();
            this.renderGoals();
            this.showNotification('Goal deleted successfully!');
        }
    }

    // Toggle goal completion status
    toggleGoalStatus(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.status = goal.status === 'active' ? 'completed' : 'active';
            goal.progress = goal.status === 'completed' ? 100 : 0;
            this.saveGoals();
            this.renderGoals();
            this.showNotification(`Goal marked as ${goal.status}!`);
        }
    }

    // Update goal progress
    updateProgress(goalId, progress) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.progress = Math.min(100, Math.max(0, progress));
            if (goal.progress === 100) {
                goal.status = 'completed';
            }
            this.saveGoals();
            this.renderGoals();
        }
    }

    // Populate form with goal data
    populateGoalForm(goal) {
        const form = document.getElementById('goalForm');
        form.dataset.goalId = goal.id;
        
        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalDescription').value = goal.description;
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalDueDate').value = goal.dueDate;
        document.getElementById('goalPriority').value = goal.priority;

        const milestoneContainer = document.getElementById('milestoneContainer');
        milestoneContainer.innerHTML = '';
        
        goal.milestones.forEach(milestone => {
            const milestoneDiv = document.createElement('div');
            milestoneDiv.className = 'milestone-item';
            milestoneDiv.innerHTML = `
                <input type="text" class="milestone-input" value="${milestone}">
                <button type="button" class="remove-milestone secondary-btn">Remove</button>
            `;

            milestoneDiv.querySelector('.remove-milestone').addEventListener('click', () => {
                milestoneContainer.removeChild(milestoneDiv);
            });

            milestoneContainer.appendChild(milestoneDiv);
        });
    }

    // Filter goals based on current filter settings
    filterGoals() {
        const statusFilter = document.getElementById('statusFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        const searchQuery = document.getElementById('searchGoals').value.toLowerCase();

        const filteredGoals = this.goals.filter(goal => {
            const matchesStatus = statusFilter === 'all' || goal.status === statusFilter;
            const matchesCategory = categoryFilter === 'all' || goal.category === categoryFilter;
            const matchesSearch = goal.title.toLowerCase().includes(searchQuery) ||
                                goal.description.toLowerCase().includes(searchQuery);

            return matchesStatus && matchesCategory && matchesSearch;
        });

        this.renderGoals(filteredGoals);
    }

    // Render goals to the page
    renderGoals(goalsToRender = this.goals) {
        const container = document.getElementById('activeGoals');
        container.innerHTML = '';

        goalsToRender.forEach(goal => {
            const goalElement = this.createGoalElement(goal);
            container.appendChild(goalElement);
        });
    }

    // Create goal element
    createGoalElement(goal) {
        const goalDiv = document.createElement('div');
        goalDiv.className = 'goal-card';
        goalDiv.innerHTML = `
            <h3>${goal.title}</h3>
            <div class="goal-meta">
                <span class="category">${goal.category}</span>
                <span class="priority priority-${goal.priority}">${goal.priority}</span>
            </div>
            <p>${goal.description}</p>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <span>${goal.progress}%</span>
            </div>
            <div class="milestone-list">
                ${goal.milestones.map(milestone => `
                    <div class="milestone">
                        <input type="checkbox" ${goal.status === 'completed' ? 'checked' : ''}>
                        <span>${milestone}</span>
                    </div>
                `).join('')}
            </div>
            <div class="goal-actions">
                <button onclick="goalTracker.toggleGoalStatus('${goal.id}')" class="secondary-btn">
                    ${goal.status === 'active' ? 'Complete' : 'Reactivate'}
                </button>
                <button onclick="goalTracker.openGoalModal('${goal.id}')" class="secondary-btn">Edit</button>
                <button onclick="goalTracker.deleteGoal('${goal.id}')" class="secondary-btn">Delete</button>
            </div>
        `;

        return goalDiv;
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

// Initialize goal tracker
const goalTracker = new GoalTracker();

// Handle window click to close modal
window.onclick = function(event) {
    const modal = document.getElementById('goalModal');
    if (event.target === modal) {
        goalTracker.closeGoalModal();
    }
};