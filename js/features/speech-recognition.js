// Speech Recognition functionality

// Initialize variables
let recognition = null;
let isRecording = false;
let recordingTimeout = null;
let wordDisplayTimeout = null;
let permissionGranted = false;
let mediaRecorder = null;
let audioChunks = [];
let audioBlob = null;
let audioUrl = null;
let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
let isMinimized = false;

// Create UI elements
function createSpeechRecognitionUI() {
    console.log("Creating speech recognition UI");
    
    // Create container for speech recognition
    const speechContainer = document.createElement('div');
    speechContainer.id = 'speech-recognition-container';
    speechContainer.className = 'speech-recognition-container';
    
    // Create header with title and controls
    const header = document.createElement('div');
    header.className = 'speech-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Speech Practice';
    title.className = 'speech-title';
    
    // Create minimize/expand button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-speech-button';
    toggleButton.className = 'toggle-speech-button';
    toggleButton.innerHTML = '−'; // Minus sign for minimize
    toggleButton.title = 'Minimize';
    toggleButton.onclick = toggleSpeechContainer;
    
    header.appendChild(title);
    header.appendChild(toggleButton);
    
    // Create content container (for minimize/expand functionality)
    const contentContainer = document.createElement('div');
    contentContainer.id = 'speech-content';
    contentContainer.className = 'speech-content';
    
    // Create status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'speech-status';
    statusIndicator.className = 'speech-status';
    statusIndicator.textContent = 'Ready to record';
    
    // Create recognized word display (only for Chrome)
    if (isChrome) {
        const recognizedWordDisplay = document.createElement('div');
        recognizedWordDisplay.id = 'recognized-word';
        recognizedWordDisplay.className = 'recognized-word';
        contentContainer.appendChild(recognizedWordDisplay);
    }
    
    // Create record button
    const recordButton = document.createElement('button');
    recordButton.id = 'record-button';
    recordButton.className = 'record-button';
    recordButton.innerHTML = '<span class="record-icon"></span>Record';
    
    // Add record button functionality
    let isButtonRecording = false;
    recordButton.addEventListener('click', function() {
        if (!permissionGranted) {
            requestMicrophonePermission();
            return;
        }
        
        if (!isButtonRecording) {
            // Start recording
            isButtonRecording = true;
            this.innerHTML = '<span class="stop-icon"></span>Stop';
            this.classList.add('recording');
            startRecording();
        } else {
            // Stop recording
            isButtonRecording = false;
            this.innerHTML = '<span class="record-icon"></span>Record';
            this.classList.remove('recording');
            stopRecording();
        }
    });
    
    // Create audio controls
    const audioControls = document.createElement('div');
    audioControls.id = 'speech-audio-controls';
    audioControls.className = 'speech-audio-controls';
    
    // Create audio element
    const audioElement = document.createElement('audio');
    audioElement.id = 'speech-audio';
    audioElement.controls = false;
    audioElement.style.display = 'none';
    audioElement.className = 'speech-audio';
    
    // Create replay button
    const replayButton = document.createElement('button');
    replayButton.id = 'replay-button';
    replayButton.className = 'replay-button';
    replayButton.innerHTML = '<span class="replay-icon"></span>Replay';
    replayButton.style.display = 'none';
    replayButton.onclick = replayRecording;
    
    // Add audio elements to controls
    audioControls.appendChild(audioElement);
    audioControls.appendChild(replayButton);
    
    // Create keyboard shortcut info
    const keyboardInfo = document.createElement('div');
    keyboardInfo.className = 'keyboard-info';
    keyboardInfo.innerHTML = '<span class="keyboard-icon">⌨️</span> Press <strong>SPACE</strong> to record';
    
    // Add permission button
    const permissionButton = document.createElement('button');
    permissionButton.id = 'permission-button';
    permissionButton.className = 'permission-button';
    permissionButton.textContent = 'Grant Microphone Access';
    permissionButton.onclick = requestMicrophonePermission;
    
    // Add browser-specific message
    if (!isChrome) {
        const browserNote = document.createElement('div');
        browserNote.className = 'browser-note';
        browserNote.textContent = 'Note: Speech recognition is only available in Chrome. In this browser, you can record and play back your speech.';
        contentContainer.appendChild(browserNote);
    }
    
    // Add elements to content container
    contentContainer.appendChild(statusIndicator);
    contentContainer.appendChild(recordButton);
    contentContainer.appendChild(audioControls);
    contentContainer.appendChild(keyboardInfo);
    contentContainer.appendChild(permissionButton);
    
    // Add header and content to main container
    speechContainer.appendChild(header);
    speechContainer.appendChild(contentContainer);
    
    // Add container to the page
    document.body.appendChild(speechContainer);
    
    // Check if we should start minimized on mobile
    if (window.innerWidth < 768) {
        // Start minimized on mobile
        setTimeout(() => {
            toggleSpeechContainer();
        }, 1000);
    }
    
    console.log("Speech recognition UI created");
}

