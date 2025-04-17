// Games Manager
// Handles the initialization and switching between different games

// Available games
const availableGames = [
    {
        id: 'sound-matching',
        name: 'Sound Matching Game',
        description: 'Select all the phonetic sounds that appear in a given word.',
        class: SoundMatchingGame
    },
    {
        id: 'minimal-pairs',
        name: 'Minimal Pairs Challenge',
        description: 'Listen to the audio and identify which word you hear from similar-sounding pairs.',
        class: MinimalPairsChallenge
    },
    {
        id: 'sound-position',
        name: 'Sound Position Puzzle',
        description: 'Find words where a specific sound appears in a given position (first, middle, or last).',
        class: SoundPositionPuzzle
    },
    {
        id: 'phonetic-hangman',
        name: 'Phonetic Hangman',
        description: 'Guess the word based on its phonetic transcription.',
        class: PhoneticHangman
    },
    {
        id: 'sound-sorting',
        name: 'Sound Sorting',
        description: 'Sort words into categories based on the phonetic sounds they contain.',
        class: SoundSortingGame
    }
];

// Current active game
let currentGame = null;

// Initialize games
function initGames() {
    console.log("Initializing games...");
    // Render game selection menu
    renderGameMenu();
    
    // Set up event listeners
    setupGamesEventListeners();
}

// Render game selection menu
function renderGameMenu() {
    const gamesGrid = document.getElementById('games-grid');
    if (!gamesGrid) {
        console.error("Games grid element not found");
        return;
    }
    
    let html = '';
    
    availableGames.forEach(game => {
        html += `
            <div class="game-card" data-game-id="${game.id}">
                <h3>${game.name}</h3>
                <p>${game.description}</p>
                <button class="play-btn" data-game-id="${game.id}">Play</button>
            </div>
        `;
    });
    
    gamesGrid.innerHTML = html;
    console.log("Game menu rendered with", availableGames.length, "games");
}

// Set up games event listeners
function setupGamesEventListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('play-btn')) {
            const gameId = e.target.dataset.gameId;
            console.log("Starting game:", gameId);
            startGame(gameId);
        }
        
        if (e.target.id === 'back-to-games') {
            console.log("Returning to game menu");
            showGameMenu();
        }
    });
}

// Start a game
function startGame(gameId) {
    const game = availableGames.find(g => g.id === gameId);
    
    if (!game) {
        console.error("Game not found:", gameId);
        return;
    }
    
    // Get the game area
    const gameArea = document.getElementById('game-area');
    if (!gameArea) {
        console.error("Game area element not found");
        return;
    }
    
    // Add back button
    gameArea.innerHTML = `
        <div class="game-header">
            <button id="back-to-games" class="back-btn">← Back to Games</button>
            <h2>${game.name}</h2>
        </div>
        <div id="game-content"></div>
    `;
    
    // Hide game menu
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.style.display = 'none';
    });
    
    // Show game area
    gameArea.style.display = 'block';
    
    // Initialize the game
    const gameContent = document.getElementById('game-content');
    if (!gameContent) {
        console.error("Game content element not found");
        return;
    }
    
    try {
        console.log("Initializing game:", game.name);
        currentGame = new game.class(gameContent);
        currentGame.init();
    } catch (error) {
        console.error("Error initializing game:", error);
        gameContent.innerHTML = `<p class="error">Error loading game: ${error.message}</p>`;
    }
}

// Show game menu
function showGameMenu() {
    // Show game cards
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.style.display = 'block';
    });
    
    // Clear game area
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
        gameArea.innerHTML = '';
        gameArea.style.display = 'none';
    }
    
    // Clear current game
    currentGame = null;
}
