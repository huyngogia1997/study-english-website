// Word search functionality

// Set up word search event listeners
function setupWordSearch() {
    wordSearchBtn.addEventListener('click', () => {
        const searchTerm = wordInput.value.trim().toLowerCase();
        if (searchTerm) {
            searchByWord(searchTerm);
        }
    });

    wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = wordInput.value.trim().toLowerCase();
            if (searchTerm) {
                searchByWord(searchTerm);
            }
        }
    });
}

// Search by word
function searchByWord(word) {
    showLoading(true);
    
    const results = wordsData.filter(item => 
        item.value.word.toLowerCase() === word.toLowerCase()
    );
    
    // If using pagination
    if (typeof displayPaginatedResults === 'function') {
        displayPaginatedResults(results, resultsContainer);
    } else {
        // Fallback to regular display
        displayResults(results);
    }
    
    showLoading(false);
}