// Toggle speech container between minimized and expanded states
function toggleSpeechContainer() {
    const container = document.getElementById('speech-recognition-container');
    const content = document.getElementById('speech-content');
    const toggleButton = document.getElementById('toggle-speech-button');
    
    if (!container || !content || !toggleButton) return;
    
    if (isMinimized) {
        // Expand
        content.style.display = 'block';
        toggleButton.innerHTML = '−'; // Minus sign
        toggleButton.title = 'Minimize';
        container.classList.remove('minimized');
        isMinimized = false;
    } else {
        // Minimize
        content.style.display = 'none';
        toggleButton.innerHTML = '+'; // Plus sign
        toggleButton.title = 'Expand';
        container.classList.add('minimized');
        isMinimized = true;
    }
}

// Request microphone permission explicitly
function requestMicrophonePermission() {
    console.log("Requesting microphone permission");
    
    // Hide the button while requesting
    const permissionButton = document.getElementById('permission-button');
    if (permissionButton) {
        permissionButton.textContent = 'Requesting access...';
        permissionButton.disabled = true;
    }
    
    // Update status
    updateStatus('Requesting microphone access...');
    
    // Request permission via getUserMedia
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            console.log("Microphone permission granted");
            permissionGranted = true;
            
            // Store the stream for later use
            window.audioStream = stream;
            
            // Update UI
            updateStatus('Ready to record');
            
            // Hide the permission button
            if (permissionButton) {
                permissionButton.style.display = 'none';
            }
        })
        .catch(err => {
            console.error("Microphone permission denied:", err);
            
            // Update UI
            updateStatus('Microphone access denied. Please try again.');
            
            // Reset the button
            if (permissionButton) {
                permissionButton.textContent = 'Grant Microphone Access';
                permissionButton.disabled = false;
            }
        });
}

// Initialize speech recognition
function initSpeechRecognition() {
    console.log("Initializing speech recognition");
    
    // Only initialize speech recognition in Chrome
    if (isChrome) {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }
        
        // Create speech recognition object
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // Handle results
        recognition.onresult = (event) => {
            console.log("Speech recognition result received");
            const transcript = event.results[0][0].transcript;
            displayRecognizedWord(transcript);
        };
        
        // Handle errors
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            
            if (event.error === 'not-allowed') {
                updateStatus('Microphone access denied');
                permissionGranted = false;
                
                // Show the permission button again
                const permissionButton = document.getElementById('permission-button');
                if (permissionButton) {
                    permissionButton.style.display = 'block';
                    permissionButton.textContent = 'Grant Microphone Access';
                    permissionButton.disabled = false;
                }
            } else {
                updateStatus('Error occurred. Try again.');
            }
            
            // Reset status after 2 seconds
            setTimeout(() => {
                updateStatus('Ready to record');
            }, 2000);
        };
        
        // Handle end of recognition
        recognition.onend = () => {
            console.log("Speech recognition ended");
            stopRecording();
        };
    }
    
    // Create UI elements
    createSpeechRecognitionUI();
    
    // Set up keyboard event listeners
    setupKeyboardListeners();
    
    console.log("Speech recognition initialized");
}

