// Minimal Pairs Challenge
// Players must identify which word they heard from a pair of similar-sounding words

class MinimalPairsChallenge {
    constructor(container) {
        this.container = container;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.currentPair = null;
        this.correctWord = null;
        this.selectedWord = null;
        
        // Predefined minimal pairs (could be expanded)
        this.minimalPairs = [
            { word1: 'ship', word2: 'sheep', sound1: 'ɪ', sound2: 'iː' },
            { word1: 'bit', word2: 'beat', sound1: 'ɪ', sound2: 'iː' },
            { word1: 'sit', word2: 'seat', sound1: 'ɪ', sound2: 'iː' },
            { word1: 'fill', word2: 'feel', sound1: 'ɪ', sound2: 'iː' },
            { word1: 'live', word2: 'leave', sound1: 'ɪ', sound2: 'iː' },
            { word1: 'pull', word2: 'pool', sound1: 'ʊ', sound2: 'uː' },
            { word1: 'full', word2: 'fool', sound1: 'ʊ', sound2: 'uː' },
            { word1: 'look', word2: 'Luke', sound1: 'ʊ', sound2: 'uː' },
            { word1: 'could', word2: 'cooed', sound1: 'ʊ', sound2: 'uː' },
            { word1: 'cat', word2: 'cut', sound1: 'æ', sound2: 'ʌ' },
            { word1: 'bad', word2: 'bud', sound1: 'æ', sound2: 'ʌ' },
            { word1: 'hat', word2: 'hut', sound1: 'æ', sound2: 'ʌ' },
            { word1: 'bat', word2: 'but', sound1: 'æ', sound2: 'ʌ' },
            { word1: 'cap', word2: 'cup', sound1: 'æ', sound2: 'ʌ' },
            { word1: 'bed', word2: 'bad', sound1: 'e', sound2: 'æ' },
            { word1: 'men', word2: 'man', sound1: 'e', sound2: 'æ' },
            { word1: 'said', word2: 'sad', sound1: 'e', sound2: 'æ' },
            { word1: 'pen', word2: 'pan', sound1: 'e', sound2: 'æ' },
            { word1: 'wet', word2: 'wait', sound1: 'e', sound2: 'eɪ' },
            { word1: 'pen', word2: 'pain', sound1: 'e', sound2: 'eɪ' },
            { word1: 'sell', word2: 'sale', sound1: 'e', sound2: 'eɪ' },
            { word1: 'met', word2: 'mate', sound1: 'e', sound2: 'eɪ' },
            { word1: 'ship', word2: 'chip', sound1: 'ʃ', sound2: 'tʃ' },
            { word1: 'share', word2: 'chair', sound1: 'ʃ', sound2: 'tʃ' },
            { word1: 'wash', word2: 'watch', sound1: 'ʃ', sound2: 'tʃ' },
            { word1: 'shoe', word2: 'chew', sound1: 'ʃ', sound2: 'tʃ' },
            { word1: 'vision', word2: 'pigeon', sound1: 'ʒ', sound2: 'dʒ' },
            { word1: 'measure', word2: 'major', sound1: 'ʒ', sound2: 'dʒ' },
            { word1: 'beige', word2: 'badge', sound1: 'ʒ', sound2: 'dʒ' },
            { word1: 'leisure', word2: 'ledger', sound1: 'ʒ', sound2: 'dʒ' }
        ];
        
        // Dynamically find minimal pairs from the dictionary
        this.findMinimalPairsFromDictionary();
    }

