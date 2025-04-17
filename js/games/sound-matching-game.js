// Sound Matching Game
// Players must select the phonetic sounds that appear in a given word

class SoundMatchingGame {
    constructor(container) {
        this.container = container;
        this.currentWord = null;
        this.correctSounds = [];
        this.selectedSounds = new Set();
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
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
            <div class="game-container sound-matching-game">
                <h2>Sound Matching Game</h2>
                <p>Select all the phonetic sounds that appear in the word:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="sound-matching-score">0</span></div>
                    <div class="round">Round: <span id="sound-matching-round">0</span>/${this.maxRounds}</div>
                </div>
                
                <div class="word-display">
                    <h3 id="sound-matching-word"></h3>
                    <div id="sound-matching-phonetic"></div>
                    <div class="audio-controls" id="sound-matching-audio"></div>
                </div>
                
                <div class="sound-options" id="sound-matching-options"></div>
                
                <div class="game-controls">
                    <button id="sound-matching-check" class="primary-btn">Check Answer</button>
                    <button id="sound-matching-next" class="secondary-btn" disabled>Next Word</button>
                </div>
                
                <div id="sound-matching-feedback" class="feedback"></div>
            </div>
        `;

        // Add event listeners
        document.getElementById('sound-matching-check').addEventListener('click', () => this.checkAnswer());
        document.getElementById('sound-matching-next').addEventListener('click', () => this.nextRound());
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
        this.selectedSounds.clear();
        
        // Get a random word with phonetic transcription
        this.getRandomWord();
        
        // Enable check button, disable next button
        document.getElementById('sound-matching-check').disabled = false;
        document.getElementById('sound-matching-next').disabled = true;
        
        // Clear feedback
        document.getElementById('sound-matching-feedback').innerHTML = '';
    }

    getRandomWord() {
        // Filter words that have phonetic transcriptions
        const wordsWithPhonetics = wordsData.filter(item => 
            (item.value.phonetics?.uk || item.value.phonetics?.us) && 
            (item.value.phonetics?.uk?.length > 3 || item.value.phonetics?.us?.length > 3)
        );
        
        if (wordsWithPhonetics.length === 0) {
            document.getElementById('sound-matching-feedback').innerHTML = 
                '<p class="error">No words with phonetic transcriptions found.</p>';
            return;
        }
        
        // Select a random word
        const randomIndex = Math.floor(Math.random() * wordsWithPhonetics.length);
        this.currentWord = wordsWithPhonetics[randomIndex].value;
        
        // Display the word
        document.getElementById('sound-matching-word').textContent = this.currentWord.word;
        
        // Hide the phonetic transcription during the game
        document.getElementById('sound-matching-phonetic').textContent = '?????';
        
        // Add audio controls if available
        const audioContainer = document.getElementById('sound-matching-audio');
        audioContainer.innerHTML = '';
        
        if (this.currentWord.uk?.mp3) {
            const ukButton = document.createElement('button');
            ukButton.className = 'audio-btn';
            ukButton.textContent = 'Play UK 🔊';
            ukButton.onclick = () => playAudio(this.currentWord.uk.mp3);
            audioContainer.appendChild(ukButton);
        }
        
        if (this.currentWord.us?.mp3) {
            const usButton = document.createElement('button');
            usButton.className = 'audio-btn';
            usButton.textContent = 'Play US 🔊';
            usButton.onclick = () => playAudio(this.currentWord.us.mp3);
            audioContainer.appendChild(usButton);
        }
        
        // Determine correct sounds
        this.determineCorrectSounds();
        
        // Generate sound options
        this.generateSoundOptions();
    }

    determineCorrectSounds() {
        this.correctSounds = [];
        const phonetic = this.currentWord.phonetics?.uk || this.currentWord.phonetics?.us || '';
        
        // Check each sound to see if it appears in the phonetic transcription
        this.allPhoneticSounds.forEach(sound => {
            // Special handling for combined sounds
            if ((sound === 't' || sound === 'ʃ') && phonetic.includes('tʃ')) {
                // Skip individual sounds that are part of combined sounds
                if (!phonetic.includes(sound + sound) && 
                    !phonetic.replace('tʃ', '').includes(sound)) {
                    return;
                }
            }
            
            if ((sound === 'd' || sound === 'ʒ') && phonetic.includes('dʒ')) {
                // Skip individual sounds that are part of combined sounds
                if (!phonetic.includes(sound + sound) && 
                    !phonetic.replace('dʒ', '').includes(sound)) {
                    return;
                }
            }
            
            // Add the sound if it appears in the phonetic transcription
            if (phonetic.includes(sound)) {
                this.correctSounds.push(sound);
            }
        });
        
        // Make sure combined sounds are included
        if (phonetic.includes('tʃ') && !this.correctSounds.includes('tʃ')) {
            this.correctSounds.push('tʃ');
        }
        
        if (phonetic.includes('dʒ') && !this.correctSounds.includes('dʒ')) {
            this.correctSounds.push('dʒ');
        }
    }

    generateSoundOptions() {
        const optionsContainer = document.getElementById('sound-matching-options');
        optionsContainer.innerHTML = '';
        
        // Create a set of sounds to display
        const displaySounds = new Set(this.correctSounds);
        
        // Add some incorrect sounds
        while (displaySounds.size < Math.min(12, this.allPhoneticSounds.length)) {
            const randomSound = this.allPhoneticSounds[Math.floor(Math.random() * this.allPhoneticSounds.length)];
            displaySounds.add(randomSound);
        }
        
        // Convert to array and shuffle
        const shuffledSounds = Array.from(displaySounds).sort(() => Math.random() - 0.5);
        
        // Create buttons for each sound
        shuffledSounds.forEach(sound => {
            const button = document.createElement('button');
            button.className = 'sound-option';
            button.textContent = sound;
            button.dataset.sound = sound;
            
            button.addEventListener('click', () => {
                if (this.selectedSounds.has(sound)) {
                    this.selectedSounds.delete(sound);
                    button.classList.remove('selected');
                } else {
                    this.selectedSounds.add(sound);
                    button.classList.add('selected');
                }
            });
            
            optionsContainer.appendChild(button);
        });
    }

    checkAnswer() {
        const feedbackContainer = document.getElementById('sound-matching-feedback');
        const phoneticDisplay = document.getElementById('sound-matching-phonetic');
        
        // Show the actual phonetic transcription
        phoneticDisplay.textContent = this.currentWord.phonetics?.uk || this.currentWord.phonetics?.us || '';
        
        // Calculate correct and incorrect selections
        const correctSelections = Array.from(this.selectedSounds).filter(sound => 
            this.correctSounds.includes(sound)
        );
        
        const incorrectSelections = Array.from(this.selectedSounds).filter(sound => 
            !this.correctSounds.includes(sound)
        );
        
        const missedSounds = this.correctSounds.filter(sound => 
            !this.selectedSounds.has(sound)
        );
        
        // Calculate score
        const totalCorrectSounds = this.correctSounds.length;
        const scoreForThisRound = Math.max(0, 
            correctSelections.length - incorrectSelections.length
        );
        
        this.score += scoreForThisRound;
        this.updateScore();
        
        // Generate feedback
        let feedback = '';
        
        if (correctSelections.length === totalCorrectSounds && incorrectSelections.length === 0) {
            feedback = `<p class="success">Perfect! You identified all ${totalCorrectSounds} sounds correctly.</p>`;
        } else {
            feedback = `<p>You got ${correctSelections.length} out of ${totalCorrectSounds} sounds correct.</p>`;
            
            if (incorrectSelections.length > 0) {
                feedback += `<p class="error">Incorrect selections: ${incorrectSelections.join(', ')}</p>`;
            }
            
            if (missedSounds.length > 0) {
                feedback += `<p class="warning">Missed sounds: ${missedSounds.join(', ')}</p>`;
            }
        }
        
        feedbackContainer.innerHTML = feedback;
        
        // Highlight correct and incorrect selections
        document.querySelectorAll('.sound-option').forEach(button => {
            const sound = button.dataset.sound;
            button.classList.remove('correct', 'incorrect');
            
            if (this.correctSounds.includes(sound)) {
                button.classList.add('correct');
            } else if (this.selectedSounds.has(sound)) {
                button.classList.add('incorrect');
            }
        });
        
        // Disable check button, enable next button
        document.getElementById('sound-matching-check').disabled = true;
        document.getElementById('sound-matching-next').disabled = false;
    }

    endGame() {
        const percentage = Math.round((this.score / this.maxRounds) * 100);
        
        this.container.innerHTML = `
            <div class="game-container sound-matching-game">
                <h2>Game Over!</h2>
                <div class="final-score">
                    <p>Your final score: ${this.score} out of ${this.maxRounds}</p>
                    <p>${percentage}% accuracy</p>
                </div>
                <button id="sound-matching-restart" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('sound-matching-restart').addEventListener('click', () => {
            this.init();
        });
    }

    updateScore() {
        document.getElementById('sound-matching-score').textContent = this.score;
    }

    updateRound() {
        document.getElementById('sound-matching-round').textContent = this.round;
    }
}