// Set up keyboard event listeners
function setupKeyboardListeners() {
    console.log("Setting up keyboard listeners");
    
    // Use keydown event for detecting space key press
    window.addEventListener('keydown', function(event) {
        console.log("Key down:", event.code);
        
        // Check if space key is pressed and not already recording
        if (event.code === 'Space' && !isRecording && !event.repeat) {
            // Prevent default space behavior (scrolling)
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
            }
            
            console.log("Space key pressed - starting recording");
            
            // If permission not yet granted, request it first
            if (!permissionGranted) {
                requestMicrophonePermission();
                return;
            }
            
            // If minimized, expand first
            if (isMinimized) {
                toggleSpeechContainer();
            }
            
            // Update record button UI
            const recordButton = document.getElementById('record-button');
            if (recordButton) {
                recordButton.innerHTML = '<span class="stop-icon"></span>Stop';
                recordButton.classList.add('recording');
            }
            
            startRecording();
        }
    }, true);
    
    // Use keyup event for detecting space key release
    window.addEventListener('keyup', function(event) {
        console.log("Key up:", event.code);
        
        // Check if space key is released and currently recording
        if (event.code === 'Space' && isRecording) {
            console.log("Space key released - stopping recording");
            
            // Update record button UI
            const recordButton = document.getElementById('record-button');
            if (recordButton) {
                recordButton.innerHTML = '<span class="record-icon"></span>Record';
                recordButton.classList.remove('recording');
            }
            
            stopRecording();
        }
    }, true);
    
    console.log("Keyboard listeners set up");
}

// Start recording
function startRecording() {
    if (isRecording) return;
    
    console.log("Starting recording");
    isRecording = true;
    audioChunks = [];
    
    // Clear any existing timeouts
    if (wordDisplayTimeout) {
        clearTimeout(wordDisplayTimeout);
    }
    
    // Clear previous recognized word (Chrome only)
    if (isChrome) {
        const recognizedWordElement = document.getElementById('recognized-word');
        if (recognizedWordElement) {
            recognizedWordElement.textContent = '';
            recognizedWordElement.className = 'recognized-word';
        }
    }
    
    // Hide replay button
    const replayButton = document.getElementById('replay-button');
    if (replayButton) {
        replayButton.style.display = 'none';
    }
    
    // Update status
    updateStatus('Recording...', true);
    
    // Start speech recognition if in Chrome
    if (isChrome && recognition) {
        try {
            recognition.start();
            console.log("Recognition started");
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }
    
    // Start media recording
    startMediaRecording();
}

// Start media recording
function startMediaRecording() {
    // Check if we have access to the audio stream
    if (!window.audioStream) {
        console.error("No audio stream available");
        return;
    }
    
    try {
        // Create media recorder
        mediaRecorder = new MediaRecorder(window.audioStream);
        
        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        // Handle recording stop
        mediaRecorder.onstop = () => {
            console.log("Media recording stopped");
            
            // Create audio blob
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // Create URL for the audio blob
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            audioUrl = URL.createObjectURL(audioBlob);
            
            // Set the audio source
            const audioElement = document.getElementById('speech-audio');
            if (audioElement) {
                audioElement.src = audioUrl;
                
                // Auto-play the recording
                console.log("Auto-playing recording");
                audioElement.play().catch(error => {
                    console.error("Error auto-playing audio:", error);
                });
                
                // Show replay button
                const replayButton = document.getElementById('replay-button');
                if (replayButton) {
                    replayButton.style.display = 'block';
                }
            }
        };
        
        // Start recording
        mediaRecorder.start();
        console.log("Media recording started");
    } catch (error) {
        console.error("Error starting media recording:", error);
        isRecording = false;
        updateStatus('Error recording audio. Please try again.');
    }
}

// Stop recording
function stopRecording() {
    if (!isRecording) return;
    
    console.log("Stopping recording");
    isRecording = false;
    
    // Update status
    updateStatus('Processing...', false);
    
    // Stop speech recognition if in Chrome
    if (isChrome && recognition) {
        try {
            recognition.stop();
            console.log("Recognition stopped");
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }
    
    // Stop media recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
            mediaRecorder.stop();
            console.log("Media recorder stopped");
        } catch (error) {
            console.error("Error stopping media recorder:", error);
        }
    }
    
    // Reset status after processing
    setTimeout(() => {
        updateStatus('Ready to record');
    }, 1000);
}

