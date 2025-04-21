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
    
    // Add event listener for sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            // Only re-sort if we have results
            if (paginatedResults.word.length > 0) {
                const sortedResults = sortResults(paginatedResults.word, sortSelect.value);
                displayPaginatedResults(sortedResults, resultsContainer);
            }
        });
    }
    
    // Add event listeners for other sort selects
    const phoneticSortSelect = document.getElementById('phonetic-sort-select');
    if (phoneticSortSelect) {
        phoneticSortSelect.addEventListener('change', () => {
            if (paginatedResults.phonetic.length > 0) {
                const sortedResults = sortResults(paginatedResults.phonetic, phoneticSortSelect.value);
                // Update stored results
                paginatedResults.phonetic = sortedResults;
                // Display first page of sorted results
                displayResultsPage(1, sortedResults, resultsContainer);
                // Update pagination
                const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
                // Remove existing pagination controls
                const existingControls = resultsContainer.querySelector('.pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }
                // Create new pagination controls
                createPaginationControls(totalPages, resultsContainer, 'phonetic');
            }
        });
    }
    
    const multiPhoneticSortSelect = document.getElementById('multi-phonetic-sort-select');
    if (multiPhoneticSortSelect) {
        multiPhoneticSortSelect.addEventListener('change', () => {
            if (paginatedResults.multiPhonetic.length > 0) {
                const sortedResults = sortResults(paginatedResults.multiPhonetic, multiPhoneticSortSelect.value);
                // Update stored results
                paginatedResults.multiPhonetic = sortedResults;
                // Display first page of sorted results
                displayResultsPage(1, sortedResults, resultsContainer);
                // Update pagination
                const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
                // Remove existing pagination controls
                const existingControls = resultsContainer.querySelector('.pagination-controls');
                if (existingControls) {
                    existingControls.remove();
                }
                // Create new pagination controls
                createPaginationControls(totalPages, resultsContainer, 'multiPhonetic');
            }
        });
    }
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
