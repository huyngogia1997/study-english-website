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

// Display paginated results for word and phonetic searches
function displayPaginatedResults(results, container) {
    // Store the full results for pagination
    paginatedResults.word = results;
    
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
    if (!firstContainer || !secondContainer || totalPages <= 1) return;
    
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
    
    // Create pagination for second sound container (clone of first)
    const secondPaginationContainer = firstPaginationContainer.cloneNode(true);
    secondContainer.appendChild(secondPaginationContainer);
    
    // Set up event listeners for first container
    let currentPageFirst = 1;
    firstPrevButton.addEventListener('click', () => {
        if (currentPageFirst > 1) {
            currentPageFirst--;
            updateSoundComparisonPage(positionType, 'firstSound', currentPageFirst);
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = currentPageFirst === 1;
            firstNextButton.disabled = false;
            
            // Sync second container pagination
            const secondPrevBtn = secondPaginationContainer.querySelector('.prev-btn');
            const secondNextBtn = secondPaginationContainer.querySelector('.next-btn');
            const secondIndicator = secondPaginationContainer.querySelector('.page-indicator');
            secondIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            secondPrevBtn.disabled = currentPageFirst === 1;
            secondNextBtn.disabled = false;
        }
    });
    
    firstNextButton.addEventListener('click', () => {
        if (currentPageFirst < totalPages) {
            currentPageFirst++;
            updateSoundComparisonPage(positionType, 'firstSound', currentPageFirst);
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = false;
            firstNextButton.disabled = currentPageFirst === totalPages;
            
            // Sync second container pagination
            const secondPrevBtn = secondPaginationContainer.querySelector('.prev-btn');
            const secondNextBtn = secondPaginationContainer.querySelector('.next-btn');
            const secondIndicator = secondPaginationContainer.querySelector('.page-indicator');
            secondIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            secondPrevBtn.disabled = false;
            secondNextBtn.disabled = currentPageFirst === totalPages;
        }
    });
    
    // Set up event listeners for second container
    const secondPrevBtn = secondPaginationContainer.querySelector('.prev-btn');
    const secondNextBtn = secondPaginationContainer.querySelector('.next-btn');
    const secondIndicator = secondPaginationContainer.querySelector('.page-indicator');
    
    secondPrevBtn.addEventListener('click', () => {
        if (currentPageFirst > 1) {
            currentPageFirst--;
            updateSoundComparisonPage(positionType, 'secondSound', currentPageFirst);
            secondIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            secondPrevBtn.disabled = currentPageFirst === 1;
            secondNextBtn.disabled = false;
            
            // Sync first container pagination
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = currentPageFirst === 1;
            firstNextButton.disabled = false;
        }
    });
    
    secondNextBtn.addEventListener('click', () => {
        if (currentPageFirst < totalPages) {
            currentPageFirst++;
            updateSoundComparisonPage(positionType, 'secondSound', currentPageFirst);
            secondIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            secondPrevBtn.disabled = false;
            secondNextBtn.disabled = currentPageFirst === totalPages;
            
            // Sync first container pagination
            firstPageIndicator.textContent = `Page ${currentPageFirst} of ${totalPages}`;
            firstPrevButton.disabled = false;
            firstNextButton.disabled = currentPageFirst === totalPages;
        }
    });
}

// Update sound comparison page
function updateSoundComparisonPage(positionType, soundType, page) {
    // Calculate start and end indices
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    // Get the current page of results
    const results = paginatedResults.soundComparison[positionType][soundType];
    const pageResults = results.slice(startIndex, endIndex);
    
    // Get the container to update
    const containerId = `${positionType}-position-${soundType === 'firstSound' ? 'first' : 'second'}-sound`;
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    // Keep the heading
    const heading = container.querySelector('h3');
    const headingText = heading ? heading.textContent : `${positionType.charAt(0).toUpperCase() + positionType.slice(1)} Position`;
    
    // Update the container with new results
    container.innerHTML = `<h3>${headingText}</h3>` + createComparisonWordsHtml(pageResults);
}