// Replay the recorded audio
function replayRecording() {
    console.log("Replaying recording");
    
    const audioElement = document.getElementById('speech-audio');
    if (audioElement && audioUrl) {
        audioElement.play().catch(error => {
            console.error("Error playing audio:", error);
        });
    } else {
        console.error("Audio element or URL not available");
    }
}

// Display recognized word (Chrome only)
function displayRecognizedWord(word) {
    if (!isChrome) return;
    
    console.log("Displaying recognized word:", word);
    const recognizedWordElement = document.getElementById('recognized-word');
    if (!recognizedWordElement) {
        console.error("Recognized word element not found");
        return;
    }
    
    recognizedWordElement.textContent = word;
    
    // Search for the word in our dictionary
    const foundWord = searchForRecognizedWord(word);
    
    // Apply appropriate styling based on whether the word was found
    if (foundWord) {
        recognizedWordElement.classList.add('word-found');
        recognizedWordElement.classList.remove('word-not-found');
        
        // Wait a moment before playing the dictionary pronunciation
        setTimeout(() => {
            // Play the pronunciation if available
            if (foundWord.value.uk && foundWord.value.uk.mp3) {
                console.log("Playing UK pronunciation");
                const audio = new Audio(foundWord.value.uk.mp3);
                audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                });
            }
        }, 1500); // Wait 1.5 seconds before playing dictionary pronunciation
    } else {
        recognizedWordElement.classList.add('word-not-found');
        recognizedWordElement.classList.remove('word-found');
    }
    
    // Hide word after 3 seconds
    wordDisplayTimeout = setTimeout(() => {
        recognizedWordElement.textContent = '';
        recognizedWordElement.className = 'recognized-word';
    }, 3000);
}

// Search for the recognized word in our dictionary (Chrome only)
function searchForRecognizedWord(word) {
    if (!isChrome) return null;
    
    // Clean up the word (lowercase, remove punctuation)
    const cleanWord = word.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // If the word is empty after cleaning, don't search
    if (!cleanWord) return null;
    
    console.log("Searching for word:", cleanWord);
    
    // Check if wordsData is available
    if (!window.wordsData || !Array.isArray(window.wordsData)) {
        console.error("Words data not available or not an array");
        return null;
    }
    
    // Find the word in our dictionary
    const foundWord = window.wordsData.find(item => 
        item && item.value && item.value.word && 
        item.value.word.toLowerCase() === cleanWord
    );
    
    if (foundWord) {
        console.log("Word found in dictionary:", foundWord.value.word);
        return foundWord;
    }
    
    console.log("Word not found in dictionary");
    return null;
}

// Update status display
function updateStatus(message, isRec = false) {
    const statusElement = document.getElementById('speech-status');
    if (!statusElement) {
        console.error("Status element not found");
        return;
    }
    
    console.log("Updating status:", message, isRec);
    
    if (isRec) {
        statusElement.innerHTML = '<span class="recording-indicator"></span> ' + message;
        statusElement.classList.add('recording');
    } else {
        statusElement.textContent = message;
        statusElement.classList.remove('recording');
    }
}

// Initialize speech recognition when the page loads
window.addEventListener('load', () => {
    console.log("Window loaded - initializing speech recognition");
    // Initialize after a short delay to ensure other scripts are loaded
    setTimeout(initSpeechRecognition, 1000);
});
