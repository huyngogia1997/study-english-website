// Sound comparison functionality

// Set up sound comparison event listeners
function setupSoundComparison() {
    if (!compareSoundsBtn || !firstSoundSelect || !secondSoundSelect) {
        console.error('Sound comparison elements not found');
        return;
    }
    
    console.log('Setting up sound comparison event listeners');
    
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
        if (positionNavigation) {
            positionNavigation.style.display = 'flex';
        }
    });
    
    // Position navigation buttons
    const positionBtns = document.querySelectorAll('.position-btn');
    if (positionBtns) {
        positionBtns.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                positionBtns.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show the corresponding position results
                const position = button.id.split('-')[0]; // first, middle, or last
                showPositionResults(position);
            });
        });
    }
    
    console.log('Sound comparison setup complete');
}

// Compare two sounds and find similar words
function compareSounds(firstSound, secondSound) {
    showLoading(true);
    
    // Update the sound titles
    if (firstSoundTitle) firstSoundTitle.textContent = `First Sound: ${firstSound}`;
    if (secondSoundTitle) secondSoundTitle.textContent = `Second Sound: ${secondSound}`;
    
    console.log(`Comparing sounds: ${firstSound} and ${secondSound}`);
    
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
    
    // Store results for pagination
    if (typeof paginatedResults !== 'undefined') {
        paginatedResults.soundComparison = {
            first: {
                firstSound: firstSoundCategorized.first,
                secondSound: secondSoundCategorized.first
            },
            middle: {
                firstSound: firstSoundCategorized.middle,
                secondSound: secondSoundCategorized.middle
            },
            last: {
                firstSound: firstSoundCategorized.last,
                secondSound: secondSoundCategorized.last
            }
        };
        
        console.log('Stored results for pagination:', {
            first: {
                firstSound: firstSoundCategorized.first.length,
                secondSound: secondSoundCategorized.first.length
            },
            middle: {
                firstSound: firstSoundCategorized.middle.length,
                secondSound: secondSoundCategorized.middle.length
            },
            last: {
                firstSound: firstSoundCategorized.last.length,
                secondSound: secondSoundCategorized.last.length
            }
        });
    }
    
    // Make sure the first position button is active
    const firstPositionBtn = document.getElementById('first-position-btn');
    if (firstPositionBtn) {
        const positionBtns = document.querySelectorAll('.position-btn');
        positionBtns.forEach(btn => btn.classList.remove('active'));
        firstPositionBtn.classList.add('active');
    }
    
    // Display first position results by default
    showPositionResults('first');
    
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
    
    console.log(`Searching for words with sound: ${sound}`);
    
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
    
    console.log(`Found ${results.length} words with sound: ${sound}`);
    return results;
}

// Process words to extract position information
function processWordsForPositionMatching(words, sound) {
    console.log(`Processing ${words.length} words for sound: ${sound}`);
    
    const processed = words.map(item => {
        const word = item.value;
        const usPhonetic = word.phonetics?.us || '';
        const ukPhonetic = word.phonetics?.uk || '';
        
        // Use UK phonetics if available, otherwise US
        const phonetic = ukPhonetic || usPhonetic;
        
        // Find positions of the sound in the phonetic string
        const positions = [];
        let pos = phonetic.indexOf(sound);
        while (pos !== -1) {
            positions.push(pos);
            pos = phonetic.indexOf(sound, pos + 1);
        }
        
        return {
            word: item,
            positions: positions,
            phonetic: phonetic
        };
    });
    
    // Log some debug info
    const withPositions = processed.filter(item => item.positions.length > 0);
    console.log(`Found ${withPositions.length} words with positions for sound: ${sound}`);
    
    return processed;
}

