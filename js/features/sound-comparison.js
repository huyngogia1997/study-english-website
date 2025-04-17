// Sound comparison functionality

// Set up sound comparison event listeners
function setupSoundComparison() {
    const positionNavigation = document.getElementById('position-navigation');
    
    compareSoundsBtn.addEventListener('click', () => {
        const firstSound = firstSoundSelect.value;
        const secondSound = secondSoundSelect.value;
        
        if (!firstSound || !secondSound) {
            alert('Please select both sounds to compare');
            return;
        }
        
        if (firstSound === secondSound) {
            alert('Please select two different sounds to compare');
            return;
        }
        
        compareSounds(firstSound, secondSound);
        
        // Show position navigation buttons after search
        positionNavigation.style.display = 'block';
    });
}

// Compare two sounds and find similar words
function compareSounds(firstSound, secondSound) {
    showLoading(true);
    
    // Update the sound titles
    firstSoundTitle.textContent = firstSound;
    secondSoundTitle.textContent = secondSound;
    
    // Find words containing the first sound
    const firstSoundWords = findWordsWithSound(firstSound);
    
    // Find words containing the second sound
    const secondSoundWords = findWordsWithSound(secondSound);
    
    // Process words to extract position information
    const firstSoundProcessed = processWordsForPositionMatching(firstSoundWords, firstSound);
    const secondSoundProcessed = processWordsForPositionMatching(secondSoundWords, secondSound);
    
    // Categorize words by position (first, middle, last)
    const firstSoundCategorized = categorizeWordsByPosition(firstSoundProcessed);
    const secondSoundCategorized = categorizeWordsByPosition(secondSoundProcessed);
    
    // Find pairs of words with sounds in similar positions for each category
    const firstPositionPairs = findWordPairsWithinCategory(
        firstSoundCategorized.firstPosition, 
        secondSoundCategorized.firstPosition
    );
    
    const middlePositionPairs = findWordPairsWithinCategory(
        firstSoundCategorized.middlePosition, 
        secondSoundCategorized.middlePosition
    );
    
    const lastPositionPairs = findWordPairsWithinCategory(
        firstSoundCategorized.lastPosition, 
        secondSoundCategorized.lastPosition
    );
    
    // Display the results using the new function that shows one position at a time
    displayCategorizedResultsOnePosition(
        firstPositionPairs, 
        middlePositionPairs, 
        lastPositionPairs, 
        firstSoundResults, 
        secondSoundResults
    );
    
    showLoading(false);
}

