// Pagination functionality
let currentPage = 1;
const itemsPerPage = 10;
let paginatedResults = {
    word: [],
    phonetic: [],
    multiPhonetic: [],
    soundComparison: {
        first: { firstSound: [], secondSound: [] },
        middle: { firstSound: [], secondSound: [] },
        last: { firstSound: [], secondSound: [] }
    }
};

// Reset pagination data
function resetPaginationData() {
    paginatedResults = {
        word: [],
        phonetic: [],
        multiPhonetic: [],
        soundComparison: {
            first: { firstSound: [], secondSound: [] },
            middle: { firstSound: [], secondSound: [] },
            last: { firstSound: [], secondSound: [] }
        }
    };
    currentPage = 1;
}

// Sort results by level or alphabetically
function sortResults(results, sortBy) {
    const levelOrder = {
        'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6
    };
    
    return [...results].sort((a, b) => {
        const wordA = a.value;
        const wordB = b.value;
        
        switch(sortBy) {
            case 'level-asc':
                // Sort by level (A1 to C2)
                const levelA = wordA.level || 'Z'; // If no level, put at the end
                const levelB = wordB.level || 'Z';
                return (levelOrder[levelA] || 999) - (levelOrder[levelB] || 999);
                
            case 'level-desc':
                // Sort by level (C2 to A1)
                const levelADesc = wordA.level || '';
                const levelBDesc = wordB.level || '';
                return (levelOrder[levelBDesc] || 0) - (levelOrder[levelADesc] || 0);
                
            case 'alpha-asc':
                // Sort alphabetically (A to Z)
                return wordA.word.localeCompare(wordB.word);
                
            case 'alpha-desc':
                // Sort alphabetically (Z to A)
                return wordB.word.localeCompare(wordA.word);
                
            default:
                return 0;
        }
    });
}

// Display paginated results for word and phonetic searches
function displayPaginatedResults(results, container) {
    // Store the full results for pagination
    paginatedResults.word = results;
    
    // Apply sorting if selected
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect && sortSelect.value !== 'none') {
        results = sortResults(results, sortSelect.value);
        // Update stored results with sorted version
        paginatedResults.word = results;
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(results.length / itemsPerPage);
    
    // Reset to page 1 when new search is performed
    currentPage = 1;
    
    // Display the first page of results
    displayResultsPage(currentPage, results, container);
    
    // Create pagination controls
    createPaginationControls(totalPages, container, 'word');
}

