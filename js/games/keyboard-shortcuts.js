// Keyboard Shortcuts for Games
// This file contains additional keyboard shortcuts for individual games

// Add keyboard shortcuts to Sound Matching Game
function addSoundMatchingKeyboardShortcuts(game) {
    document.addEventListener('keydown', (e) => {
        // Only process if this game is active
        if (!game.isActive) return;
        
        // Check button
        if (e.key === 'Enter') {
            const checkButton = document.getElementById('sound-matching-check');
            if (checkButton && !checkButton.disabled) {
                checkButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Next button
        if (e.key === ' ' || e.key === 'n') {
            const nextButton = document.getElementById('sound-matching-next');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Number keys to select sound options (1-9)
        if (/^[1-9]$/.test(e.key)) {
            const index = parseInt(e.key) - 1;
            const soundOptions = document.querySelectorAll('.sound-option');
            if (index < soundOptions.length) {
                soundOptions[index].click();
                e.preventDefault();
            }
            return;
        }
    });
}

// Add keyboard shortcuts to Minimal Pairs Challenge
function addMinimalPairsKeyboardShortcuts(game) {
    document.addEventListener('keydown', (e) => {
        // Only process if this game is active
        if (!game.isActive) return;
        
        // Play sound
        if (e.key === 'p') {
            const playButton = document.getElementById('minimal-pairs-play');
            if (playButton && !playButton.disabled) {
                playButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Left/right to select options
        if (e.key === 'ArrowLeft' || e.key === '1') {
            const options = document.querySelectorAll('.word-option');
            if (options.length > 0) {
                options[0].click();
                e.preventDefault();
            }
            return;
        }
        
        if (e.key === 'ArrowRight' || e.key === '2') {
            const options = document.querySelectorAll('.word-option');
            if (options.length > 1) {
                options[1].click();
                e.preventDefault();
            }
            return;
        }
        
        // Check button
        if (e.key === 'Enter') {
            const checkButton = document.getElementById('minimal-pairs-check');
            if (checkButton && !checkButton.disabled) {
                checkButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Next button
        if (e.key === ' ' || e.key === 'n') {
            const nextButton = document.getElementById('minimal-pairs-next');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                e.preventDefault();
            }
            return;
        }
    });
}

// Add keyboard shortcuts to Sound Position Puzzle
function addSoundPositionKeyboardShortcuts(game) {
    document.addEventListener('keydown', (e) => {
        // Only process if this game is active
        if (!game.isActive) return;
        
        // Check button
        if (e.key === 'Enter') {
            const checkButton = document.getElementById('sound-position-check');
            if (checkButton && !checkButton.disabled) {
                checkButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Next button
        if (e.key === ' ' || e.key === 'n') {
            const nextButton = document.getElementById('sound-position-next');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Number keys to select words (1-9)
        if (/^[1-9]$/.test(e.key)) {
            const index = parseInt(e.key) - 1;
            const wordOptions = document.querySelectorAll('.word-option');
            if (index < wordOptions.length) {
                wordOptions[index].click();
                e.preventDefault();
            }
            return;
        }
    });
}

// Add keyboard shortcuts to Phonetic Hangman
// (No need to add specific shortcuts as the game already uses keyboard input)

// Add keyboard shortcuts to Sound Sorting Game
function addSoundSortingKeyboardShortcuts(game) {
    document.addEventListener('keydown', (e) => {
        // Only process if this game is active
        if (!game.isActive) return;
        
        // Check button
        if (e.key === 'Enter') {
            const checkButton = document.getElementById('sound-sorting-check');
            if (checkButton && !checkButton.disabled) {
                checkButton.click();
                e.preventDefault();
            }
            return;
        }
        
        // Next button
        if (e.key === ' ' || e.key === 'n') {
            const nextButton = document.getElementById('sound-sorting-next');
            if (nextButton && !nextButton.disabled) {
                nextButton.click();
                e.preventDefault();
            }
            return;
        }
    });
}

// Add a keyboard shortcuts help section to the games tab
function addKeyboardShortcutsHelp() {
    const gamesContainer = document.querySelector('.games-container');
    if (!gamesContainer) return;
    
    const helpSection = document.createElement('div');
    helpSection.className = 'keyboard-shortcuts-help';
    helpSection.innerHTML = `
        <h3>Keyboard Shortcuts</h3>
        <ul>
            <li><kbd>1</kbd> - <kbd>5</kbd> Select and start a game</li>
            <li><kbd>Esc</kbd> Return to game menu</li>
            <li><kbd>Enter</kbd> Check answer</li>
            <li><kbd>Space</kbd> or <kbd>N</kbd> Next round</li>
            <li><kbd>P</kbd> Play audio (in Minimal Pairs)</li>
            <li><kbd>←</kbd> / <kbd>→</kbd> Select left/right option (in Minimal Pairs)</li>
            <li><kbd>1</kbd> - <kbd>9</kbd> Select options in games</li>
        </ul>
    `;
    
    gamesContainer.appendChild(helpSection);
}

// Initialize keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    addKeyboardShortcutsHelp();
});
