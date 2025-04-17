// Sound Sorting Game
// Players must sort words into categories based on the phonetic sounds they contain

class SoundSortingGame {
    constructor(container, selectedSounds = []) {
        this.container = container;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 5;
        this.currentSounds = [];
        this.currentWords = [];
        this.sortedWords = {};
        this.availableSounds = selectedSounds.length > 0 ? selectedSounds : [
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
            <div class="game-container sound-sorting-game">
                <h2>Sound Sorting Game</h2>
                <p>Sort the words into categories based on the phonetic sounds they contain:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="sorting-score">0</span></div>
                    <div class="round">Round: <span id="sorting-round">0</span>/${this.maxRounds}</div>
                </div>
                
                <div class="sorting-area" id="sorting-area">
                    <!-- Will be populated dynamically -->
                </div>
                
                <div class="game-controls">
                    <button id="check-sorting-btn" class="check-btn">Check Sorting</button>
                    <button id="next-sorting-btn" class="next-btn" disabled>Next Round</button>
                </div>
                
                <div id="game-feedback" class="game-feedback" style="display: none;"></div>
            </div>
        `;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        const checkBtn = document.getElementById('check-sorting-btn');
        const nextBtn = document.getElementById('next-sorting-btn');
        
        checkBtn.addEventListener('click', () => this.checkSorting());
        nextBtn.addEventListener('click', () => this.nextRound());
    }
    
    startGame() {
        this.score = 0;
        this.round = 0;
        this.updateScore();
        this.nextRound();
    }
    
    async nextRound() {
        if (this.round >= this.maxRounds) {
            this.endGame();
            return;
        }
        
        this.round++;
        this.updateRound();
        
        // Reset UI
        document.getElementById('check-sorting-btn').disabled = false;
        document.getElementById('next-sorting-btn').disabled = true;
        document.getElementById('game-feedback').style.display = 'none';
        this.sortedWords = {};
        
        // Get random sounds and words
        await this.getRandomSoundsAndWords();
        
        // Render sorting area
        this.renderSortingArea();
        
        // Set up drag and drop
        this.setupDragAndDrop();
    }
    
    async getRandomSoundsAndWords() {
        try {
            // Select random sounds from available sounds
            let soundsToUse = this.availableSounds;
            
            // If no sounds are selected or less than 3, use default sounds
            if (!soundsToUse || soundsToUse.length < 3) {
                soundsToUse = ['æ', 'ɪ', 'ʃ', 'ə', 'ɒ', 'p', 'k', 't'];
            }
            
            const shuffledSounds = this.shuffleArray([...soundsToUse]);
            this.currentSounds = shuffledSounds.slice(0, 3);
            
            // Generate mock words for each sound
            this.currentWords = [];
            
            // Mock words with phonetic transcriptions
            const mockWordPool = [
                { word: 'apple', phonetic: 'ˈæpl' },
                { word: 'banana', phonetic: 'bəˈnɑːnə' },
                { word: 'cat', phonetic: 'kæt' },
                { word: 'dog', phonetic: 'dɒɡ' },
                { word: 'elephant', phonetic: 'ˈelɪfənt' },
                { word: 'fish', phonetic: 'fɪʃ' },
                { word: 'grape', phonetic: 'ɡreɪp' },
                { word: 'house', phonetic: 'haʊs' },
                { word: 'igloo', phonetic: 'ˈɪɡluː' },
                { word: 'jacket', phonetic: 'ˈdʒækɪt' },
                { word: 'kite', phonetic: 'kaɪt' },
                { word: 'lemon', phonetic: 'ˈlemən' },
                { word: 'mouse', phonetic: 'maʊs' },
                { word: 'nose', phonetic: 'nəʊz' },
                { word: 'orange', phonetic: 'ˈɒrɪndʒ' },
                { word: 'pencil', phonetic: 'ˈpensl' },
                { word: 'queen', phonetic: 'kwiːn' },
                { word: 'rabbit', phonetic: 'ˈræbɪt' },
                { word: 'snake', phonetic: 'sneɪk' },
                { word: 'table', phonetic: 'ˈteɪbl' },
                { word: 'umbrella', phonetic: 'ʌmˈbrelə' },
                { word: 'violin', phonetic: 'ˌvaɪəˈlɪn' },
                { word: 'window', phonetic: 'ˈwɪndəʊ' },
                { word: 'xylophone', phonetic: 'ˈzaɪləfəʊn' },
                { word: 'yellow', phonetic: 'ˈjeləʊ' },
                { word: 'zebra', phonetic: 'ˈzebrə' }
            ];
            
            // For each sound, find words that contain it
            for (const sound of this.currentSounds) {
                const wordsWithSound = mockWordPool.filter(word => word.phonetic.includes(sound));
                
                // Take up to 3 words for each sound
                const selectedWords = this.shuffleArray([...wordsWithSound]).slice(0, 3);
                
                // Add these words to the current words
                for (const word of selectedWords) {
                    // Add the sound to the word object for reference
                    const wordWithSound = { ...word, containsSound: sound };
                    this.currentWords.push(wordWithSound);
                }
            }
            
            // Shuffle the words
            this.currentWords = this.shuffleArray(this.currentWords);
            
            console.log('Current sounds:', this.currentSounds);
            console.log('Current words:', this.currentWords);
            
        } catch (error) {
            console.error('Error setting up round:', error);
            // Fallback to default values
            this.currentSounds = ['æ', 'ɪ', 'ʃ'];
            this.currentWords = [
                { word: 'apple', phonetic: 'ˈæpl', containsSound: 'æ' },
                { word: 'cat', phonetic: 'kæt', containsSound: 'æ' },
                { word: 'fish', phonetic: 'fɪʃ', containsSound: 'ɪ' },
                { word: 'ship', phonetic: 'ʃɪp', containsSound: 'ʃ' },
                { word: 'wish', phonetic: 'wɪʃ', containsSound: 'ʃ' },
                { word: 'sit', phonetic: 'sɪt', containsSound: 'ɪ' }
            ];
        }
    }
    
    renderSortingArea() {
        const sortingArea = document.getElementById('sorting-area');
        sortingArea.innerHTML = '';
        
        // Create word pool
        const wordPool = document.createElement('div');
        wordPool.className = 'word-pool';
        wordPool.innerHTML = '<h3 class="category-title">Word Pool</h3>';
        
        // Add words to the pool
        this.currentWords.forEach(wordObj => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'sortable-word';
            wordDiv.dataset.word = wordObj.word;
            wordDiv.dataset.sound = wordObj.containsSound;
            wordDiv.draggable = true;
            wordDiv.innerHTML = `
                <div class="word-text">${wordObj.word}</div>
                <div class="word-phonetic" style="display: none;">${wordObj.phonetic}</div>
            `;
            
            wordPool.appendChild(wordDiv);
        });
        
        sortingArea.appendChild(wordPool);
        
        // Create sound categories
        this.currentSounds.forEach(sound => {
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'sound-category-container';
            categoryContainer.dataset.sound = sound;
            categoryContainer.innerHTML = `<h3 class="category-title">Sound: ${sound}</h3>`;
            
            // Initialize sorted words for this sound
            this.sortedWords[sound] = [];
            
            sortingArea.appendChild(categoryContainer);
        });
    }
    
    setupDragAndDrop() {
        const sortableWords = document.querySelectorAll('.sortable-word');
        const dropTargets = document.querySelectorAll('.sound-category-container, .word-pool');
        
        sortableWords.forEach(word => {
            word.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', word.dataset.word);
                setTimeout(() => {
                    word.classList.add('dragging');
                }, 0);
            });
            
            word.addEventListener('dragend', () => {
                word.classList.remove('dragging');
            });
        });
        
        dropTargets.forEach(target => {
            target.addEventListener('dragover', (e) => {
                e.preventDefault();
                target.classList.add('drag-over');
            });
            
            target.addEventListener('dragleave', () => {
                target.classList.remove('drag-over');
            });
            
            target.addEventListener('drop', (e) => {
                e.preventDefault();
                target.classList.remove('drag-over');
                
                const wordId = e.dataTransfer.getData('text/plain');
                const wordElement = document.querySelector(`.sortable-word[data-word="${wordId}"]`);
                
                if (wordElement) {
                    // Remove from previous container
                    wordElement.parentNode.removeChild(wordElement);
                    
                    // Add to new container
                    target.appendChild(wordElement);
                    
                    // Update sorted words
                    this.updateSortedWords();
                }
            });
        });
    }
    
    updateSortedWords() {
        // Reset sorted words
        this.currentSounds.forEach(sound => {
            this.sortedWords[sound] = [];
        });
        
        // Get current sorting
        this.currentSounds.forEach(sound => {
            const container = document.querySelector(`.sound-category-container[data-sound="${sound}"]`);
            const words = container.querySelectorAll('.sortable-word');
            
            words.forEach(word => {
                this.sortedWords[sound].push({
                    word: word.dataset.word,
                    correctSound: word.dataset.sound
                });
            });
        });
    }
    
    checkSorting() {
        let correct = true;
        let feedback = '';
        
        // Show phonetic transcriptions
        const wordElements = document.querySelectorAll('.sortable-word');
        wordElements.forEach(wordElement => {
            const phoneticElement = wordElement.querySelector('.word-phonetic');
            if (phoneticElement) {
                phoneticElement.style.display = 'block';
            }
        });
        
        // Check if words are sorted correctly
        this.currentSounds.forEach(sound => {
            const wordsInCategory = this.sortedWords[sound];
            
            wordsInCategory.forEach(wordObj => {
                if (wordObj.correctSound !== sound) {
                    correct = false;
                }
            });
        });
        
        // Update UI to show correct/incorrect sorting
        this.currentSounds.forEach(sound => {
            const container = document.querySelector(`.sound-category-container[data-sound="${sound}"]`);
            const words = container.querySelectorAll('.sortable-word');
            
            words.forEach(word => {
                if (word.dataset.sound === sound) {
                    word.classList.add('correct');
                } else {
                    word.classList.add('incorrect');
                }
            });
        });
        
        // Update score and feedback
        if (correct) {
            this.score++;
            this.updateScore();
            feedback = '<div class="feedback-correct">Correct! All words sorted correctly.</div>';
        } else {
            feedback = '<div class="feedback-incorrect">Not quite right. The correct categories are highlighted.</div>';
        }
        
        // Show feedback
        const feedbackElement = document.getElementById('game-feedback');
        feedbackElement.innerHTML = feedback;
        feedbackElement.style.display = 'block';
        
        // Disable check button and enable next button
        document.getElementById('check-sorting-btn').disabled = true;
        document.getElementById('next-sorting-btn').disabled = false;
    }
    
    updateScore() {
        document.getElementById('sorting-score').textContent = this.score;
    }
    
    updateRound() {
        document.getElementById('sorting-round').textContent = this.round;
    }
    
    endGame() {
        this.container.innerHTML = `
            <div class="game-over">
                <h2>Game Over!</h2>
                <p>Your final score: ${this.score} out of ${this.maxRounds}</p>
                <button id="play-again-btn" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.init();
        });
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
