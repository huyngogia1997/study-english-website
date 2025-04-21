// Theme Switcher Functionality

// Initialize theme from local storage or system preference
function initTheme() {
    // Check if theme is stored in local storage
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
        // Apply stored theme
        applyTheme(storedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = prefersDark ? 'dark' : 'light';
        
        applyTheme(theme);
    }
}

// Apply theme to document
function applyTheme(theme) {
    // Remove any existing theme classes
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Add the new theme class
    document.body.classList.add(`${theme}-theme`);
    
    // Set data attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update toggle state
    updateToggleState(theme);
    
    console.log(`Theme applied: ${theme}`);
}

// Update toggle button state
function updateToggleState(theme) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.setAttribute('aria-checked', theme === 'dark');
        toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply new theme
    applyTheme(newTheme);
    
    // Save to local storage
    localStorage.setItem('theme', newTheme);
    
    console.log(`Theme toggled to: ${newTheme}`);
}

// Create theme switcher element
function createThemeSwitcher() {
    // Create container
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle';
    toggleBtn.className = 'theme-btn';
    toggleBtn.setAttribute('aria-label', 'Toggle dark mode');
    toggleBtn.innerHTML = '🌙'; // Default to light theme icon
    
    // Add event listener
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Append button to container
    switcher.appendChild(toggleBtn);
    
    // Append to body
    document.body.appendChild(switcher);
    
    // Initialize theme
    initTheme();
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', createThemeSwitcher);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'theme-label';
    label.textContent = 'Theme:';
    
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'theme-toggle';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', 'false');
    toggle.setAttribute('aria-label', 'Toggle dark mode');
    
    // Add sun and moon icons
    const sunIcon = document.createElement('span');
    sunIcon.className = 'sun-icon';
    sunIcon.innerHTML = '☀️';
    
    const moonIcon = document.createElement('span');
    moonIcon.className = 'moon-icon';
    moonIcon.innerHTML = '🌙';
    
    // Assemble toggle button
    toggle.appendChild(sunIcon);
    toggle.appendChild(moonIcon);
    
    // Add click event
    toggle.addEventListener('click', toggleTheme);
    
    // Assemble switcher
    switcher.appendChild(label);
    switcher.appendChild(toggle);
    
    // Add to document
    document.body.appendChild(switcher);
}

// Initialize theme switcher
document.addEventListener('DOMContentLoaded', () => {
    createThemeSwitcher();
    initTheme();
});