// Find words containing a specific sound
function findWordsWithSound(sound) {
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
    
    return wordsData.filter(item => {
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
}

// Process words to extract position information
function processWordsForPositionMatching(words, targetSound) {
    return words.map(word => {
        const phonetic = word.value.phonetics?.uk || word.value.phonetics?.us || '';
        
        // Find positions of the target sound in the phonetic transcription
        const positions = [];
        let pos = phonetic.indexOf(targetSound);
        while (pos !== -1) {
            positions.push(pos);
            pos = phonetic.indexOf(targetSound, pos + 1);
        }
        
        // Create a position pattern (e.g., "0,4" for sounds at positions 0 and 4)
        const positionPattern = positions.join(',');
        
        return {
            word: word,
            phonetic: phonetic,
            positions: positions,
            positionPattern: positionPattern
        };
    });
}

// Categorize words by position (first, middle, last)
function categorizeWordsByPosition(words) {
    const firstPosition = [];
    const middlePosition = [];
    const lastPosition = [];
    
    words.forEach(word => {
        if (word.positions.length === 0) return;
        
        const phoneticLength = word.phonetic.length;
        
        // Check if the sound appears at the beginning (first 20% of the word)
        if (word.positions.some(pos => pos <= phoneticLength * 0.2)) {
            firstPosition.push({...word, positionType: 'first'});
        }
        
        // Check if the sound appears in the middle (between 20% and 80% of the word)
        if (word.positions.some(pos => pos > phoneticLength * 0.2 && pos < phoneticLength * 0.8)) {
            middlePosition.push({...word, positionType: 'middle'});
        }
        
        // Check if the sound appears at the end (last 20% of the word)
        if (word.positions.some(pos => pos >= phoneticLength * 0.8)) {
            lastPosition.push({...word, positionType: 'last'});
        }
    });
    
    return {
        firstPosition,
        middlePosition,
        lastPosition
    };
}

// Find pairs of words within the same position category
function findWordPairsWithinCategory(firstSoundWords, secondSoundWords) {
    // If either category is empty, return empty arrays
    if (firstSoundWords.length === 0 || secondSoundWords.length === 0) {
        return {
            firstSoundWords: [],
            secondSoundWords: []
        };
    }
    
    // Group words by position pattern
    const firstSoundByPattern = groupWordsByPositionPattern(firstSoundWords);
    const secondSoundByPattern = groupWordsByPositionPattern(secondSoundWords);
    
    // Match words with similar position patterns
    const firstSoundPairs = [];
    const secondSoundPairs = [];
    
    // First, find exact position matches
    for (const pattern in firstSoundByPattern) {
        if (secondSoundByPattern[pattern]) {
            // We have an exact position match
            const firstWords = firstSoundByPattern[pattern];
            const secondWords = secondSoundByPattern[pattern];
            
            // Match as many words as possible with this pattern
            const pairCount = Math.min(firstWords.length, secondWords.length);
            
            for (let i = 0; i < pairCount; i++) {
                firstSoundPairs.push({
                    ...firstWords[i],
                    matchScore: 100 // Perfect position match
                });
                
                secondSoundPairs.push({
                    ...secondWords[i],
                    matchScore: 100 // Perfect position match
                });
            }
            
            // Remove the matched words
            firstSoundByPattern[pattern] = firstWords.slice(pairCount);
            secondSoundByPattern[pattern] = secondWords.slice(pairCount);
            
            // If we've used all words from either group, remove the pattern
            if (firstSoundByPattern[pattern].length === 0) {
                delete firstSoundByPattern[pattern];
            }
            if (secondSoundByPattern[pattern].length === 0) {
                delete secondSoundByPattern[pattern];
            }
        }
    }
    
    // Then, find similar position matches for remaining words
    const remainingFirstWords = Object.values(firstSoundByPattern).flat();
    const remainingSecondWords = Object.values(secondSoundByPattern).flat();
    
    // For each remaining first sound word, find the best matching second sound word
    for (const firstWord of remainingFirstWords) {
        if (remainingSecondWords.length === 0) break;
        
        let bestMatchIndex = 0;
        let bestMatchScore = 0;
        
        // Find the best matching second word
        for (let i = 0; i < remainingSecondWords.length; i++) {
            const secondWord = remainingSecondWords[i];
            const matchScore = calculatePositionMatchScore(
                firstWord.positionPattern, 
                secondWord.positionPattern
            );
            
            if (matchScore > bestMatchScore) {
                bestMatchScore = matchScore;
                bestMatchIndex = i;
            }
        }
        
        // Add the best match to our pairs
        const secondWord = remainingSecondWords[bestMatchIndex];
        
        firstSoundPairs.push({
            ...firstWord,
            matchScore: bestMatchScore
        });
        
        secondSoundPairs.push({
            ...secondWord,
            matchScore: bestMatchScore
        });
        
        // Remove the matched second word
        remainingSecondWords.splice(bestMatchIndex, 1);
    }
    
    return {
        firstSoundWords: firstSoundPairs,
        secondSoundWords: secondSoundPairs
    };
}

// Group words by their position pattern
function groupWordsByPositionPattern(words) {
    const wordsByPattern = {};
    
    words.forEach(word => {
        if (!wordsByPattern[word.positionPattern]) {
            wordsByPattern[word.positionPattern] = [];
        }
        wordsByPattern[word.positionPattern].push(word);
    });
    
    return wordsByPattern;
}

// Calculate how well two position patterns match (as a percentage)
function calculatePositionMatchScore(pattern1, pattern2) {
    if (!pattern1 || !pattern2) return 0;
    
    const positions1 = pattern1.split(',').map(Number);
    const positions2 = pattern2.split(',').map(Number);
    
    // If different number of occurrences, reduce the score
    if (positions1.length !== positions2.length) {
        return 50 * Math.min(positions1.length, positions2.length) / Math.max(positions1.length, positions2.length);
    }
    
    // Calculate average position difference
    let totalDiff = 0;
    for (let i = 0; i < positions1.length; i++) {
        totalDiff += Math.abs(positions1[i] - positions2[i]);
    }
    
    const avgDiff = totalDiff / positions1.length;
    // Convert to a score where 0 difference = 100% and larger differences = lower scores
    return Math.max(0, 100 - (avgDiff * 10));
}

// Function to display categorized results showing only one position at a time
function displayCategorizedResultsOnePosition(firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer) {
    // Store results for pagination
    paginatedResults.soundComparison = {
        first: {
            firstSound: firstPositionPairs.firstSoundWords,
            secondSound: firstPositionPairs.secondSoundWords
        },
        middle: {
            firstSound: middlePositionPairs.firstSoundWords,
            secondSound: middlePositionPairs.secondSoundWords
        },
        last: {
            firstSound: lastPositionPairs.firstSoundWords,
            secondSound: lastPositionPairs.secondSoundWords
        }
    };
    
    // Clear containers
    firstSoundContainer.innerHTML = '';
    secondSoundContainer.innerHTML = '';
    
    // Check if we have any results
    const hasFirstPosition = firstPositionPairs.firstSoundWords.length > 0;
    const hasMiddlePosition = middlePositionPairs.firstSoundWords.length > 0;
    const hasLastPosition = lastPositionPairs.firstSoundWords.length > 0;
    
    if (!hasFirstPosition && !hasMiddlePosition && !hasLastPosition) {
        firstSoundContainer.innerHTML = '<p>No results found.</p>';
        secondSoundContainer.innerHTML = '<p>No results found.</p>';
        
        // Hide position navigation if no results
        document.getElementById('position-navigation').style.display = 'none';
        return;
    }
    
    // Update position navigation buttons based on available results
    updatePositionNavigationButtons(hasFirstPosition, hasMiddlePosition, hasLastPosition);
    
    // Determine which position to show first
    let initialPosition = 'first';
    if (!hasFirstPosition) {
        initialPosition = hasMiddlePosition ? 'middle' : 'last';
    }
    
    // Show only the initial position
    showPositionResults(initialPosition, firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer);
    
    // Set the initial position button as active
    setActivePositionButton(document.getElementById(`${initialPosition}-position-btn`));
    
    // Update the position navigation button click handlers
    const firstPositionBtn = document.getElementById('first-position-btn');
    const middlePositionBtn = document.getElementById('middle-position-btn');
    const lastPositionBtn = document.getElementById('last-position-btn');
    
    // Clear previous event listeners (if any)
    firstPositionBtn.replaceWith(firstPositionBtn.cloneNode(true));
    middlePositionBtn.replaceWith(middlePositionBtn.cloneNode(true));
    lastPositionBtn.replaceWith(lastPositionBtn.cloneNode(true));
    
    // Get the new button references
    const newFirstPositionBtn = document.getElementById('first-position-btn');
    const newMiddlePositionBtn = document.getElementById('middle-position-btn');
    const newLastPositionBtn = document.getElementById('last-position-btn');
    
    // Add new event listeners
    if (hasFirstPosition) {
        newFirstPositionBtn.addEventListener('click', () => {
            showPositionResults('first', firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer);
            setActivePositionButton(newFirstPositionBtn);
        });
    }
    
    if (hasMiddlePosition) {
        newMiddlePositionBtn.addEventListener('click', () => {
            showPositionResults('middle', firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer);
            setActivePositionButton(newMiddlePositionBtn);
        });
    }
    
    if (hasLastPosition) {
        newLastPositionBtn.addEventListener('click', () => {
            showPositionResults('last', firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer);
            setActivePositionButton(newLastPositionBtn);
        });
    }
}

// Function to show results for a specific position
function showPositionResults(position, firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer) {
    // Clear containers
    firstSoundContainer.innerHTML = '';
    secondSoundContainer.innerHTML = '';
    
    let pairs;
    let positionTitle;
    
    // Select the appropriate pairs based on position
    switch(position) {
        case 'first':
            pairs = firstPositionPairs;
            positionTitle = 'First Position';
            break;
        case 'middle':
            pairs = middlePositionPairs;
            positionTitle = 'Middle Position';
            break;
        case 'last':
            pairs = lastPositionPairs;
            positionTitle = 'Last Position';
            break;
    }
    
    // Create HTML for the selected position
    let firstSoundHtml = `<div class="position-category" id="${position}-position-first-sound"><h3>${positionTitle}</h3>`;
    let secondSoundHtml = `<div class="position-category" id="${position}-position-second-sound"><h3>${positionTitle}</h3>`;
    
    // Display first page of results
    const firstSoundFirstPage = pairs.firstSoundWords.slice(0, itemsPerPage);
    const secondSoundFirstPage = pairs.secondSoundWords.slice(0, itemsPerPage);
    
    firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
    secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
    
    firstSoundHtml += '</div>';
    secondSoundHtml += '</div>';
    
    // Add pagination controls if needed
    if (pairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            pairs.firstSoundWords.length,
            pairs.secondSoundWords.length
        ) / itemsPerPage);
        
        firstSoundHtml += `<div id="${position}-position-pagination-first"></div>`;
        secondSoundHtml += `<div id="${position}-position-pagination-second"></div>`;
    }
    
    // Update containers
    firstSoundContainer.innerHTML = firstSoundHtml;
    secondSoundContainer.innerHTML = secondSoundHtml;
    
    // Add pagination controls if needed
    if (pairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            pairs.firstSoundWords.length,
            pairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById(`${position}-position-pagination-first`),
            document.getElementById(`${position}-position-pagination-second`),
            position
        );
    }
}