// Categorize words by position (first, middle, last)
function categorizeWordsByPosition(processedWords) {
    const result = {
        first: [],
        middle: [],
        last: []
    };
    
    processedWords.forEach(item => {
        const phonetic = item.phonetic;
        
        if (item.positions.length === 0) {
            return; // Skip items with no positions
        }
        
        item.positions.forEach(pos => {
            // Check if the sound is at the beginning
            if (pos === 0 || (pos === 1 && phonetic[0] === 'ˈ') || (pos === 1 && phonetic[0] === '/')) {
                result.first.push(item.word);
            }
            // Check if the sound is at the end
            else if (pos === phonetic.length - 1 || 
                    (pos === phonetic.length - 2 && phonetic[phonetic.length - 1] === 'r') ||
                    (pos === phonetic.length - 2 && phonetic[phonetic.length - 1] === '/')) {
                result.last.push(item.word);
            }
            // Otherwise it's in the middle
            else {
                result.middle.push(item.word);
            }
        });
    });
    
    // Remove duplicates
    result.first = [...new Set(result.first)];
    result.middle = [...new Set(result.middle)];
    result.last = [...new Set(result.last)];
    
    console.log('Categorized words by position:', {
        first: result.first.length,
        middle: result.middle.length,
        last: result.last.length
    });
    
    return result;
}

// Show results for a specific position
function showPositionResults(position) {
    if (!firstSoundResults || !secondSoundResults) {
        console.error('Sound comparison result containers not found');
        return;
    }
    
    console.log(`Showing results for position: ${position}`);
    
    // Get the results for the selected position
    const firstSoundPositionResults = paginatedResults.soundComparison[position].firstSound;
    const secondSoundPositionResults = paginatedResults.soundComparison[position].secondSound;
    
    console.log(`Results count: First sound: ${firstSoundPositionResults.length}, Second sound: ${secondSoundPositionResults.length}`);
    
    // Clear previous results
    firstSoundResults.innerHTML = '';
    secondSoundResults.innerHTML = '';
    
    // Create containers for each position
    const firstPositionContainer = document.createElement('div');
    firstPositionContainer.id = `${position}-position-first-sound`;
    firstPositionContainer.className = 'position-results';
    firstSoundResults.appendChild(firstPositionContainer);
    
    const secondPositionContainer = document.createElement('div');
    secondPositionContainer.id = `${position}-position-second-sound`;
    secondPositionContainer.className = 'position-results';
    secondSoundResults.appendChild(secondPositionContainer);
    
    // Display results
    const positionTitle = position.charAt(0).toUpperCase() + position.slice(1);
    
    try {
        // Add content to containers
        firstPositionContainer.innerHTML = `<h3>${positionTitle} Position</h3>` + createComparisonWordsHtml(firstSoundPositionResults.slice(0, itemsPerPage));
        secondPositionContainer.innerHTML = `<h3>${positionTitle} Position</h3>` + createComparisonWordsHtml(secondSoundPositionResults.slice(0, itemsPerPage));
        
        // Create pagination controls
        const totalPages = Math.ceil(Math.max(
            firstSoundPositionResults.length,
            secondSoundPositionResults.length
        ) / itemsPerPage);
        
        console.log(`Total pages for ${position} position: ${totalPages}`);
        
        // Create pagination controls after a short delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof createSoundComparisonPaginationControls === 'function') {
                createSoundComparisonPaginationControls(totalPages, firstPositionContainer, secondPositionContainer, position);
            } else {
                console.error('createSoundComparisonPaginationControls function not found');
            }
        }, 100);
        
        console.log(`Displayed ${position} position results`);
    } catch (error) {
        console.error('Error displaying position results:', error);
        firstPositionContainer.innerHTML = `<h3>${positionTitle} Position</h3><p>Error displaying results</p>`;
        secondPositionContainer.innerHTML = `<h3>${positionTitle} Position</h3><p>Error displaying results</p>`;
    }
}

// Create HTML for comparison words
function createComparisonWordsHtml(words) {
    if (!words || words.length === 0) {
        return '<p class="no-results">No words found with this sound in this position.</p>';
    }
    
    let html = '<div class="comparison-words">';
    
    words.forEach(item => {
        const word = item.value;
        
        html += `
            <div class="comparison-word">
                <h4>${word.word}</h4>
                <div class="word-phonetics">
                    ${word.phonetics?.uk ? `<div>UK: ${word.phonetics.uk}</div>` : ''}
                    ${word.phonetics?.us ? `<div>US: ${word.phonetics.us}</div>` : ''}
                </div>
                <div class="word-audio">
                    ${word.uk?.mp3 ? `
                        <button class="audio-btn" onclick="playAudio('${word.uk.mp3}')">
                            UK 🔊
                        </button>
                    ` : ''}
                    ${word.us?.mp3 ? `
                        <button class="audio-btn" onclick="playAudio('${word.us.mp3}')">
                            US 🔊
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}
