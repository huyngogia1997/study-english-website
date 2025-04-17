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

// Multi-phonetic search elements
const multiPhoneticSearchBtn = document.getElementById('multi-phonetic-search-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const selectedSoundsDisplay = document.getElementById('selected-sounds-display');
const phoneticCheckboxes = document.querySelectorAll('.phonetic-checkbox input');

// Sound comparison elements
const firstSoundSelect = document.getElementById('first-sound-select');
const secondSoundSelect = document.getElementById('second-sound-select');
const compareSoundsBtn = document.getElementById('compare-sounds-btn');
const firstSoundTitle = document.getElementById('first-sound-title').querySelector('span');
const secondSoundTitle = document.getElementById('second-sound-title').querySelector('span');
const firstSoundResults = document.getElementById('first-sound-results');
const secondSoundResults = document.getElementById('second-sound-results');
