// Phonetic search functionality

// Set up phonetic search event listeners
function setupPhoneticSearch() {
    phoneticSearchBtn.addEventListener('click', () => {
        const searchTerm = phoneticInput.value.trim();
        if (searchTerm) {
            searchByPhonetic(searchTerm);
        }
    });

    phoneticInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = phoneticInput.value.trim();
            if (searchTerm) {
                searchByPhonetic(searchTerm);
            }
        }
    });

    // Phonetic buttons
    phoneticButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sound = button.getAttribute('data-sound');
            phoneticInput.value = sound;
            searchByPhonetic(sound);
        });
    });
}

// Search by phonetic sound
function searchByPhonetic(sound) {
    showLoading(true);
    
    // Special handling for tʃ and dʒ
    const isSpecialCase = (phoneticStr, searchSound) => {
        if ((searchSound === 't' || searchSound === 'ʃ') && phoneticStr.includes('tʃ')) {
            return true;
        }
        if ((searchSound === 'd' || searchSound === 'ʒ') && phoneticStr.includes('dʒ')) {
            return true;
        }
        return false;
    };
    
    const results = wordsData.filter(item => {
        const usPhonetic = item.value.phonetics?.us || '';
        const ukPhonetic = item.value.phonetics?.uk || '';
        
        if (sound === 't' || sound === 'ʃ' || sound === 'd' || sound === 'ʒ') {
            // Special case handling
            return (usPhonetic.includes(sound) && !isSpecialCase(usPhonetic, sound)) || 
                   (ukPhonetic.includes(sound) && !isSpecialCase(ukPhonetic, sound));
        } else {
            // Normal case
            return usPhonetic.includes(sound) || ukPhonetic.includes(sound);
        }
    });
    
    // Store results for pagination
    if (typeof paginatedResults !== 'undefined') {
        paginatedResults.phonetic = results;
    }
    
    // Display results
    if (typeof displayResultsPage === 'function' && typeof createPaginationControls === 'function') {
        // Use pagination if available
        displayResultsPage(1, results, resultsContainer);
        const totalPages = Math.ceil(results.length / (typeof itemsPerPage !== 'undefined' ? itemsPerPage : 10));
        createPaginationControls(totalPages, resultsContainer, 'phonetic');
    } else {
        // Fallback to regular display
        displayResults(results);
    }
    
    showLoading(false);
}
