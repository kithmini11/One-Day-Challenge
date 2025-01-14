// Journal entry functionality
document.addEventListener('DOMContentLoaded', () => {
    // Mood selector
    const moodOptions = document.querySelectorAll('.mood-option');
    let selectedMood = null;

    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            moodOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedMood = option.dataset.mood;
        });
    });

    // Form submission
    const journalForm = document.getElementById('journalForm');
    journalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Here you would normally save the entry
        const entry = {
            date: new Date(),
            mood: selectedMood,
            content: journalForm.querySelector('textarea').value,
            tags: journalForm.querySelector('input[type="text"]').value.split(',').map(tag => tag.trim()),
            metrics: {
                habitsCompleted: '3/5',
                goalProgress: '75%',
                energyLevel: 'High'
            }
        };

        // For demo purposes, log the entry
        console.log('New journal entry:', entry);
        
        // Reset form
        journalForm.reset();
        moodOptions.forEach(opt => opt.classList.remove('selected'));
        selectedMood = null;
    });
});