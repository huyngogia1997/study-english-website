// Multi-phonetic search functionality

// Set up multi-phonetic search event listeners
function setupMultiPhoneticSearch() {
    // Check if elements exist
    if (!multiPhoneticSearchBtn || !clearSelectionBtn || !selectedSoundsDisplay || !phoneticCheckboxes) {
        console.error('Multi-phonetic search elements not found');
        return;
    }
    
    // Update selected sounds display when checkboxes are clicked
    phoneticCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedSoundsDisplay);
    });
    
    // Search button click handler
    multiPhoneticSearchBtn.addEventListener('click', () => {
        const selectedSounds = getSelectedSounds();
        if (selectedSounds.length > 0) {
            searchByMultiplePhonetics(selectedSounds);
        } else {
            alert('Please select at least one phonetic sound');
        }
    });
    
    // Clear selection button click handler
    clearSelectionBtn.addEventListener('click', () => {
        phoneticCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        updateSelectedSoundsDisplay();
    });
}

// Get all currently selected sounds
function getSelectedSounds() {
    const selectedSounds = [];
    phoneticCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedSounds.push(checkbox.getAttribute('data-sound'));
        }
    });
    return selectedSounds;
}

// Update the display of selected sounds
function updateSelectedSoundsDisplay() {
    const selectedSounds = getSelectedSounds();
    if (selectedSoundsDisplay) {
        if (selectedSounds.length === 0) {
            selectedSoundsDisplay.textContent = 'None';
        } else {
            selectedSoundsDisplay.textContent = selectedSounds.join(', ');
        }
    }
}

// Search for words containing all selected phonetic sounds
function searchByMultiplePhonetics(sounds) {
    showLoading(true);
    
    // Get search mode (AND or OR)
    const searchModeElement = document.querySelector('input[name="search-mode"]:checked');
    const searchMode = searchModeElement ? searchModeElement.value : 'AND';
    
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
        
        if (searchMode === 'AND') {
            // Check if all sounds are present in either US or UK phonetics
            return sounds.every(sound => {
                if (sound === 't' || sound === 'ʃ' || sound === 'd' || sound === 'ʒ') {
                    // Special case handling
                    return (usPhonetic.includes(sound) && !isSpecialCase(usPhonetic, sound)) || 
                           (ukPhonetic.includes(sound) && !isSpecialCase(ukPhonetic, sound));
                } else {
                    // Normal case
                    return usPhonetic.includes(sound) || ukPhonetic.includes(sound);
                }
            });
        } else { // OR mode
            // Check if any of the sounds are present in either US or UK phonetics
            return sounds.some(sound => {
                if (sound === 't' || sound === 'ʃ' || sound === 'd' || sound === 'ʒ') {
                    // Special case handling
                    return (usPhonetic.includes(sound) && !isSpecialCase(usPhonetic, sound)) || 
                           (ukPhonetic.includes(sound) && !isSpecialCase(ukPhonetic, sound));
                } else {
                    // Normal case
                    return usPhonetic.includes(sound) || ukPhonetic.includes(sound);
                }
            });
        }
    });
    
    // Store results for pagination if pagination is available
    if (typeof paginatedResults !== 'undefined') {
        paginatedResults.multiPhonetic = results;
    }
    
    // Display results
    if (typeof displayResultsPage === 'function' && typeof createPaginationControls === 'function') {
        // Use pagination if available
        displayResultsPage(1, results, resultsContainer);
        const totalPages = Math.ceil(results.length / (typeof itemsPerPage !== 'undefined' ? itemsPerPage : 10));
        createPaginationControls(totalPages, resultsContainer, 'multiPhonetic');
    } else {
        // Fallback to regular display
        displayResults(results);
    }
    
    showLoading(false);
}
