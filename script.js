// DOM Elements
const wordInput = document.getElementById('word-input');
const wordSearchBtn = document.getElementById('word-search-btn');
const phoneticInput = document.getElementById('phonetic-input');
const phoneticSearchBtn = document.getElementById('phonetic-search-btn');
const phoneticButtons = document.querySelectorAll('.phonetic-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const searchPanels = document.querySelectorAll('.search-panel');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');

// Global variables
let wordsData = [];

// Initialize the application
async function initApp() {
    try {
        // Load words data
        await loadWordsData();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

// Load words data from online JSON file
async function loadWordsData() {
    showLoading(true);
    try {
        const response = await fetch('https://raw.githubusercontent.com/tyypgzl/Oxford-5000-words/refs/heads/main/full-word.json');
        if (!response.ok) {
            throw new Error('Failed to load words data');
        }
        wordsData = await response.json();
        console.log(`Loaded ${wordsData.length} words`);
    } catch (error) {
        console.error('Error loading words data:', error);
        showError('Failed to load dictionary data. Please try again later.');
    } finally {
        showLoading(false);
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

    // Phonetic search
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
        } else {
            panel.classList.remove('active');
        }
    });
}

// Search by word
function searchByWord(word) {
    showLoading(true);
    
    // Find exact match first
    const exactMatch = wordsData.find(item => 
        item.value.word.toLowerCase() === word.toLowerCase()
    );
    
    // Find partial matches
    const partialMatches = wordsData.filter(item => 
        item.value.word.toLowerCase().includes(word.toLowerCase()) && 
        item.value.word.toLowerCase() !== word.toLowerCase()
    ).slice(0, 10); // Limit to 10 partial matches
    
    const results = exactMatch ? [exactMatch, ...partialMatches] : partialMatches;
    
    displayResults(results);
    showLoading(false);
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
        
        // Check if the sound is present in either US or UK phonetics
        if (sound === 't' || sound === 'ʃ' || sound === 'd' || sound === 'ʒ') {
            // Special case handling
            return (usPhonetic.includes(sound) && !isSpecialCase(usPhonetic, sound)) || 
                   (ukPhonetic.includes(sound) && !isSpecialCase(ukPhonetic, sound));
        } else {
            // Normal case
            return usPhonetic.includes(sound) || ukPhonetic.includes(sound);
        }
    }).slice(0, 20); // Limit to 20 results
    
    displayResults(results);
    showLoading(false);
}

