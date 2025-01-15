// User data structure
const userData = {
    goals: [],
    habits: [],
    statistics: {
        totalGoalsCompleted: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastLogin: null
    }
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data from localStorage
    loadUserData();
    
    // Add fade-in animation to sections
    initializeAnimations();
    
    // Initialize navbar effects
    initializeNavbar();
    
    // Initialize smooth scrolling
    initializeSmoothScroll();
    
    // Initialize logout functionality
    initializeLogout();
    
    // Initialize dashboard features
    initializeDashboard();
    
    // Update statistics
    updateStatistics();
});

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('dashboardUserData');
    if (savedData) {
        Object.assign(userData, JSON.parse(savedData));
    }
    
    // Update last login
    const lastLogin = userData.statistics.lastLogin;
    userData.statistics.lastLogin = new Date().toISOString();
    
    // Calculate streak
    if (lastLogin) {
        const lastLoginDate = new Date(lastLogin);
        const today = new Date();
        const diffDays = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
            userData.statistics.currentStreak++;
            userData.statistics.longestStreak = Math.max(
                userData.statistics.currentStreak,
                userData.statistics.longestStreak
            );
        } else {
            userData.statistics.currentStreak = 0;
        }
    }
    
    saveUserData();
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('dashboardUserData', JSON.stringify(userData));
}

// Initialize animations
function initializeAnimations() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.animationDelay = `${index * 0.2}s`;
    });
}

// Initialize navbar functionality
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'white';
            navbar.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
    });
}

// Initialize smooth scrolling
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
                window.scrollTo({
                    top: targetPosition - navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize logout functionality
function initializeLogout() {
    const logoutLink = document.querySelector('a[href="#logout"]');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
}

// Handle logout process
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Save final user state
        saveUserData();
        
        // Clear any sensitive data
        sessionStorage.clear();
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// Initialize dashboard features
function initializeDashboard() {
    // Initialize user data section
    initializeUserDataSection();
    
    // Initialize statistics section
    initializeStatisticsSection();
    
    // Initialize tools section
    initializeToolsSection();
}

// Initialize user data section
function initializeUserDataSection() {
    const userDataSection = document.querySelector('#user-data');
    if (userDataSection) {
        // Create and append user data form
        const form = createUserDataForm();
        userDataSection.appendChild(form);
    }
}

// Create user data form
function createUserDataForm() {
    const form = document.createElement('form');
    form.innerHTML = `
        <div class="form-group">
            <label for="userName">Name:</label>
            <input type="text" id="userName" value="${userData.name || ''}" />
        </div>
        <div class="form-group">
            <label for="userEmail">Email:</label>
            <input type="email" id="userEmail" value="${userData.email || ''}" />
        </div>
        <button type="submit">Save Changes</button>
    `;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUserProfile();
    });
    
    return form;
}

// Save user profile
function saveUserProfile() {
    const name = document.querySelector('#userName').value;
    const email = document.querySelector('#userEmail').value;
    
    userData.name = name;
    userData.email = email;
    saveUserData();
    
    showNotification('Profile updated successfully!');
}

// Initialize statistics section
function initializeStatisticsSection() {
    const statisticsSection = document.querySelector('#statistics');
    if (statisticsSection) {
        updateStatistics();
    }
}

// Update statistics display
function updateStatistics() {
    const statisticsSection = document.querySelector('#statistics');
    if (statisticsSection) {
        statisticsSection.innerHTML = `
            <h2>Your Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Goals Completed</h3>
                    <p>${userData.statistics.totalGoalsCompleted}</p>
                </div>
                <div class="stat-card">
                    <h3>Current Streak</h3>
                    <p>${userData.statistics.currentStreak} days</p>
                </div>
                <div class="stat-card">
                    <h3>Longest Streak</h3>
                    <p>${userData.statistics.longestStreak} days</p>
                </div>
            </div>
        `;
    }
}

// Initialize tools section
function initializeToolsSection() {
    const toolsSection = document.querySelector('#tools');
    if (toolsSection) {
        createToolsInterface();
    }
}

// Create tools interface
function createToolsInterface() {
    const toolsSection = document.querySelector('#tools');
    toolsSection.innerHTML += `
        <div class="tools-grid">
            <div class="tool-card">
                <h3>Goal Tracker</h3>
                <button onclick="openGoalTracker()">Open</button>
            </div>
            <div class="tool-card">
                <h3>Habit Builder</h3>
                <button onclick="openHabitBuilder()">Open</button>
            </div>
            <div class="tool-card">
                <h3>Progress Journal</h3>
                <button onclick="openProgressJournal()">Open</button>
            </div>
        </div>
    `;
}

// Tool functions
function openGoalTracker() {    
    window.location.href = 'GoalTracker.html';
}

function openHabitBuilder() {   
    window.location.href = 'HabitBuilder.html';
}

function openProgressJournal() {
    window.location.href = 'ProgressJournal.html';
}


// Handle errors
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    showNotification('An error occurred. Please try again.');
});