// Display a specific page of results
function displayResultsPage(page, allResults, container) {
    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allResults.length);
    
    // Get the current page of results
    const pageResults = allResults.slice(startIndex, endIndex);
    
    // Display the results
    if (typeof displayResults === 'function') {
        // Use the dedicated display function if available
        displayResults(pageResults);
    } else {
        // Fallback display method
        let html = '';
        
        if (pageResults.length === 0) {
            html = '<p>No results found.</p>';
        } else {
            pageResults.forEach(item => {
                const word = item.value;
                
                html += `
                    <div class="word-result">
                        <h3>${word.word}</h3>
                        <div class="word-details">
                            <span class="word-type">${word.type || ''}</span>
                            <span class="word-level">${word.level || ''}</span>
                        </div>
                        <div class="phonetics">
                            <div class="uk-phonetic">
                                UK: ${word.phonetics?.uk || ''}
                                ${word.uk?.mp3 ? `
                                    <button class="audio-btn" onclick="playAudio('${word.uk.mp3}')">
                                        Play 🔊
                                    </button>
                                ` : ''}
                            </div>
                            <div class="us-phonetic">
                                US: ${word.phonetics?.us || ''}
                                ${word.us?.mp3 ? `
                                    <button class="audio-btn" onclick="playAudio('${word.us.mp3}')">
                                        Play 🔊
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                        <a href="${word.href}" target="_blank">View on Oxford Learner's Dictionary</a>
                    </div>
                `;
            });
        }
        
        container.innerHTML = html;
    }
}

// Create pagination controls
function createPaginationControls(totalPages, container, resultType) {
    if (totalPages <= 1) return; // No need for pagination if only one page
    
    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn prev-btn';
    prevButton.textContent = '← Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            handlePageChange(resultType, container);
        }
    });
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn next-btn';
    nextButton.textContent = 'Next →';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            handlePageChange(resultType, container);
        }
    });
    
    // Page indicator
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'page-indicator';
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Assemble pagination controls
    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageIndicator);
    paginationContainer.appendChild(nextButton);
    
    // Add to container
    container.appendChild(paginationContainer);
}

// Handle page change based on result type
function handlePageChange(resultType, container) {
    switch (resultType) {
        case 'word':
            displayResultsPage(currentPage, paginatedResults.word, container);
            break;
        case 'phonetic':
            displayResultsPage(currentPage, paginatedResults.phonetic, container);
            break;
        case 'multiPhonetic':
            displayResultsPage(currentPage, paginatedResults.multiPhonetic, container);
            break;
        case 'soundComparisonFirst':
            displayCategorizedResultsPage('first', container);
            break;
        case 'soundComparisonMiddle':
            displayCategorizedResultsPage('middle', container);
            break;
        case 'soundComparisonLast':
            displayCategorizedResultsPage('last', container);
            break;
    }
    
    // Update pagination controls
    const totalPages = Math.ceil(
        (resultType === 'word' ? paginatedResults.word.length : 
         resultType === 'phonetic' ? paginatedResults.phonetic.length :
         resultType === 'multiPhonetic' ? paginatedResults.multiPhonetic.length :
         resultType === 'soundComparisonFirst' ? Math.max(
             paginatedResults.soundComparison.first.firstSound.length,
             paginatedResults.soundComparison.first.secondSound.length
         ) :
         resultType === 'soundComparisonMiddle' ? Math.max(
             paginatedResults.soundComparison.middle.firstSound.length,
             paginatedResults.soundComparison.middle.secondSound.length
         ) :
         Math.max(
             paginatedResults.soundComparison.last.firstSound.length,
             paginatedResults.soundComparison.last.secondSound.length
         )) / itemsPerPage
    );
    
    // Remove existing pagination controls
    const existingControls = container.querySelector('.pagination-controls');
    if (existingControls) {
        existingControls.remove();
    }
    
    // Create new pagination controls
    createPaginationControls(totalPages, container, resultType);
}

// Create pagination controls for sound comparison
function createSoundComparisonPaginationControls(totalPages, firstContainer, secondContainer, positionType) {
    console.log(`Creating pagination controls for sound comparison: ${positionType}, total pages: ${totalPages}`);
    
    if (!firstContainer || !secondContainer) {
        console.error('Containers not provided for pagination controls');
        return;
    }
    
    if (totalPages <= 1) {
        console.log('Only one page of results, skipping pagination controls');
        return;
    }
    
    // Remove any existing pagination controls
    const existingFirstPagination = firstContainer.querySelector('.pagination-controls');
    if (existingFirstPagination) {
        existingFirstPagination.remove();
    }
    
    const existingSecondPagination = secondContainer.querySelector('.pagination-controls');
    if (existingSecondPagination) {
        existingSecondPagination.remove();
    }
    
    // Create pagination for first sound container
    const firstPaginationContainer = document.createElement('div');
    firstPaginationContainer.className = 'pagination-controls';
    
    // Previous button
    const firstPrevButton = document.createElement('button');
    firstPrevButton.className = 'pagination-btn prev-btn';
    firstPrevButton.textContent = '← Previous';
    firstPrevButton.disabled = true; // Start at page 1
    
    // Next button
    const firstNextButton = document.createElement('button');
    firstNextButton.className = 'pagination-btn next-btn';
    firstNextButton.textContent = 'Next →';
    firstNextButton.disabled = totalPages === 1;
    
    // Page indicator
    const firstPageIndicator = document.createElement('span');
    firstPageIndicator.className = 'page-indicator';
    firstPageIndicator.textContent = `Page 1 of ${totalPages}`;
    
    // Assemble pagination controls
    firstPaginationContainer.appendChild(firstPrevButton);
    firstPaginationContainer.appendChild(firstPageIndicator);
    firstPaginationContainer.appendChild(firstNextButton);
    
    // Add to container
    firstContainer.appendChild(firstPaginationContainer);
    
    // Create pagination for second sound container
    const secondPaginationContainer = document.createElement('div');
    secondPaginationContainer.className = 'pagination-controls';
    
    // Previous button for second container
    const secondPrevButton = document.createElement('button');
    secondPrevButton.className = 'pagination-btn prev-btn';
    secondPrevButton.textContent = '← Previous';
    secondPrevButton.disabled = true; // Start at page 1
    
    // Next button for second container
    const secondNextButton = document.createElement('button');
    secondNextButton.className = 'pagination-btn next-btn';
    secondNextButton.textContent = 'Next →';
    secondNextButton.disabled = totalPages === 1;
    
    // Page indicator for second container
    const secondPageIndicator = document.createElement('span');
    secondPageIndicator.className = 'page-indicator';
    secondPageIndicator.textContent = `Page 1 of ${totalPages}`;
    
    // Assemble pagination controls for second container
    secondPaginationContainer.appendChild(secondPrevButton);
    secondPaginationContainer.appendChild(secondPageIndicator);
    secondPaginationContainer.appendChild(secondNextButton);
    
    // Add to second container
    secondContainer.appendChild(secondPaginationContainer);
    
    // Set up event listeners for first container - INDEPENDENT PAGINATION
    let currentPageFirst = 1;
    let currentPageSecond = 1;
    
    firstPrevButton.addEventListener('click', () => {
        if (currentPageFirst > 1) {
            currentPageFirst--;
            updateSoundComparisonPage(positionType, 'firstSound', currentPageFirst);
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = currentPageFirst === 1;
            firstNextButton.disabled = currentPageFirst === totalPages;
        }
    });
    
    firstNextButton.addEventListener('click', () => {
        if (currentPageFirst < totalPages) {
            currentPageFirst++;
            updateSoundComparisonPage(positionType, 'firstSound', currentPageFirst);
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = currentPageFirst === 1;
            firstNextButton.disabled = currentPageFirst === totalPages;
        }
    });
    
    // Set up event listeners for second container - INDEPENDENT PAGINATION
    secondPrevButton.addEventListener('click', () => {
        if (currentPageSecond > 1) {
            currentPageSecond--;
            updateSoundComparisonPage(positionType, 'secondSound', currentPageSecond);
            secondPageIndicator.textContent = `Page ${currentPageSecond} of ${totalPages}`;
            secondPrevButton.disabled = currentPageSecond === 1;
            secondNextButton.disabled = currentPageSecond === totalPages;
        }
    });
    
    secondNextButton.addEventListener('click', () => {
        if (currentPageSecond < totalPages) {
            currentPageSecond++;
            updateSoundComparisonPage(positionType, 'secondSound', currentPageSecond);
            secondPageIndicator.textContent = `Page ${currentPageSecond} of ${totalPages}`;
            secondPrevButton.disabled = currentPageSecond === 1;
            secondNextButton.disabled = currentPageSecond === totalPages;
        }
    });
    
    console.log('Independent pagination controls created successfully');
}

// Update sound comparison page
function updateSoundComparisonPage(positionType, soundType, page) {
    console.log(`Updating sound comparison page: ${positionType}, ${soundType}, page ${page}`);
    
    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get the current page of results
    const results = paginatedResults.soundComparison[positionType][soundType];
    
    if (!results || results.length === 0) {
        console.error(`No results found for ${positionType} position, ${soundType}`);
        return;
    }
    
    const pageResults = results.slice(startIndex, endIndex);
    console.log(`Showing results ${startIndex+1} to ${Math.min(endIndex, results.length)} of ${results.length}`);
    
    // Get the container to update
    const containerId = `${positionType}-position-${soundType === 'firstSound' ? 'first' : 'second'}-sound`;
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }
    
    try {
        // Keep the heading
        const heading = container.querySelector('h3');
        const headingText = heading ? heading.textContent : `${positionType.charAt(0).toUpperCase() + positionType.slice(1)} Position`;
        
        // Get existing pagination controls to preserve them
        const paginationControls = container.querySelector('.pagination-controls');
        
        // Update the container with new results but preserve pagination
        const newContent = `<h3>${headingText}</h3>` + createComparisonWordsHtml(pageResults);
        container.innerHTML = newContent;
        
        // Re-append pagination controls if they existed
        if (paginationControls) {
            container.appendChild(paginationControls);
        }
        
        console.log(`Successfully updated ${soundType} for ${positionType} position, page ${page}`);
    } catch (error) {
        console.error('Error updating sound comparison page:', error);
    }
}
