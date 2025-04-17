// Sound Sorting Game
// Players must sort words into categories based on their sounds

class SoundSortingGame {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 5;
        this.currentSounds = [];
        this.wordsToSort = [];
        this.sortedWords = {};
        this.soundPairs = [
            ['æ', 'ʌ', 'ɑ'], // Short vowels
            ['iː', 'ɪ', 'e'], // Front vowels
            ['uː', 'ʊ', 'ɔ'], // Back vowels
            ['eɪ', 'aɪ', 'ɔɪ'], // Diphthongs
            ['p', 't', 'k'], // Voiceless stops
            ['b', 'd', 'g'], // Voiced stops
            ['f', 'θ', 's'], // Voiceless fricatives
            ['v', 'ð', 'z'], // Voiced fricatives
            ['m', 'n', 'ŋ'], // Nasals
            ['tʃ', 'dʒ', 'ʃ'] // Affricates and related
        ];
    }

    init() {
        this.render();
        this.startGame();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container sound-sorting-game">
                <h2>Sound Sorting Game</h2>
                <p>Sort the words into the correct sound categories:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="sound-sorting-score">0</span></div>
                    <div class="round">Round: <span id="sound-sorting-round">0</span>/${this.maxRounds}</div>
                </div>
                
                <div class="sorting-area">
                    <div class="words-to-sort" id="sound-sorting-words"></div>
                    
                    <div class="sound-categories" id="sound-sorting-categories"></div>
                </div>
                
                <div class="game-controls">
                    <button id="sound-sorting-check" class="primary-btn">Check Answer</button>
                    <button id="sound-sorting-next" class="secondary-btn" disabled>Next Round</button>
                </div>
                
                <div id="sound-sorting-feedback" class="feedback"></div>
            </div>
        `;

        // Add event listeners
        document.getElementById('sound-sorting-check').addEventListener('click', () => this.checkAnswer());
        document.getElementById('sound-sorting-next').addEventListener('click', () => this.nextRound());
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
        this.sortedWords = {};
        
        // Get random sounds and words
        this.getRandomSoundsAndWords();
        
        // Render the sorting area
        this.renderSortingArea();
        
        // Enable check button, disable next button
        document.getElementById('sound-sorting-check').disabled = false;
        document.getElementById('sound-sorting-next').disabled = true;
        
        // Clear feedback
        document.getElementById('sound-sorting-feedback').innerHTML = '';
    }

    getRandomSoundsAndWords() {
        // Select a random sound pair
        const randomPairIndex = Math.floor(Math.random() * this.soundPairs.length);
        this.currentSounds = this.soundPairs[randomPairIndex];
        
        // Initialize sorted words object
        this.currentSounds.forEach(sound => {
            this.sortedWords[sound] = [];
        });
        
        // Find words for each sound
        this.wordsToSort = [];
        
        this.currentSounds.forEach(sound => {
            // Find words containing this sound
            const wordsWithSound = this.findWordsWithSound(sound, 5);
            this.wordsToSort.push(...wordsWithSound);
        });
        
        // Shuffle the words
        this.wordsToSort.sort(() => Math.random() - 0.5);
    }

    findWordsWithSound(sound, count) {
        // Filter words with phonetic transcriptions
        const wordsWithPhonetics = wordsData.filter(item => 
            item.value.phonetics?.uk || item.value.phonetics?.us
        );
        
        // Find words containing the sound
        const wordsWithSound = wordsWithPhonetics.filter(item => {
            const phonetic = item.value.phonetics?.uk || item.value.phonetics?.us || '';
            
            // Special handling for combined sounds
            if ((sound === 't' || sound === 'ʃ') && phonetic.includes('tʃ')) {
                // Skip if the sound is only part of the combined sound
                if (!phonetic.replace('tʃ', '').includes(sound)) {
                    return false;
                }
            }
            
            if ((sound === 'd' || sound === 'ʒ') && phonetic.includes('dʒ')) {
                // Skip if the sound is only part of the combined sound
                if (!phonetic.replace('dʒ', '').includes(sound)) {
                    return false;
                }
            }
            
            return phonetic.includes(sound);
        });
        
        // Get a random subset of words
        return wordsWithSound
            .sort(() => Math.random() - 0.5)
            .slice(0, count)
            .map(item => ({
                word: item.value.word,
                phonetic: item.value.phonetics?.uk || item.value.phonetics?.us || '',
                correctSound: sound
            }));
    }

    renderSortingArea() {
        // Render words to sort
        const wordsContainer = document.getElementById('sound-sorting-words');
        wordsContainer.innerHTML = '<h3>Words to Sort</h3>';
        
        this.wordsToSort.forEach(wordObj => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-card';
            wordElement.textContent = wordObj.word;
            wordElement.dataset.word = wordObj.word;
            wordElement.dataset.phonetic = wordObj.phonetic;
            wordElement.dataset.sound = wordObj.correctSound;
            wordElement.draggable = true;
            
            // Add drag events
            wordElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', wordObj.word);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            wordsContainer.appendChild(wordElement);
        });
        
        // Render sound categories
        const categoriesContainer = document.getElementById('sound-sorting-categories');
        categoriesContainer.innerHTML = '';
        
        this.currentSounds.forEach(sound => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'sound-category';
            categoryElement.innerHTML = `<h3>Sound: ${sound}</h3>`;
            categoryElement.dataset.sound = sound;
            
            // Create drop zone
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.dataset.sound = sound;
            
            // Add drop events
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                dropZone.classList.add('drag-over');
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
                
                const word = e.dataTransfer.getData('text/plain');
                this.moveWordToCategory(word, sound);
            });
            
            categoryElement.appendChild(dropZone);
            categoriesContainer.appendChild(categoryElement);
        });
    }

    moveWordToCategory(word, sound) {
        // Find the word object
        const wordObj = this.wordsToSort.find(w => w.word === word);
        if (!wordObj) return;
        
        // Remove from any existing category
        this.currentSounds.forEach(s => {
            this.sortedWords[s] = this.sortedWords[s].filter(w => w.word !== word);
        });
        
        // Add to the new category
        this.sortedWords[sound].push(wordObj);
        
        // Update the UI
        this.updateSortingUI();
    }

    updateSortingUI() {
        // Clear all drop zones
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.innerHTML = '';
        });
        
        // Add sorted words to their categories
        this.currentSounds.forEach(sound => {
            const dropZone = document.querySelector(`.drop-zone[data-sound="${sound}"]`);
            
            this.sortedWords[sound].forEach(wordObj => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word-card sorted';
                wordElement.textContent = wordObj.word;
                wordElement.dataset.word = wordObj.word;
                wordElement.dataset.phonetic = wordObj.phonetic;
                wordElement.dataset.sound = wordObj.correctSound;
                
                // Add click event to remove from category
                wordElement.addEventListener('click', () => {
                    this.sortedWords[sound] = this.sortedWords[sound].filter(w => w.word !== wordObj.word);
                    this.updateSortingUI();
                    
                    // Add back to words to sort
                    const wordsContainer = document.getElementById('sound-sorting-words');
                    const newWordElement = document.createElement('div');
                    newWordElement.className = 'word-card';
                    newWordElement.textContent = wordObj.word;
                    newWordElement.dataset.word = wordObj.word;
                    newWordElement.dataset.phonetic = wordObj.phonetic;
                    newWordElement.dataset.sound = wordObj.correctSound;
                    newWordElement.draggable = true;
                    
                    // Add drag events
                    newWordElement.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', wordObj.word);
                        e.dataTransfer.effectAllowed = 'move';
                    });
                    
                    wordsContainer.appendChild(newWordElement);
                });
                
                dropZone.appendChild(wordElement);
            });
        });
        
        // Remove sorted words from the words to sort
        const sortedWordsList = Object.values(this.sortedWords).flat().map(w => w.word);
        document.querySelectorAll('#sound-sorting-words .word-card').forEach(wordElement => {
            if (sortedWordsList.includes(wordElement.dataset.word)) {
                wordElement.remove();
            }
        });
    }

    checkAnswer() {
        const feedbackContainer = document.getElementById('sound-sorting-feedback');
        
        // Check if all words have been sorted
        const totalSortedWords = Object.values(this.sortedWords).flat().length;
        
        if (totalSortedWords < this.wordsToSort.length) {
            feedbackContainer.innerHTML = '<p class="error">Please sort all words before checking.</p>';
            return;
        }
        
        // Calculate correct and incorrect sorts
        let correctSorts = 0;
        let incorrectSorts = 0;
        
        this.currentSounds.forEach(sound => {
            this.sortedWords[sound].forEach(wordObj => {
                if (wordObj.correctSound === sound) {
                    correctSorts++;
                } else {
                    incorrectSorts++;
                }
            });
        });
        
        // Calculate score
        const scoreForThisRound = Math.max(0, correctSorts - incorrectSorts);
        this.score += scoreForThisRound;
        this.updateScore();
        
        // Generate feedback
        let feedback = '';
        
        if (correctSorts === this.wordsToSort.length) {
            feedback = '<p class="success">Perfect! All words sorted correctly.</p>';
        } else {
            const percentage = Math.round((correctSorts / this.wordsToSort.length) * 100);
            feedback = `<p>You sorted ${correctSorts} out of ${this.wordsToSort.length} words correctly (${percentage}%).</p>`;
        }
        
        // Add phonetic information
        feedback += '<div class="phonetic-info"><h4>Phonetic Information:</h4><ul>';
        
        this.wordsToSort.forEach(wordObj => {
            feedback += `<li>${wordObj.word} [${wordObj.phonetic}] - Contains sound: ${wordObj.correctSound}</li>`;
        });
        
        feedback += '</ul></div>';
        
        feedbackContainer.innerHTML = feedback;
        
        // Highlight correct and incorrect sorts
        this.currentSounds.forEach(sound => {
            const dropZone = document.querySelector(`.drop-zone[data-sound="${sound}"]`);
            
            dropZone.querySelectorAll('.word-card').forEach(wordElement => {
                const wordObj = this.sortedWords[sound].find(w => w.word === wordElement.dataset.word);
                
                if (wordObj.correctSound === sound) {
                    wordElement.classList.add('correct');
                } else {
                    wordElement.classList.add('incorrect');
                }
            });
        });
        
        // Disable check button, enable next button
        document.getElementById('sound-sorting-check').disabled = true;
        document.getElementById('sound-sorting-next').disabled = false;
    }

    endGame() {
        const percentage = Math.round((this.score / (this.maxRounds * this.wordsToSort.length / this.currentSounds.length)) * 100);
        
        this.container.innerHTML = `
            <div class="game-container sound-sorting-game">
                <h2>Game Over!</h2>
                <div class="final-score">
                    <p>Your final score: ${this.score}</p>
                    <p>${percentage}% accuracy</p>
                </div>
                <button id="sound-sorting-restart" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('sound-sorting-restart').addEventListener('click', () => {
            this.init();
        });
    }

    updateScore() {
        document.getElementById('sound-sorting-score').textContent = this.score;
    }

    updateRound() {
        document.getElementById('sound-sorting-round').textContent = this.round;
    }
}
