// Core application functionality
let wordsData = [];

// Initialize the application
async function initApp() {
    showLoading(true);
    try {
        // Load words data
        await loadWordsData();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize save for later functionality
        if (typeof setupSaveForLater === 'function') {
            console.log("Initializing save for later module");
            setupSaveForLater();
        } else {
            console.warn("Save for later module not found");
        }
        
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
    } finally {
        showLoading(false);
    }
}

// Load words data from online repository
async function loadWordsData() {
    try {
        // Load from GitHub repository
        const response = await fetch('https://raw.githubusercontent.com/tyypgzl/Oxford-5000-words/main/full-word.json');
        if (!response.ok) {
            throw new Error('Failed to load words data from GitHub');
        }
        const data = await response.json();
        
        // Check if the data is in the expected format
        if (Array.isArray(data) && data.length > 0 && data[0].value && data[0].value.word) {
            wordsData = data;
            console.log(`Loaded ${wordsData.length} words from GitHub`);
        } else {
            throw new Error('Data format is not as expected');
        }
    } catch (error) {
        console.error('Error loading words data from GitHub:', error);
        showError('Failed to load dictionary data. Please try again later.');
        
        // Create some sample data for testing if fetch fails
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
    if (typeof setupWordSearch === 'function') {
        setupWordSearch();
    }
    
    // Phonetic search
    if (typeof setupPhoneticSearch === 'function') {
        setupPhoneticSearch();
    }
    
    // Multi-phonetic search
    if (typeof setupMultiPhoneticSearch === 'function') {
        setupMultiPhoneticSearch();
    }
    
    // Sound comparison
    if (typeof setupSoundComparison === 'function') {
        setupSoundComparison();
    }
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
            
            // Initialize video tab if it's the videos tab
            if (tabId === 'videos' && typeof initVideoTab === 'function') {
                initVideoTab();
            }
        } else {
            panel.classList.remove('active');
        }
    });
    
    // Clear results when switching tabs
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
        console.log('Cleared results when switching to tab:', tabId);
    }
    
    // Reset pagination
    if (typeof resetPaginationData === 'function') {
        resetPaginationData();
    }
}

// Show/hide loading indicator
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading');
    if (!loadingIndicator) return;
    
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
        console.log('Loading indicator shown');
    } else {
        loadingIndicator.classList.add('hidden');
        console.log('Loading indicator hidden');
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
document.addEventListener('DOMContentLoaded', () => {
    // Check if results container exists, if not create it
    if (!document.getElementById('results')) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        document.querySelector('.content').appendChild(resultsDiv);
    }
    
    // Initialize the app
    initApp();
});
