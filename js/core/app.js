// Core application functionality
let wordsData = [];

// Initialize the application
async function initApp() {
    try {
        // Load words data
        await loadWordsData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize games
        if (typeof initGames === 'function') {
            console.log("Initializing games module");
            initGames();
        } else {
            console.warn("Games module not found");
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Load words data from local JSON file
async function loadWordsData() {
    showLoading(true);
    try {
        // Try to load from local file first
        const response = await fetch('words.json');
        if (!response.ok) {
            throw new Error('Failed to load words data from local file');
        }
        wordsData = await response.json();
        console.log(`Loaded ${wordsData.length} words from local file`);
    } catch (error) {
        console.error('Error loading local words data:', error);
        
        try {
            // Fallback to GitHub repository
            const response = await fetch('https://raw.githubusercontent.com/tyypgzl/Oxford-5000-words/main/full-word.json');
            if (!response.ok) {
                throw new Error('Failed to load words data from GitHub');
            }
            wordsData = await response.json();
            console.log(`Loaded ${wordsData.length} words from GitHub`);
        } catch (githubError) {
            console.error('Error loading words data from GitHub:', githubError);
            showError('Failed to load dictionary data. Please try again later.');
            
            // Create some sample data for testing if both fetches fail
            wordsData = [
                {
                    "value": {
                        "word": "example",
                        "type": "noun",
                        "level": "A1",
                        "phonetics": {
                            "uk": "ɪɡˈzɑːmpl",
                            "us": "ɪɡˈzæmpl"
                        },
                        "uk": {
                            "mp3": "https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/e/exa/examp/example__gb_1.mp3"
                        },
                        "us": {
                            "mp3": "https://www.oxfordlearnersdictionaries.com/media/english/us_pron/e/exa/examp/example__us_1.mp3"
                        },
                        "href": "https://www.oxfordlearnersdictionaries.com/definition/english/example"
                    }
                },
                {
                    "value": {
                        "word": "teacher",
                        "type": "noun",
                        "level": "A1",
                        "phonetics": {
                            "uk": "ˈtiːtʃə(r)",
                            "us": "ˈtiːtʃər"
                        },
                        "uk": {
                            "mp3": "https://www.oxfordlearnersdictionaries.com/media/english/uk_pron/t/tea/teach/teacher__gb_1.mp3"
                        },
                        "us": {
                            "mp3": "https://www.oxfordlearnersdictionaries.com/media/english/us_pron/t/tea/teach/teacher__us_1.mp3"
                        },
                        "href": "https://www.oxfordlearnersdictionaries.com/definition/english/teacher"
                    }
                }
            ];
        }
    } finally {
        showLoading(false);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Word search
    setupWordSearch();
    
    // Phonetic search
    setupPhoneticSearch();
    
    // Multi-phonetic search
    setupMultiPhoneticSearch();
    
    // Sound comparison
    setupSoundComparison();
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Update active search panel
    searchPanels.forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// Show/hide loading indicator
function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    resultsContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Play audio
function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Please try again.');
    });
}

// Add this to the global scope for the onclick handlers
window.playAudio = playAudio;

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