// Update position navigation buttons based on available results
function updatePositionNavigationButtons(hasFirstPosition, hasMiddlePosition, hasLastPosition) {
    const positionNavigation = document.getElementById('position-navigation');
    const firstPositionBtn = document.getElementById('first-position-btn');
    const middlePositionBtn = document.getElementById('middle-position-btn');
    const lastPositionBtn = document.getElementById('last-position-btn');
    
    // Show position navigation if we have any results
    positionNavigation.style.display = (hasFirstPosition || hasMiddlePosition || hasLastPosition) ? 'block' : 'none';
    
    // Enable/disable buttons based on available results
    firstPositionBtn.disabled = !hasFirstPosition;
    firstPositionBtn.style.opacity = hasFirstPosition ? '1' : '0.5';
    
    middlePositionBtn.disabled = !hasMiddlePosition;
    middlePositionBtn.style.opacity = hasMiddlePosition ? '1' : '0.5';
    
    lastPositionBtn.disabled = !hasLastPosition;
    lastPositionBtn.style.opacity = hasLastPosition ? '1' : '0.5';
}

// Set active position button
function setActivePositionButton(activeButton) {
    const buttons = document.querySelectorAll('.position-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Create HTML for comparison words
function createComparisonWordsHtml(words) {
    if (words.length === 0) {
        return '<p>No words found.</p>';
    }
    
    let html = '';
    
    words.forEach(item => {
        const word = item.word.value;
        const matchScore = Math.round(item.matchScore);
        const positions = item.positions || [];
        
        // Create a visual representation of the sound positions
        const phoneticText = item.phonetic;
        let positionIndicator = '';
        if (phoneticText) {
            for (let i = 0; i < phoneticText.length; i++) {
                if (positions.includes(i)) {
                    positionIndicator += '▼';
                } else {
                    positionIndicator += ' ';
                }
            }
        }
        
        html += `
            <div class="comparison-word">
                <div class="comparison-word-header">
                    <div class="comparison-word-title">${word.word}</div>
                </div>
                <div class="phonetic-container">
                    <div class="comparison-word-phonetic">${phoneticText}</div>
                    <div class="position-indicator">${positionIndicator}</div>
                </div>
                <div class="scores">
                    <div class="position-score">Position Match: ${matchScore}%</div>
                </div>
                <div class="audio-controls">
                    ${word.uk?.mp3 ? `
                        <button class="audio-btn" onclick="playAudio('${word.uk.mp3}')">
                            Play UK 🔊
                        </button>
                    ` : ''}
                    
                    ${word.us?.mp3 ? `
                        <button class="audio-btn" onclick="playAudio('${word.us.mp3}')">
                            Play US 🔊
                        </button>
                    ` : ''}
                </div>
                <a href="${word.href}" target="_blank">View on Oxford Learner's Dictionary</a>
            </div>
        `;
    });
    
    return html;
}
