// Phonetic Hangman
// Players must guess a word based on its phonetic transcription

class PhoneticHangman {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.currentWord = null;
        this.guessedLetters = new Set();
        this.maxGuesses = 8;
        this.remainingGuesses = this.maxGuesses;
    }

    init() {
        this.render();
        this.startGame();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container phonetic-hangman">
                <h2>Phonetic Hangman</h2>
                <p>Guess the word based on its phonetic transcription:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="phonetic-hangman-score">0</span></div>
                    <div class="round">Round: <span id="phonetic-hangman-round">0</span>/${this.maxRounds}</div>
                    <div class="guesses">Guesses left: <span id="phonetic-hangman-guesses">8</span></div>
                </div>
                
                <div class="phonetic-display" id="phonetic-hangman-phonetic"></div>
                
                <div class="word-display" id="phonetic-hangman-word"></div>
                
                <div class="keyboard" id="phonetic-hangman-keyboard"></div>
                
                <div class="game-controls">
                    <button id="phonetic-hangman-next" class="secondary-btn" disabled>Next Word</button>
                </div>
                
                <div id="phonetic-hangman-feedback" class="feedback"></div>
            </div>
        `;

        // Add event listener for next button
        document.getElementById('phonetic-hangman-next').addEventListener('click', () => this.nextRound());
    }

    startGame() {
        this.score = 0;
        this.round = 0;
        this.updateScore();
        this.nextRound();
    }

    nextRound() {
        if (this.round >= this.maxRounds) {
            this.endGame();
            return;
        }

        this.round++;
        this.updateRound();
        this.guessedLetters.clear();
        this.remainingGuesses = this.maxGuesses;
        this.updateGuesses();
        
        // Get a random word
        this.getRandomWord();
        
        // Render the word display
        this.renderWordDisplay();
        
        // Render the keyboard
        this.renderKeyboard();
        
        // Disable next button
        document.getElementById('phonetic-hangman-next').disabled = true;
        
        // Clear feedback
        document.getElementById('phonetic-hangman-feedback').innerHTML = '';
    }

    getRandomWord() {
        // Filter words with phonetic transcriptions and reasonable length
        const wordsWithPhonetics = wordsData.filter(item => 
            (item.value.phonetics?.uk || item.value.phonetics?.us) && 
            item.value.word.length >= 4 && 
            item.value.word.length <= 10 &&
            !/[^a-zA-Z]/.test(item.value.word) // Only include words with letters only
        );
        
        if (wordsWithPhonetics.length === 0) {
            document.getElementById('phonetic-hangman-feedback').innerHTML = 
                '<p class="error">No suitable words found.</p>';
            return;
        }
        
        // Select a random word
        const randomIndex = Math.floor(Math.random() * wordsWithPhonetics.length);
        this.currentWord = wordsWithPhonetics[randomIndex].value;
        
        // Display the phonetic transcription
        document.getElementById('phonetic-hangman-phonetic').textContent = 
            this.currentWord.phonetics?.uk || this.currentWord.phonetics?.us || '';
    }

    renderWordDisplay() {
        const wordDisplay = document.getElementById('phonetic-hangman-word');
        
        if (!this.currentWord) {
            wordDisplay.textContent = '';
            return;
        }
        
        const wordText = this.currentWord.word.toLowerCase();
        let displayText = '';
        
        for (const letter of wordText) {
            if (this.guessedLetters.has(letter) || letter === ' ') {
                displayText += letter + ' ';
            } else {
                displayText += '_ ';
            }
        }
        
        wordDisplay.textContent = displayText;
    }

    renderKeyboard() {
        const keyboard = document.getElementById('phonetic-hangman-keyboard');
        keyboard.innerHTML = '';
        
        // Create buttons for each letter
        const rows = [
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ];
        
        rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            for (const letter of row) {
                const button = document.createElement('button');
                button.className = 'keyboard-key';
                button.textContent = letter;
                button.disabled = this.guessedLetters.has(letter);
                
                button.addEventListener('click', () => this.makeGuess(letter));
                
                rowDiv.appendChild(button);
            }
            
            keyboard.appendChild(rowDiv);
        });
    }

    makeGuess(letter) {
        // Add letter to guessed letters
        this.guessedLetters.add(letter);
        
        // Check if the letter is in the word
        const wordText = this.currentWord.word.toLowerCase();
        const isCorrect = wordText.includes(letter);
        
        // Update guesses remaining if incorrect
        if (!isCorrect) {
            this.remainingGuesses--;
            this.updateGuesses();
        }
        
        // Update the word display
        this.renderWordDisplay();
        
        // Update the keyboard
        this.renderKeyboard();
        
        // Check if the game is won or lost
        this.checkGameStatus();
    }

    checkGameStatus() {
        const wordText = this.currentWord.word.toLowerCase();
        
        // Check if all letters have been guessed
        const allLettersGuessed = [...wordText].every(letter => 
            this.guessedLetters.has(letter) || letter === ' '
        );
        
        // Check if out of guesses
        const outOfGuesses = this.remainingGuesses <= 0;
        
        if (allLettersGuessed || outOfGuesses) {
            // Game is over for this round
            const feedbackContainer = document.getElementById('phonetic-hangman-feedback');
            
            if (allLettersGuessed) {
                // Player won
                this.score++;
                this.updateScore();
                feedbackContainer.innerHTML = '<p class="success">You won! You guessed the word correctly.</p>';
            } else {
                // Player lost
                feedbackContainer.innerHTML = `<p class="error">You lost! The word was "${this.currentWord.word}".</p>`;
            }
            
            // Add audio controls if available
            if (this.currentWord.uk?.mp3 || this.currentWord.us?.mp3) {
                let audioHtml = '<div class="audio-controls">';
                
                if (this.currentWord.uk?.mp3) {
                    audioHtml += `<button class="audio-btn" onclick="playAudio('${this.currentWord.uk.mp3}')">Play UK 🔊</button>`;
                }
                
                if (this.currentWord.us?.mp3) {
                    audioHtml += `<button class="audio-btn" onclick="playAudio('${this.currentWord.us.mp3}')">Play US 🔊</button>`;
                }
                
                audioHtml += '</div>';
                feedbackContainer.innerHTML += audioHtml;
            }
            
            // Enable next button
            document.getElementById('phonetic-hangman-next').disabled = false;
            
            // Disable all keyboard keys
            document.querySelectorAll('.keyboard-key').forEach(button => {
                button.disabled = true;
            });
        }
    }

    endGame() {
        const percentage = Math.round((this.score / this.maxRounds) * 100);
        
        this.container.innerHTML = `
            <div class="game-container phonetic-hangman">
                <h2>Game Over!</h2>
                <div class="final-score">
                    <p>Your final score: ${this.score} out of ${this.maxRounds}</p>
                    <p>${percentage}% accuracy</p>
                </div>
                <button id="phonetic-hangman-restart" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('phonetic-hangman-restart').addEventListener('click', () => {
            this.init();
        });
    }

    updateScore() {
        document.getElementById('phonetic-hangman-score').textContent = this.score;
    }

    updateRound() {
        document.getElementById('phonetic-hangman-round').textContent = this.round;
    }

    updateGuesses() {
        document.getElementById('phonetic-hangman-guesses').textContent = this.remainingGuesses;
    }
}