// Display search results
function displayResults(results) {
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    let html = '';
    
    results.forEach(result => {
        const word = result.value;
        
        html += `
            <div class="word-result">
                <div class="word-header">
                    <h2 class="word-title">${word.word}</h2>
                    ${word.level ? `<span class="word-level">${word.level}</span>` : ''}
                </div>
                
                ${word.type ? `<p class="word-type">${word.type}</p>` : ''}
                
                <div class="pronunciation">
                    <div class="pronunciation-title">Pronunciation:</div>
                    <div class="phonetics">
                        ${word.phonetics?.uk ? `<div>UK: ${word.phonetics.uk}</div>` : ''}
                        ${word.phonetics?.us ? `<div>US: ${word.phonetics.us}</div>` : ''}
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
                </div>
                
                <a href="${word.href}" target="_blank">View on Oxford Learner's Dictionary</a>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}

// Play audio
function playAudio(url) {
    const audio = new Audio(url);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Failed to play audio. Please try again.');
    });
}

// Show/hide loading indicator
function showLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    resultsContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Add this to the global scope for the onclick handlers
window.playAudio = playAudio;

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
// Multi-phonetic search functionality
const multiPhoneticSearchBtn = document.getElementById('multi-phonetic-search-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const selectedSoundsDisplay = document.getElementById('selected-sounds-display');
const phoneticCheckboxes = document.querySelectorAll('.phonetic-checkbox input');

// Set up multi-phonetic search event listeners
function setupMultiPhoneticSearch() {
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
    if (selectedSounds.length === 0) {
        selectedSoundsDisplay.textContent = 'None';
    } else {
        selectedSoundsDisplay.textContent = selectedSounds.join(', ');
    }
}

// Search for words containing all selected phonetic sounds
function searchByMultiplePhonetics(sounds) {
    showLoading(true);
    
    // Get search mode (AND or OR)
    const searchMode = document.querySelector('input[name="search-mode"]:checked').value;
    
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
    }).slice(0, 50); // Limit to 50 results
    
    displayResults(results);
    showLoading(false);
}

// Add multi-phonetic search setup to the initialization
function setupEventListeners() {
    // Existing event listeners...
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Word search
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

    // Phonetic search
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
    
    // Multi-phonetic search
    setupMultiPhoneticSearch();
}
// Sound comparison functionality
const firstSoundSelect = document.getElementById('first-sound-select');
const secondSoundSelect = document.getElementById('second-sound-select');
const compareSoundsBtn = document.getElementById('compare-sounds-btn');
const firstSoundTitle = document.getElementById('first-sound-title').querySelector('span');
const secondSoundTitle = document.getElementById('second-sound-title').querySelector('span');
const firstSoundResults = document.getElementById('first-sound-results');
const secondSoundResults = document.getElementById('second-sound-results');

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

// Scroll to a specific position section
function scrollToPosition(position) {
    const element = document.getElementById(`${position}-position-first-sound`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Set active position button
function setActivePositionButton(activeButton) {
    const buttons = document.querySelectorAll('.position-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
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
    
    // Calculate similarity scores and sort by most similar phonetic structure
    const firstSoundSimilar = findMostSimilarWords(firstSoundWords, firstSound);
    const secondSoundSimilar = findMostSimilarWords(secondSoundWords, secondSound);
    
    // Display the results
    displayComparisonResults(firstSoundSimilar, firstSoundResults);
    displayComparisonResults(secondSoundSimilar, secondSoundResults);
    
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

// Update the compareSounds function to use the new display function
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

// Display categorized results
function displayCategorizedResults(firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer) {
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
        return;
    }
    
    // Create containers for each position category
    let firstSoundHtml = '';
    let secondSoundHtml = '';
    
    // First position
    if (hasFirstPosition) {
        firstSoundHtml += '<div class="position-category"><h3>First Position</h3>';
        secondSoundHtml += '<div class="position-category"><h3>First Position</h3>';
        
        firstSoundHtml += createComparisonWordsHtml(firstPositionPairs.firstSoundWords);
        secondSoundHtml += createComparisonWordsHtml(firstPositionPairs.secondSoundWords);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
    }
    
    // Middle position
    if (hasMiddlePosition) {
        firstSoundHtml += '<div class="position-category"><h3>Middle Position</h3>';
        secondSoundHtml += '<div class="position-category"><h3>Middle Position</h3>';
        
        firstSoundHtml += createComparisonWordsHtml(middlePositionPairs.firstSoundWords);
        secondSoundHtml += createComparisonWordsHtml(middlePositionPairs.secondSoundWords);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
    }
    
    // Last position
    if (hasLastPosition) {
        firstSoundHtml += '<div class="position-category"><h3>Last Position</h3>';
        secondSoundHtml += '<div class="position-category"><h3>Last Position</h3>';
        
        firstSoundHtml += createComparisonWordsHtml(lastPositionPairs.firstSoundWords);
        secondSoundHtml += createComparisonWordsHtml(lastPositionPairs.secondSoundWords);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
    }
    
    firstSoundContainer.innerHTML = firstSoundHtml;
    secondSoundContainer.innerHTML = secondSoundHtml;
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

// Add sound comparison setup to the initialization
function setupEventListeners() {
    // Existing event listeners...
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Word search
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

    // Phonetic search
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
    
    // Multi-phonetic search
    setupMultiPhoneticSearch();
    
    // Sound comparison
    setupSoundComparison();
}
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

// Update the search functions to use pagination
function searchByWord(word) {
    showLoading(true);
    
    const results = wordsData.filter(item => 
        item.value.word.toLowerCase() === word.toLowerCase()
    );
    
    displayPaginatedResults(results, resultsContainer);
    showLoading(false);
}

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
    paginatedResults.phonetic = results;
    
    // Display paginated results
    displayResultsPage(1, results, resultsContainer);
    
    // Create pagination controls
    const totalPages = Math.ceil(results.length / itemsPerPage);
    createPaginationControls(totalPages, resultsContainer, 'phonetic');
    
    showLoading(false);
}

// Update the multi-phonetic search to use pagination
function searchByMultiplePhonetics(sounds) {
    showLoading(true);
    
    // Get search mode (AND or OR)
    const searchMode = document.querySelector('input[name="search-mode"]:checked').value;
    
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
    
    // Store results for pagination
    paginatedResults.multiPhonetic = results;
    
    // Display paginated results
    displayResultsPage(1, results, resultsContainer);
    
    // Create pagination controls
    const totalPages = Math.ceil(results.length / itemsPerPage);
    createPaginationControls(totalPages, resultsContainer, 'multiPhonetic');
    
    showLoading(false);
}

// Update the display categorized results function to use pagination
function displayCategorizedResults(firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer) {
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
        return;
    }
    
    // Create containers for each position category
    let firstSoundHtml = '';
    let secondSoundHtml = '';
    
    // First position
    if (hasFirstPosition) {
        firstSoundHtml += '<div class="position-category" id="first-position-first-sound"><h3>First Position</h3>';
        secondSoundHtml += '<div class="position-category" id="first-position-second-sound"><h3>First Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = firstPositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = firstPositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (firstPositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                firstPositionPairs.firstSoundWords.length,
                firstPositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="first-position-pagination-first"></div>';
            secondSoundHtml += '<div id="first-position-pagination-second"></div>';
        }
    }
    
    // Middle position
    if (hasMiddlePosition) {
        firstSoundHtml += '<div class="position-category" id="middle-position-first-sound"><h3>Middle Position</h3>';
        secondSoundHtml += '<div class="position-category" id="middle-position-second-sound"><h3>Middle Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = middlePositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = middlePositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (middlePositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                middlePositionPairs.firstSoundWords.length,
                middlePositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="middle-position-pagination-first"></div>';
            secondSoundHtml += '<div id="middle-position-pagination-second"></div>';
        }
    }
    
    // Last position
    if (hasLastPosition) {
        firstSoundHtml += '<div class="position-category" id="last-position-first-sound"><h3>Last Position</h3>';
        secondSoundHtml += '<div class="position-category" id="last-position-second-sound"><h3>Last Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = lastPositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = lastPositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (lastPositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                lastPositionPairs.firstSoundWords.length,
                lastPositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="last-position-pagination-first"></div>';
            secondSoundHtml += '<div id="last-position-pagination-second"></div>';
        }
    }
    
    firstSoundContainer.innerHTML = firstSoundHtml;
    secondSoundContainer.innerHTML = secondSoundHtml;
    
    // Add pagination controls
    if (hasFirstPosition && firstPositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            firstPositionPairs.firstSoundWords.length,
            firstPositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('first-position-pagination-first'),
            document.getElementById('first-position-pagination-second'),
            'first'
        );
    }
    
    if (hasMiddlePosition && middlePositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            middlePositionPairs.firstSoundWords.length,
            middlePositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('middle-position-pagination-first'),
            document.getElementById('middle-position-pagination-second'),
            'middle'
        );
    }
    
    if (hasLastPosition && lastPositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            lastPositionPairs.firstSoundWords.length,
            lastPositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('last-position-pagination-first'),
            document.getElementById('last-position-pagination-second'),
            'last'
        );
    }
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
// Modified displayCategorizedResults function to handle position navigation
function displayCategorizedResultsWithNavigation(firstPositionPairs, middlePositionPairs, lastPositionPairs, firstSoundContainer, secondSoundContainer) {
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
    
    // Create containers for each position category
    let firstSoundHtml = '';
    let secondSoundHtml = '';
    
    // First position
    if (hasFirstPosition) {
        firstSoundHtml += '<div class="position-category" id="first-position-first-sound"><h3>First Position</h3>';
        secondSoundHtml += '<div class="position-category" id="first-position-second-sound"><h3>First Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = firstPositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = firstPositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (firstPositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                firstPositionPairs.firstSoundWords.length,
                firstPositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="first-position-pagination-first"></div>';
            secondSoundHtml += '<div id="first-position-pagination-second"></div>';
        }
    }
    
    // Middle position
    if (hasMiddlePosition) {
        firstSoundHtml += '<div class="position-category" id="middle-position-first-sound"><h3>Middle Position</h3>';
        secondSoundHtml += '<div class="position-category" id="middle-position-second-sound"><h3>Middle Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = middlePositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = middlePositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (middlePositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                middlePositionPairs.firstSoundWords.length,
                middlePositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="middle-position-pagination-first"></div>';
            secondSoundHtml += '<div id="middle-position-pagination-second"></div>';
        }
    }
    
    // Last position
    if (hasLastPosition) {
        firstSoundHtml += '<div class="position-category" id="last-position-first-sound"><h3>Last Position</h3>';
        secondSoundHtml += '<div class="position-category" id="last-position-second-sound"><h3>Last Position</h3>';
        
        // Display first page of results
        const firstSoundFirstPage = lastPositionPairs.firstSoundWords.slice(0, itemsPerPage);
        const secondSoundFirstPage = lastPositionPairs.secondSoundWords.slice(0, itemsPerPage);
        
        firstSoundHtml += createComparisonWordsHtml(firstSoundFirstPage);
        secondSoundHtml += createComparisonWordsHtml(secondSoundFirstPage);
        
        firstSoundHtml += '</div>';
        secondSoundHtml += '</div>';
        
        // Add pagination controls if needed
        if (lastPositionPairs.firstSoundWords.length > itemsPerPage) {
            const totalPages = Math.ceil(Math.max(
                lastPositionPairs.firstSoundWords.length,
                lastPositionPairs.secondSoundWords.length
            ) / itemsPerPage);
            
            firstSoundHtml += '<div id="last-position-pagination-first"></div>';
            secondSoundHtml += '<div id="last-position-pagination-second"></div>';
        }
    }
    
    firstSoundContainer.innerHTML = firstSoundHtml;
    secondSoundContainer.innerHTML = secondSoundHtml;
    
    // Add pagination controls
    if (hasFirstPosition && firstPositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            firstPositionPairs.firstSoundWords.length,
            firstPositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('first-position-pagination-first'),
            document.getElementById('first-position-pagination-second'),
            'first'
        );
    }
    
    if (hasMiddlePosition && middlePositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            middlePositionPairs.firstSoundWords.length,
            middlePositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('middle-position-pagination-first'),
            document.getElementById('middle-position-pagination-second'),
            'middle'
        );
    }
    
    if (hasLastPosition && lastPositionPairs.firstSoundWords.length > itemsPerPage) {
        const totalPages = Math.ceil(Math.max(
            lastPositionPairs.firstSoundWords.length,
            lastPositionPairs.secondSoundWords.length
        ) / itemsPerPage);
        
        createSoundComparisonPaginationControls(
            totalPages, 
            document.getElementById('last-position-pagination-first'),
            document.getElementById('last-position-pagination-second'),
            'last'
        );
    }
    
    // Set the first available position button as active
    if (hasFirstPosition) {
        setActivePositionButton(document.getElementById('first-position-btn'));
        scrollToPosition('first');
    } else if (hasMiddlePosition) {
        setActivePositionButton(document.getElementById('middle-position-btn'));
        scrollToPosition('middle');
    } else if (hasLastPosition) {
        setActivePositionButton(document.getElementById('last-position-btn'));
        scrollToPosition('last');
    }
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
