// DOM Elements
const wordInput = document.getElementById('word-input');
const wordSearchBtn = document.getElementById('word-search-btn');
const resultsContainer = document.getElementById('results');
const loadingIndicator = document.getElementById('loading');
const tabButtons = document.querySelectorAll('.tab-btn');
const searchPanels = document.querySelectorAll('.search-panel');
const phoneticInput = document.getElementById('phonetic-input');
const phoneticSearchBtn = document.getElementById('phonetic-search-btn');
const phoneticButtons = document.querySelectorAll('.phonetic-btn');
const phoneticCheckboxes = document.querySelectorAll('.multi-phonetic-checkbox');
const multiPhoneticSearchBtn = document.getElementById('multi-phonetic-search-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const selectedSoundsDisplay = document.getElementById('selected-sounds');
const firstSoundSelect = document.getElementById('first-sound-select');
const secondSoundSelect = document.getElementById('second-sound-select');
const compareSoundsBtn = document.getElementById('compare-sounds-btn');
const firstSoundResults = document.getElementById('first-sound-results');
const secondSoundResults = document.getElementById('second-sound-results');
const firstSoundTitle = document.getElementById('first-sound-title');
const secondSoundTitle = document.getElementById('second-sound-title');
const positionNavigation = document.getElementById('position-navigation');
const positionButtons = document.querySelectorAll('.position-btn');
const recordButton = document.getElementById('record-button');
const replayButton = document.getElementById('replay-button');
const recognizedText = document.getElementById('recognized-text');
const recordingStatus = document.getElementById('recording-status');
const sortSelect = document.getElementById('sort-select');
const savedWordsContainer = document.getElementById('saved-words-results');
const savedWordsCount = document.getElementById('saved-words-count');
const savedWordsCountHeader = document.getElementById('saved-words-count-header');
const exportSavedWordsBtn = document.getElementById('export-saved-words');
const clearSavedWordsBtn = document.getElementById('clear-saved-words');
const savedWordsSortSelect = document.getElementById('saved-words-sort-select');
const gamesGrid = document.getElementById('games-grid');
const gameArea = document.getElementById('game-area');

// Create results container if it doesn't exist
function ensureResultsContainer() {
    if (!document.getElementById('results')) {
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        document.querySelector('.content').appendChild(resultsDiv);
        return resultsDiv;
    }
    return document.getElementById('results');
}

// Show/hide loading indicator
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (!loadingElement) return;
    
    if (isLoading) {
        loadingElement.classList.remove('hidden');
        console.log('Main app: Loading indicator shown');
    } else {
        loadingElement.classList.add('hidden');
        console.log('Main app: Loading indicator hidden');
    }
}
