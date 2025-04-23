/**
 * Transcript Comparison Feature
 * Compares user notes with video transcript and highlights differences
 */

class TranscriptComparison {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.initSounds();
    }

    initElements() {
        // Create comparison button
        this.compareButton = document.getElementById('compare-transcript') || this.createCompareButton();
        this.notesTextarea = document.getElementById('video-notes');
        this.transcriptContainer = document.getElementById('full-transcript');
        this.resultContainer = document.getElementById('comparison-results') || this.createResultContainer();
    }
    
    initSounds() {
        // Create audio elements for sound effects
        this.sounds = {
            success: new Audio(),
            average: new Audio(),
            poor: new Audio()
        };
        
        // Set sound sources
        this.sounds.success.src = 'https://assets.mixkit.co/active_storage/sfx/2019/success-1-6297.wav';
        this.sounds.average.src = 'https://assets.mixkit.co/active_storage/sfx/2005/2005-mixkit-game-notification-wave-2351.wav';
        this.sounds.poor.src = 'https://assets.mixkit.co/active_storage/sfx/2020/wrong-answer-129.wav';
        
        // Preload sounds
        Object.values(this.sounds).forEach(sound => {
            sound.load();
            sound.volume = 0.5; // Set volume to 50%
        });
    }
    
    playSoundEffect(accuracy) {
        // Play different sounds based on accuracy level
        if (accuracy >= 80) {
            this.sounds.success.play();
        } else if (accuracy >= 50) {
            this.sounds.average.play();
        } else {
            this.sounds.poor.play();
        }
    }

    createCompareButton() {
        const button = document.createElement('button');
        button.id = 'compare-transcript';
        button.className = 'note-button';
        button.innerHTML = '<i class="fas fa-check-double"></i> Compare with Transcript';
        
        const noteControls = document.querySelector('.note-controls');
        noteControls.appendChild(button);
        
        return button;
    }

    createResultContainer() {
        const container = document.createElement('div');
        container.id = 'comparison-results';
        container.className = 'comparison-results hidden';
        
        const header = document.createElement('div');
        header.className = 'comparison-header';
        header.innerHTML = `
            <h3>Comparison Results</h3>
            <button id="close-comparison" class="close-button">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const content = document.createElement('div');
        content.className = 'comparison-content';
        
        container.appendChild(header);
        container.appendChild(content);
        
        document.querySelector('.note-taking-section').appendChild(container);
        
        // Add close button event
        container.querySelector('#close-comparison').addEventListener('click', () => {
            container.classList.add('hidden');
        });
        
        return container;
    }

    bindEvents() {
        this.compareButton.addEventListener('click', () => this.compareWithTranscript());
    }

    compareWithTranscript() {
        const userNotes = this.notesTextarea.value.trim().toLowerCase();
        
        // Get transcript text from the transcript container
        let transcriptText = '';
        
        // Try to get transcript from different elements since the structure might vary
        // First try transcript-line elements (which seem to be used in your app)
        const transcriptLines = this.transcriptContainer.querySelectorAll('.transcript-line');
        if (transcriptLines.length > 0) {
            transcriptLines.forEach(line => {
                const textSpan = line.querySelector('.transcript-text');
                if (textSpan) {
                    transcriptText += textSpan.textContent + ' ';
                } else {
                    transcriptText += line.textContent + ' ';
                }
            });
        } else {
            // Fallback to any paragraph or div elements
            const textElements = this.transcriptContainer.querySelectorAll('p, div:not(.no-transcript):not(.loading-transcript)');
            textElements.forEach(el => {
                // Skip elements that are likely containers rather than text
                if (!el.classList.contains('transcript-separator') && 
                    !el.classList.contains('subtitle-header') &&
                    !el.classList.contains('full-transcript')) {
                    transcriptText += el.textContent + ' ';
                }
            });
        }
        
        transcriptText = transcriptText.trim().toLowerCase();
        
        if (!userNotes) {
            this.showError('Please enter your notes first.');
            return;
        }
        
        if (!transcriptText) {
            // Check if there's a "no-transcript" message
            const noTranscriptEl = this.transcriptContainer.querySelector('.no-transcript');
            if (noTranscriptEl) {
                this.showError('Transcript is not available for this video.');
            } else {
                // Try to get transcript directly from the video data
                this.getTranscriptFromVideoData()
                    .then(transcript => {
                        if (transcript) {
                            this.performComparisonWithTranscript(userNotes, transcript);
                        } else {
                            this.showError('Transcript is not available.');
                        }
                    })
                    .catch(error => {
                        console.error("Error getting transcript:", error);
                        this.showError('Transcript is not available.');
                    });
            }
            return;
        }
        
        this.performComparisonWithTranscript(userNotes, transcriptText);
    }
    
    getTranscriptFromVideoData() {
        return new Promise((resolve, reject) => {
            try {
                // Get video ID from URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const videoId = urlParams.get('id');
                
                if (!videoId) {
                    resolve(null);
                    return;
                }
                
                // Check if listeningVideos is available
                if (typeof listeningVideos === 'undefined') {
                    console.error("listeningVideos is not defined");
                    resolve(null);
                    return;
                }
                
                // Search through all series for the video
                for (const seriesGroup of listeningVideos) {
                    const foundVideo = seriesGroup.videos.find(video => video.id === videoId);
                    if (foundVideo && foundVideo.subtitle) {
                        console.log("Found subtitle for video:", videoId);
                        resolve(foundVideo.subtitle.toLowerCase());
                        return;
                    }
                }
                
                console.error("No subtitle found for video:", videoId);
                resolve(null);
            } catch (error) {
                console.error("Error in getTranscriptFromVideoData:", error);
                reject(error);
            }
        });
    }
    
    performComparisonWithTranscript(userNotes, transcriptText) {
        // Perform the comparison
        const comparisonResult = this.performComparison(userNotes, transcriptText);
        
        // Display the results
        this.displayComparisonResults(comparisonResult);
    }

    performComparison(userNotes, transcriptText) {
        // Split into words for comparison
        const userWords = this.tokenizeText(userNotes);
        const transcriptWords = this.tokenizeText(transcriptText);
        
        // Use Levenshtein distance to find similar words
        const result = {
            correctWords: [],
            incorrectWords: [],
            missingWords: [],
            extraWords: []
        };
        
        // Simple word-by-word comparison (can be enhanced with more sophisticated algorithms)
        const userWordSet = new Set(userWords);
        const transcriptWordSet = new Set(transcriptWords);
        
        // Find words in user notes that match or are close to transcript words
        userWords.forEach(word => {
            if (word.length < 2) return; // Skip very short words
            
            if (transcriptWordSet.has(word)) {
                result.correctWords.push(word);
            } else {
                // Check for similar words using Levenshtein distance
                let foundSimilar = false;
                for (const transcriptWord of transcriptWords) {
                    if (this.levenshteinDistance(word, transcriptWord) <= 2 && 
                        Math.abs(word.length - transcriptWord.length) <= 2) {
                        result.incorrectWords.push({
                            userWord: word,
                            correctWord: transcriptWord
                        });
                        foundSimilar = true;
                        break;
                    }
                }
                
                if (!foundSimilar) {
                    result.extraWords.push(word);
                }
            }
        });
        
        // Find words in transcript that are missing from user notes
        transcriptWords.forEach(word => {
            if (word.length < 2) return; // Skip very short words
            
            if (!userWordSet.has(word) && 
                !result.incorrectWords.some(pair => pair.correctWord === word)) {
                result.missingWords.push(word);
            }
        });
        
        return result;
    }

    tokenizeText(text) {
        // Remove punctuation and split into words
        return text
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    levenshteinDistance(a, b) {
        // Calculate edit distance between two strings
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        // Initialize matrix
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        // Fill matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }

    displayComparisonResults(result) {
        const contentContainer = this.resultContainer.querySelector('.comparison-content');
        contentContainer.innerHTML = '';
        
        // Create summary
        const summary = document.createElement('div');
        summary.className = 'comparison-summary';
        
        const accuracy = Math.round(
            (result.correctWords.length / 
            (result.correctWords.length + result.incorrectWords.length + result.missingWords.length)) * 100
        ) || 0;
        
        // Add sound effect based on accuracy
        this.playSoundEffect(accuracy);
        
        summary.innerHTML = `
            <div class="accuracy-meter">
                <div class="accuracy-label">Listening Accuracy</div>
                <div class="accuracy-bar">
                    <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                </div>
                <div class="accuracy-percentage">${accuracy}%</div>
            </div>
            <div class="stats-container">
                <div class="stat correct">
                    <span class="stat-value">${result.correctWords.length}</span>
                    <span class="stat-label">Correct Words</span>
                </div>
                <div class="stat incorrect">
                    <span class="stat-value">${result.incorrectWords.length}</span>
                    <span class="stat-label">Incorrect Words</span>
                </div>
                <div class="stat missing">
                    <span class="stat-value">${result.missingWords.length}</span>
                    <span class="stat-label">Missing Words</span>
                </div>
            </div>
        `;
        
        contentContainer.appendChild(summary);
        
        // Create detailed results
        if (result.incorrectWords.length > 0) {
            const incorrectSection = document.createElement('div');
            incorrectSection.className = 'result-section incorrect-words';
            incorrectSection.innerHTML = '<h4>Incorrect Words</h4>';
            
            const incorrectList = document.createElement('ul');
            result.incorrectWords.forEach(pair => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <span class="user-word">${pair.userWord}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="correct-word">${pair.correctWord}</span>
                    <button class="play-word" data-word="${pair.correctWord}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                `;
                incorrectList.appendChild(item);
            });
            
            incorrectSection.appendChild(incorrectList);
            contentContainer.appendChild(incorrectSection);
        }
        
        if (result.missingWords.length > 0) {
            const missingSection = document.createElement('div');
            missingSection.className = 'result-section missing-words';
            missingSection.innerHTML = '<h4>Missing Words</h4>';
            
            const missingList = document.createElement('ul');
            // Show only the first 20 missing words to avoid overwhelming the user
            const displayMissing = result.missingWords.slice(0, 20);
            
            displayMissing.forEach(word => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <span class="missing-word">${word}</span>
                    <button class="play-word" data-word="${word}">
                        <i class="fas fa-volume-up"></i>
                    </button>
                `;
                missingList.appendChild(item);
            });
            
            if (result.missingWords.length > 20) {
                const moreItem = document.createElement('li');
                moreItem.className = 'more-items';
                moreItem.textContent = `...and ${result.missingWords.length - 20} more`;
                missingList.appendChild(moreItem);
            }
            
            missingSection.appendChild(missingList);
            contentContainer.appendChild(missingSection);
        }
        
        // Add event listeners for word pronunciation
        contentContainer.querySelectorAll('.play-word').forEach(button => {
            button.addEventListener('click', () => {
                const word = button.getAttribute('data-word');
                this.speakWord(word);
            });
        });
        
        // Show the results container
        this.resultContainer.classList.remove('hidden');
        
        // Highlight words in the notes textarea
        this.highlightNotesTextarea(result);
    }

    highlightNotesTextarea(result) {
        // Create a highlighted version of the notes
        const userNotes = this.notesTextarea.value;
        
        // Create a temporary div to hold the highlighted text
        const tempDiv = document.createElement('div');
        tempDiv.className = 'highlighted-notes';
        
        // Replace the textarea with the div temporarily
        const notesParent = this.notesTextarea.parentNode;
        const notesPosition = Array.from(notesParent.children).indexOf(this.notesTextarea);
        
        this.notesTextarea.classList.add('hidden');
        notesParent.insertBefore(tempDiv, notesParent.children[notesPosition + 1]);
        
        // Process the text to highlight words
        let highlightedText = userNotes;
        
        // Create a map of incorrect words for faster lookup
        const incorrectMap = {};
        result.incorrectWords.forEach(pair => {
            incorrectMap[pair.userWord.toLowerCase()] = pair.correctWord;
        });
        
        // Replace words with highlighted versions
        const words = this.tokenizeText(userNotes);
        words.forEach(word => {
            if (word.length < 2) return;
            
            const lowerWord = word.toLowerCase();
            
            if (incorrectMap[lowerWord]) {
                // Incorrect word
                const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, 
                    `<span class="incorrect-highlight" title="Correct: ${incorrectMap[lowerWord]}">${word}</span>`);
            } else if (result.extraWords.includes(lowerWord)) {
                // Extra word (not in transcript)
                const regex = new RegExp(`\\b${this.escapeRegExp(word)}\\b`, 'gi');
                highlightedText = highlightedText.replace(regex, 
                    `<span class="extra-highlight" title="This word is not in the transcript">${word}</span>`);
            }
        });
        
        // Add line breaks
        highlightedText = highlightedText.replace(/\n/g, '<br>');
        
        // Set the highlighted text
        tempDiv.innerHTML = highlightedText;
        
        // Add a button to return to editing
        const returnButton = document.createElement('button');
        returnButton.className = 'return-to-edit';
        returnButton.innerHTML = '<i class="fas fa-edit"></i> Return to Editing';
        returnButton.addEventListener('click', () => {
            tempDiv.remove();
            this.notesTextarea.classList.remove('hidden');
        });
        
        tempDiv.appendChild(returnButton);
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    speakWord(word) {
        // Use browser's speech synthesis to pronounce the word
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    }

    showError(message) {
        // Display error message
        alert(message);
    }
}

// Initialize the transcript comparison feature
document.addEventListener('DOMContentLoaded', () => {
    window.transcriptComparison = new TranscriptComparison();
});
