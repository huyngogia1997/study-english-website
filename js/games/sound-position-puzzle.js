// Sound Position Puzzle
// Players must identify words where a sound appears in a specific position

class SoundPositionPuzzle {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.currentSound = null;
        this.currentPosition = null;
        this.correctWords = [];
        this.selectedWords = new Set();
        this.displayedWords = [];
        this.positions = ['first', 'middle', 'last'];
        this.allPhoneticSounds = [
            'æ', 'ə', 'ɑ', 'ɔ', 'ɛ', 'ɪ', 'i', 'ʊ', 'u', 'ʌ', 'e', 'ɒ',
            'p', 'b', 't', 'd', 'k', 'g', 'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ',
            'tʃ', 'dʒ', 'h', 'l', 'r', 'j', 'w', 'm', 'n', 'ŋ'
        ];
    }

    init() {
        this.render();
        this.startGame();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container sound-position-puzzle">
                <h2>Sound Position Puzzle</h2>
                <p>Select all words where the sound appears in the specified position:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="sound-position-score">0</span></div>
                    <div class="round">Round: <span id="sound-position-round">0</span>/${this.maxRounds}</div>
                </div>
                
                <div class="puzzle-instruction" id="sound-position-instruction"></div>
                
                <div class="word-grid" id="sound-position-words"></div>
                
                <div class="game-controls">
                    <button id="sound-position-check" class="primary-btn">Check Answer</button>
                    <button id="sound-position-next" class="secondary-btn" disabled>Next Puzzle</button>
                </div>
                
                <div id="sound-position-feedback" class="feedback"></div>
            </div>
        `;

        // Add event listeners
        document.getElementById('sound-position-check').addEventListener('click', () => this.checkAnswer());
        document.getElementById('sound-position-next').addEventListener('click', () => this.nextRound());
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
        this.selectedWords.clear();
        
        // Get a random sound and position
        this.getRandomSoundAndPosition();
        
        // Generate word options
        this.generateWordOptions();
        
        // Enable check button, disable next button
        document.getElementById('sound-position-check').disabled = false;
        document.getElementById('sound-position-next').disabled = true;
        
        // Clear feedback
        document.getElementById('sound-position-feedback').innerHTML = '';
    }

    getRandomSoundAndPosition() {
        // Select a random sound
        this.currentSound = this.allPhoneticSounds[Math.floor(Math.random() * this.allPhoneticSounds.length)];
        
        // Select a random position
        this.currentPosition = this.positions[Math.floor(Math.random() * this.positions.length)];
        
        // Update instruction
        document.getElementById('sound-position-instruction').innerHTML = `
            <p>Find words where the sound <span class="highlight">${this.currentSound}</span> 
            appears in the <span class="highlight">${this.currentPosition}</span> position.</p>
        `;
        
        // Find words that match the criteria
        this.findMatchingWords();
    }

    findMatchingWords() {
        // Filter words with phonetic transcriptions
        const wordsWithPhonetics = wordsData.filter(item => 
            item.value.phonetics?.uk || item.value.phonetics?.us
        );
        
        // Find words where the sound appears in the specified position
        this.correctWords = [];
        
        wordsWithPhonetics.forEach(item => {
            const word = item.value;
            const phonetic = word.phonetics?.uk || word.phonetics?.us || '';
            
            // Skip if no phonetic transcription
            if (!phonetic) return;
            
            // Find positions of the sound in the phonetic transcription
            const positions = [];
            let pos = phonetic.indexOf(this.currentSound);
            while (pos !== -1) {
                positions.push(pos);
                pos = phonetic.indexOf(this.currentSound, pos + 1);
            }
            
            // Skip if sound not found
            if (positions.length === 0) return;
            
            // Special handling for combined sounds
            if ((this.currentSound === 't' || this.currentSound === 'ʃ') && 
                phonetic.includes('tʃ')) {
                // Skip if the sound is only part of the combined sound
                if (!phonetic.replace('tʃ', '').includes(this.currentSound)) {
                    return;
                }
            }
            
            if ((this.currentSound === 'd' || this.currentSound === 'ʒ') && 
                phonetic.includes('dʒ')) {
                // Skip if the sound is only part of the combined sound
                if (!phonetic.replace('dʒ', '').includes(this.currentSound)) {
                    return;
                }
            }
            
            // Check if the sound appears in the specified position
            const phoneticLength = phonetic.length;
            let isInPosition = false;
            
            switch (this.currentPosition) {
                case 'first':
                    isInPosition = positions.some(pos => pos <= phoneticLength * 0.2);
                    break;
                case 'middle':
                    isInPosition = positions.some(pos => 
                        pos > phoneticLength * 0.2 && pos < phoneticLength * 0.8
                    );
                    break;
                case 'last':
                    isInPosition = positions.some(pos => pos >= phoneticLength * 0.8);
                    break;
            }
            
            if (isInPosition) {
                this.correctWords.push(word);
            }
        });
    }

    generateWordOptions() {
        const wordsContainer = document.getElementById('sound-position-words');
        wordsContainer.innerHTML = '';
        
        // Create a set of words to display
        this.displayedWords = [];
        
        // Add correct words (up to 5)
        const correctWordsToShow = this.correctWords
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
            
        this.displayedWords.push(...correctWordsToShow);
        
        // Add incorrect words
        const incorrectWords = wordsData
            .filter(item => 
                !this.correctWords.includes(item.value) && 
                (item.value.phonetics?.uk || item.value.phonetics?.us)
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, 10 - correctWordsToShow.length)
            .map(item => item.value);
            
        this.displayedWords.push(...incorrectWords);
        
        // Shuffle the displayed words
        this.displayedWords.sort(() => Math.random() - 0.5);
        
        // Create buttons for each word
        this.displayedWords.forEach(word => {
            const button = document.createElement('button');
            button.className = 'word-option';
            button.textContent = word.word;
            
            button.addEventListener('click', () => {
                if (this.selectedWords.has(word)) {
                    this.selectedWords.delete(word);
                    button.classList.remove('selected');
                } else {
                    this.selectedWords.add(word);
                    button.classList.add('selected');
                }
            });
            
            wordsContainer.appendChild(button);
        });
    }

    checkAnswer() {
        const feedbackContainer = document.getElementById('sound-position-feedback');
        
        // Calculate correct and incorrect selections
        const correctSelections = Array.from(this.selectedWords).filter(word => 
            this.correctWords.includes(word)
        );
        
        const incorrectSelections = Array.from(this.selectedWords).filter(word => 
            !this.correctWords.includes(word)
        );
        
        const missedWords = this.correctWords.filter(word => 
            this.displayedWords.includes(word) && !this.selectedWords.has(word)
        );
        
        // Calculate score
        const correctWordsInDisplay = this.displayedWords.filter(word => 
            this.correctWords.includes(word)
        ).length;
        
        const scoreForThisRound = Math.max(0, 
            correctSelections.length - incorrectSelections.length
        );
        
        this.score += scoreForThisRound;
        this.updateScore();
        
        // Generate feedback
        let feedback = '';
        
        if (correctSelections.length === correctWordsInDisplay && incorrectSelections.length === 0) {
            feedback = `<p class="success">Perfect! You identified all ${correctWordsInDisplay} correct words.</p>`;
        } else {
            feedback = `<p>You got ${correctSelections.length} out of ${correctWordsInDisplay} correct words.</p>`;
            
            if (incorrectSelections.length > 0) {
                feedback += `<p class="error">Incorrect selections: ${incorrectSelections.map(w => w.word).join(', ')}</p>`;
            }
            
            if (missedWords.length > 0) {
                feedback += `<p class="warning">Missed words: ${missedWords.map(w => w.word).join(', ')}</p>`;
            }
        }
        
        // Add phonetic information for correct words
        feedback += '<div class="phonetic-info"><h4>Phonetic Information:</h4><ul>';
        this.correctWords.forEach(word => {
            if (this.displayedWords.includes(word)) {
                const phonetic = word.phonetics?.uk || word.phonetics?.us || '';
                feedback += `<li>${word.word}: ${phonetic}</li>`;
            }
        });
        feedback += '</ul></div>';
        
        feedbackContainer.innerHTML = feedback;
        
        // Highlight correct and incorrect selections
        document.querySelectorAll('.word-option').forEach((button, index) => {
            const word = this.displayedWords[index];
            button.classList.remove('correct', 'incorrect');
            
            if (this.correctWords.includes(word)) {
                button.classList.add('correct');
            } else if (this.selectedWords.has(word)) {
                button.classList.add('incorrect');
            }
        });
        
        // Disable check button, enable next button
        document.getElementById('sound-position-check').disabled = true;
        document.getElementById('sound-position-next').disabled = false;
    }

    endGame() {
        const percentage = Math.round((this.score / this.maxRounds) * 100);
        
        this.container.innerHTML = `
            <div class="game-container sound-position-puzzle">
                <h2>Game Over!</h2>
                <div class="final-score">
                    <p>Your final score: ${this.score} out of ${this.maxRounds}</p>
                    <p>${percentage}% accuracy</p>
                </div>
                <button id="sound-position-restart" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('sound-position-restart').addEventListener('click', () => {
            this.init();
        });
    }

    updateScore() {
        document.getElementById('sound-position-score').textContent = this.score;
    }

    updateRound() {
        document.getElementById('sound-position-round').textContent = this.round;
    }
}
