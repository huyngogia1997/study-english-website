// Save for Later functionality

// Initialize saved words from local storage
let savedWords = [];

// Load saved words from local storage
function loadSavedWords() {
    const savedWordsJson = localStorage.getItem('savedWords');
    if (savedWordsJson) {
        try {
            savedWords = JSON.parse(savedWordsJson);
        } catch (error) {
            console.error('Error parsing saved words from local storage:', error);
            savedWords = [];
        }
    }
}

// Save words to local storage
function saveSavedWords() {
    localStorage.setItem('savedWords', JSON.stringify(savedWords));
}

// Add a word to saved words
function saveWord(wordData) {
    // Check if word is already saved (avoid duplicates)
    const isAlreadySaved = savedWords.some(item => 
        item.value.word.toLowerCase() === wordData.value.word.toLowerCase()
    );
    
    if (!isAlreadySaved) {
        savedWords.push(wordData);
        saveSavedWords();
        updateSavedWordsCount();
        showSaveConfirmation(wordData.value.word, true);
        return true;
    } else {
        showSaveConfirmation(wordData.value.word, false);
        return false;
    }
}

// Remove a word from saved words
function removeSavedWord(word) {
    const initialLength = savedWords.length;
    savedWords = savedWords.filter(item => 
        item.value.word.toLowerCase() !== word.toLowerCase()
    );
    
    if (savedWords.length < initialLength) {
        saveSavedWords();
        updateSavedWordsCount();
        return true;
    }
    return false;
}

// Check if a word is saved
function isWordSaved(word) {
    return savedWords.some(item => 
        item.value.word.toLowerCase() === word.toLowerCase()
    );
}

// Update the saved words count in the UI
function updateSavedWordsCount() {
    if (savedWordsCount) {
        savedWordsCount.textContent = savedWords.length;
    }
    
    if (savedWordsCountHeader) {
        savedWordsCountHeader.textContent = savedWords.length;
    }
}

// Show a temporary confirmation message
function showSaveConfirmation(word, isSaved) {
    const confirmationElement = document.getElementById('save-confirmation');
    if (!confirmationElement) {
        // Create confirmation element if it doesn't exist
        const newConfirmation = document.createElement('div');
        newConfirmation.id = 'save-confirmation';
        newConfirmation.className = 'save-confirmation';
        document.body.appendChild(newConfirmation);
    }
    
    const confirmation = document.getElementById('save-confirmation');
    confirmation.textContent = isSaved 
        ? `"${word}" saved to your list!` 
        : `"${word}" is already in your saved list`;
    confirmation.className = `save-confirmation ${isSaved ? 'saved' : 'already-saved'}`;
    
    // Show the confirmation
    confirmation.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        confirmation.style.display = 'none';
    }, 3000);
}

// Display saved words
function displaySavedWords() {
    if (savedWords.length === 0) {
        if (savedWordsResults) {
            savedWordsResults.innerHTML = '<p>You have no saved words yet. Search for words and click the "Save" button to add them to your list.</p>';
        } else {
            resultsContainer.innerHTML = '<p>You have no saved words yet. Search for words and click the "Save" button to add them to your list.</p>';
        }
        return;
    }
    
    // Apply sorting if selected
    const sortSelect = document.getElementById('saved-words-sort-select');
    let wordsToDisplay = [...savedWords];
    
    if (sortSelect && sortSelect.value !== 'none') {
        wordsToDisplay = sortResults(wordsToDisplay, sortSelect.value);
    }
    
    // If using pagination
    if (typeof displayPaginatedResults === 'function') {
        const targetContainer = savedWordsResults || resultsContainer;
        displayPaginatedResults(wordsToDisplay, targetContainer, 'saved');
    } else {
        // Fallback to regular display
        const targetContainer = savedWordsResults || resultsContainer;
        displayResults(wordsToDisplay, targetContainer);
    }
    
    // Add unsave buttons to all words
    setTimeout(() => {
        addSaveButtonsToResults();
    }, 100);
}