    init() {
        this.render();
        this.startGame();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-container minimal-pairs-challenge">
                <h2>Minimal Pairs Challenge</h2>
                <p>Listen to the audio and select the word you hear:</p>
                
                <div class="game-status">
                    <div class="score">Score: <span id="minimal-pairs-score">0</span></div>
                    <div class="round">Round: <span id="minimal-pairs-round">0</span>/${this.maxRounds}</div>
                </div>
                
                <div class="audio-player">
                    <button id="minimal-pairs-play" class="primary-btn">Play Sound 🔊</button>
                </div>
                
                <div class="word-options" id="minimal-pairs-options"></div>
                
                <div class="game-controls">
                    <button id="minimal-pairs-check" class="primary-btn" disabled>Check Answer</button>
                    <button id="minimal-pairs-next" class="secondary-btn" disabled>Next Pair</button>
                </div>
                
                <div id="minimal-pairs-feedback" class="feedback"></div>
            </div>
        `;

        // Add event listeners
        document.getElementById('minimal-pairs-play').addEventListener('click', () => this.playCurrentWord());
        document.getElementById('minimal-pairs-check').addEventListener('click', () => this.checkAnswer());
        document.getElementById('minimal-pairs-next').addEventListener('click', () => this.nextRound());
    }

    findMinimalPairsFromDictionary() {
        // This is a simplified approach - in a real implementation, you would need
        // more sophisticated phonetic analysis to find true minimal pairs
        const wordsWithPhonetics = wordsData.filter(item => 
            item.value.phonetics?.uk || item.value.phonetics?.us
        );
        
        // Group words by length to find potential minimal pairs
        const wordsByLength = {};
        wordsWithPhonetics.forEach(item => {
            const word = item.value.word;
            const length = word.length;
            
            if (!wordsByLength[length]) {
                wordsByLength[length] = [];
            }
            
            wordsByLength[length].push(item.value);
        });
        
        // Find potential minimal pairs (words that differ by only one letter)
        for (const length in wordsByLength) {
            const words = wordsByLength[length];
            
            for (let i = 0; i < words.length; i++) {
                for (let j = i + 1; j < words.length; j++) {
                    const word1 = words[i].word;
                    const word2 = words[j].word;
                    
                    // Count differing characters
                    let diffCount = 0;
                    let diffPos = -1;
                    
                    for (let k = 0; k < word1.length; k++) {
                        if (word1[k] !== word2[k]) {
                            diffCount++;
                            diffPos = k;
                        }
                    }
                    
                    // If they differ by exactly one character and both have audio
                    if (diffCount === 1 && words[i].uk?.mp3 && words[j].uk?.mp3) {
                        const phonetic1 = words[i].phonetics?.uk || words[i].phonetics?.us || '';
                        const phonetic2 = words[j].phonetics?.uk || words[j].phonetics?.us || '';
                        
                        // Only add if they have different phonetics
                        if (phonetic1 !== phonetic2) {
                            this.minimalPairs.push({
                                word1: words[i],
                                word2: words[j],
                                isFromDictionary: true
                            });
                        }
                    }
                }
            }
        }
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
        this.selectedWord = null;
        
        // Get a random minimal pair
        this.getRandomPair();
        
        // Enable play button, disable check and next buttons
        document.getElementById('minimal-pairs-play').disabled = false;
        document.getElementById('minimal-pairs-check').disabled = true;
        document.getElementById('minimal-pairs-next').disabled = true;
        
        // Clear feedback
        document.getElementById('minimal-pairs-feedback').innerHTML = '';
    }

    getRandomPair() {
        // Select a random pair
        const randomIndex = Math.floor(Math.random() * this.minimalPairs.length);
        this.currentPair = this.minimalPairs[randomIndex];
        
        // Randomly select which word to play
        const playFirst = Math.random() < 0.5;
        this.correctWord = playFirst ? this.currentPair.word1 : this.currentPair.word2;
        
        // Display the word options
        this.displayWordOptions();
    }

    displayWordOptions() {
        const optionsContainer = document.getElementById('minimal-pairs-options');
        optionsContainer.innerHTML = '';
        
        // Create buttons for each word in the pair
        const words = [this.currentPair.word1, this.currentPair.word2];
        
        // Shuffle the words
        words.sort(() => Math.random() - 0.5);
        
        words.forEach(word => {
            const button = document.createElement('button');
            button.className = 'word-option';
            
            // Handle both string and object formats
            const wordText = typeof word === 'string' ? word : word.word;
            button.textContent = wordText;
            button.dataset.word = wordText;
            
            button.addEventListener('click', () => {
                // Remove selected class from all buttons
                document.querySelectorAll('.word-option').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Add selected class to this button
                button.classList.add('selected');
                
                // Store the selected word
                this.selectedWord = word;
                
                // Enable the check button
                document.getElementById('minimal-pairs-check').disabled = false;
            });
            
            optionsContainer.appendChild(button);
        });
    }

    playCurrentWord() {
        // Play the audio for the correct word
        if (this.correctWord) {
            let audioUrl;
            
            if (typeof this.correctWord === 'string') {
                // For predefined pairs, we need to find the word in the dictionary
                const wordData = wordsData.find(item => 
                    item.value.word.toLowerCase() === this.correctWord.toLowerCase()
                );
                
                if (wordData && wordData.value.uk?.mp3) {
                    audioUrl = wordData.value.uk.mp3;
                }
            } else {
                // For pairs from the dictionary
                audioUrl = this.correctWord.uk?.mp3 || this.correctWord.us?.mp3;
            }
            
            if (audioUrl) {
                playAudio(audioUrl);
            } else {
                document.getElementById('minimal-pairs-feedback').innerHTML = 
                    '<p class="error">Audio not available for this word.</p>';
            }
        }
    }

    checkAnswer() {
        const feedbackContainer = document.getElementById('minimal-pairs-feedback');
        
        if (!this.selectedWord) {
            feedbackContainer.innerHTML = '<p class="error">Please select a word first.</p>';
            return;
        }
        
        // Get the text of the selected and correct words
        const selectedText = typeof this.selectedWord === 'string' ? 
            this.selectedWord : this.selectedWord.word;
            
        const correctText = typeof this.correctWord === 'string' ? 
            this.correctWord : this.correctWord.word;
        
        // Check if the answer is correct
        const isCorrect = selectedText.toLowerCase() === correctText.toLowerCase();
        
        // Update score
        if (isCorrect) {
            this.score++;
            this.updateScore();
        }
        
        // Generate feedback
        let feedback = '';
        
        if (isCorrect) {
            feedback = '<p class="success">Correct! Well done!</p>';
        } else {
            feedback = `<p class="error">Incorrect. The correct word was "${correctText}".</p>`;
        }
        
        // Add phonetic information
        if (typeof this.correctWord === 'string') {
            // For predefined pairs
            const sound1 = this.currentPair.sound1;
            const sound2 = this.currentPair.sound2;
            feedback += `<p>These words differ in the sounds: ${sound1} vs ${sound2}</p>`;
        } else {
            // For pairs from the dictionary
            const phonetic1 = this.currentPair.word1.phonetics?.uk || this.currentPair.word1.phonetics?.us || '';
            const phonetic2 = this.currentPair.word2.phonetics?.uk || this.currentPair.word2.phonetics?.us || '';
            feedback += `<p>Phonetic transcriptions:<br>
                "${this.currentPair.word1.word}": ${phonetic1}<br>
                "${this.currentPair.word2.word}": ${phonetic2}</p>`;
        }
        
        feedbackContainer.innerHTML = feedback;
        
        // Highlight correct and incorrect selections
        document.querySelectorAll('.word-option').forEach(button => {
            const wordText = button.dataset.word;
            button.classList.remove('correct', 'incorrect');
            
            if (wordText.toLowerCase() === correctText.toLowerCase()) {
                button.classList.add('correct');
            } else if (wordText.toLowerCase() === selectedText.toLowerCase() && !isCorrect) {
                button.classList.add('incorrect');
            }
        });
        
        // Disable check button, enable next button
        document.getElementById('minimal-pairs-check').disabled = true;
        document.getElementById('minimal-pairs-next').disabled = false;
        document.getElementById('minimal-pairs-play').disabled = true;
    }

    endGame() {
        const percentage = Math.round((this.score / this.maxRounds) * 100);
        
        this.container.innerHTML = `
            <div class="game-container minimal-pairs-challenge">
                <h2>Game Over!</h2>
                <div class="final-score">
                    <p>Your final score: ${this.score} out of ${this.maxRounds}</p>
                    <p>${percentage}% accuracy</p>
                </div>
                <button id="minimal-pairs-restart" class="primary-btn">Play Again</button>
            </div>
        `;
        
        document.getElementById('minimal-pairs-restart').addEventListener('click', () => {
            this.init();
        });
    }

    updateScore() {
        document.getElementById('minimal-pairs-score').textContent = this.score;
    }

    updateRound() {
        document.getElementById('minimal-pairs-round').textContent = this.round;
    }
}