// Setup save for later functionality
function setupSaveForLater() {
    // Load saved words from local storage
    loadSavedWords();
    
    // Update saved words count
    updateSavedWordsCount();
    
    // Add event listener for saved words tab
    const savedWordsTabBtn = document.querySelector('.tab-btn[data-tab="saved-words"]');
    if (savedWordsTabBtn) {
        savedWordsTabBtn.addEventListener('click', () => {
            displaySavedWords();
        });
    }
    
    // Add event listener for clear all saved words button
    if (clearSavedWordsBtn) {
        clearSavedWordsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all saved words?')) {
                savedWords = [];
                saveSavedWords();
                updateSavedWordsCount();
                displaySavedWords(); // Refresh the display
            }
        });
    }
    
    // Add event listener for export saved words button
    if (exportSavedWordsBtn) {
        exportSavedWordsBtn.addEventListener('click', () => {
            exportSavedWordsToCSV();
        });
    }
    
    // Add event listener for saved words sort select
    if (savedWordsSortSelect) {
        savedWordsSortSelect.addEventListener('change', () => {
            displaySavedWords();
        });
    }
    
    // Setup observer to add save buttons to search results
    setupSaveButtonObserver();
    
    // Add event listeners for tab changes to ensure save buttons are added
    setupTabChangeListeners();
    
    // Add save buttons to any existing results
    addSaveButtonsToResults();
    
    console.log("Save for Later functionality initialized");
}

// Add event listeners for tab changes
function setupTabChangeListeners() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Wait for the tab content to be displayed
            setTimeout(() => {
                addSaveButtonsToResults();
            }, 200);
        });
    });
}

// Export saved words to CSV file
function exportSavedWordsToCSV() {
    if (savedWords.length === 0) {
        alert('You have no saved words to export.');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Word,Type,Level,UK Phonetic,US Phonetic,Oxford Dictionary Link\n';
    
    savedWords.forEach(item => {
        const word = item.value;
        const csvRow = [
            word.word,
            word.type || '',
            word.level || '',
            word.phonetics?.uk || '',
            word.phonetics?.us || '',
            word.href || ''
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
        
        csvContent += csvRow + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'saved_words.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Find word data in all result sets
function findWordData(wordToFind) {
    // Check in different result sets
    const allResultSets = [
        paginatedResults.word || [],
        paginatedResults.phonetic || [],
        paginatedResults.multiPhonetic || [],
        paginatedResults.soundComparison || []
    ];
    
    for (const resultSet of allResultSets) {
        if (!resultSet) continue;
        
        const found = resultSet.find(item => 
            item.value && item.value.word && 
            item.value.word.toLowerCase() === wordToFind.toLowerCase()
        );
        
        if (found) {
            return found;
        }
    }
    
    // If not found in paginated results, try to create a basic word object
    // This is useful for words that might be displayed without being in the search results
    return {
        value: {
            word: wordToFind,
            href: `https://www.oxfordlearnersdictionaries.com/definition/english/${wordToFind.toLowerCase()}`
        }
    };
}

// Modify the displayResults function to add save buttons
function addSaveButtonsToResults() {
    // Find all word results that don't have save buttons yet
    const wordResults = document.querySelectorAll('.word-result:not(.has-save-button)');
    
    wordResults.forEach(wordResult => {
        // Mark as processed
        wordResult.classList.add('has-save-button');
        
        // Get the word from the heading
        const wordHeading = wordResult.querySelector('h3') || wordResult.querySelector('.word-title');
        if (!wordHeading) return;
        
        const word = wordHeading.textContent;
        
        // Create save/unsave button
        const saveButton = document.createElement('button');
        saveButton.className = 'save-btn';
        saveButton.setAttribute('data-word', word);
        
        // Set initial button state
        if (isWordSaved(word)) {
            saveButton.textContent = 'Unsave';
            saveButton.classList.add('unsave');
        } else {
            saveButton.textContent = 'Save for Later';
        }
        
        // Add click event
        saveButton.addEventListener('click', function() {
            const wordToSave = this.getAttribute('data-word');
            
            if (isWordSaved(wordToSave)) {
                // Remove from saved words
                if (removeSavedWord(wordToSave)) {
                    this.textContent = 'Save for Later';
                    this.classList.remove('unsave');
                    
                    // If we're on the saved words tab, refresh the display
                    const savedWordsTab = document.querySelector('.tab-btn[data-tab="saved-words"]');
                    if (savedWordsTab && savedWordsTab.classList.contains('active')) {
                        displaySavedWords();
                    }
                }
            } else {
                // Find the word data
                const wordData = findWordData(wordToSave);
                
                if (wordData) {
                    if (saveWord(wordData)) {
                        this.textContent = 'Unsave';
                        this.classList.add('unsave');
                    }
                }
            }
        });
        
        // Add the button to the word result
        wordResult.appendChild(saveButton);
    });
}

// Observer to watch for new results and add save buttons
function setupSaveButtonObserver() {
    // Create a mutation observer to watch for new results
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                // Check if any word results were added
                addSaveButtonsToResults();
            }
        });
    });
    
    // Start observing the results container
    if (resultsContainer) {
        observer.observe(resultsContainer, { childList: true, subtree: true });
    }
    
    // Also observe the saved words results container if it exists
    if (savedWordsResults) {
        observer.observe(savedWordsResults, { childList: true, subtree: true });
    }
}
