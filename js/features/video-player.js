// Video Player Functionality

let player;
let currentVideoId = null;
let customRewindTime = 5; // Default rewind time in seconds
let subtitlesEnabled = true;
let hasSubtitles = false; // Flag to track if the current video has subtitles
let audioOnlyMode = false; // Flag for audio only mode

// Initialize the video player page
function initVideoPlayerPage() {
    showLoading(true);
    
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Set up event listeners for controls
    setupVideoControls();
    
    // Get video ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    
    if (videoId) {
        // Find the video data in the new structure
        let videoData = null;
        
        // Search through all series for the video
        for (const seriesGroup of listeningVideos) {
            const foundVideo = seriesGroup.videos.find(video => video.id === videoId);
            if (foundVideo) {
                videoData = foundVideo;
                break;
            }
        }
        
        if (videoData) {
            currentVideoId = videoData.youtubeId;
            displayVideoDetails(videoData);
        } else {
            showError("Video not found");
            showLoading(false);
        }
    } else {
        showError("No video selected");
        showLoading(false);
    }
}

// Display video details
function displayVideoDetails(videoData) {
    const videoPlayerContainer = document.getElementById('video-player-container');
    
    // Update page title
    document.title = `${videoData.title} - English Study Website`;
    
    // Update video details
    const videoDetailsElement = document.getElementById('video-details');
    if (videoDetailsElement) {
        videoDetailsElement.innerHTML = `
            <h2>${videoData.title}</h2>
            <div class="video-meta">
                <span class="video-level level-${videoData.level.toLowerCase()}">${videoData.level}</span>
                <span class="video-category">${videoData.category}</span>
                <span class="video-duration">${videoData.duration}</span>
            </div>
            <p class="video-description">${videoData.description || 'No description available'}</p>
        `;
    } else {
        console.error("Video details element not found");
    }
    
    // The YouTube API will call onYouTubeIframeAPIReady when it's loaded
}

// This function is called by the YouTube API when it's ready
function onYouTubeIframeAPIReady() {
    if (currentVideoId) {
        player = new YT.Player('youtube-player', {
            height: '100%',
            width: '100%',
            videoId: currentVideoId,
            playerVars: {
                'playsinline': 1,
                'rel': 0,
                'modestbranding': 1,
                'cc_load_policy': 1, // Force closed captions to be available
                'cc_lang_pref': 'en' // Prefer English captions
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onApiChange': onPlayerApiChange
            }
        });
    }
}

// Called when the player is ready
function onPlayerReady(event) {
    console.log("Player ready");
    
    // Hide loading indicator
    showLoading(false);
    
    // Check for subtitles
    setTimeout(() => {
        checkForYouTubeSubtitles();
    }, 1000); // Delay to ensure captions are loaded
    
    // Make player globally accessible for subtitle module
    window.player = player;
    
    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('youtubePlayerReady', { 
        detail: { player: player } 
    }));
}

// Called when the player API changes (e.g., captions become available)
function onPlayerApiChange() {
    console.log("Player API changed, checking for subtitles");
    checkForYouTubeSubtitles();
}

// Check if the YouTube video has subtitles/captions
function checkForYouTubeSubtitles() {
    if (!player) return;
    
    try {
        // Get available tracks
        const tracks = player.getOption('captions', 'tracklist') || [];
        
        // Update subtitle availability
        hasSubtitles = tracks.length > 0;
        
        // Make hasSubtitles globally accessible for subtitle module
        window.hasSubtitles = hasSubtitles;
        
        // Show/hide subtitle container based on availability
        const subtitleContainer = document.getElementById('subtitle-container');
        if (subtitleContainer) {
            // Always show the subtitle container - we'll use our own subtitles if YouTube doesn't have any
            subtitleContainer.classList.remove('hidden');
            
            if (hasSubtitles) {
                // Enable subtitles by default
                const englishTrack = tracks.find(track => 
                    track.languageCode === 'en' || 
                    track.languageCode === 'en-US' || 
                    track.languageCode === 'en-GB'
                );
                
                // If no English track, use the first available track
                const trackToUse = englishTrack || tracks[0];
                player.setOption('captions', 'track', trackToUse);
                
                // Update subtitle toggle button text
                const subtitleToggleText = document.getElementById('subtitle-toggle-text');
                if (subtitleToggleText) {
                    subtitleToggleText.textContent = 'Hide Subtitles';
                }
                subtitlesEnabled = true;
            } else {
                // Use our own subtitles
                subtitlesEnabled = true;
                
                // Dispatch event to load our custom subtitles
                window.dispatchEvent(new CustomEvent('loadCustomSubtitles'));
            }
        }
        
        console.log("Subtitle tracks:", tracks);
    } catch (error) {
        console.error("Error checking for subtitles:", error);
        hasSubtitles = false;
        window.hasSubtitles = false;
        
        // Dispatch event to load our custom subtitles
        window.dispatchEvent(new CustomEvent('loadCustomSubtitles'));
    }
}

// Called when the player state changes
function onPlayerStateChange(event) {
    // Update play/pause button text
    const playPauseBtn = document.getElementById('play-pause');
    if (event.data === YT.PlayerState.PLAYING) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
    }
}

// Toggle play/pause
function togglePlayPause() {
    if (!player) return;
    
    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

// Rewind video by specified seconds
function rewindVideo(seconds) {
    if (!player) return;
    
    const currentTime = player.getCurrentTime();
    const newTime = Math.max(0, currentTime - seconds);
    player.seekTo(newTime, true);
    
    // If paused, play the video
    if (player.getPlayerState() === YT.PlayerState.PAUSED) {
        player.playVideo();
    }
}

// Toggle audio only mode
function toggleAudioOnlyMode() {
    audioOnlyMode = !audioOnlyMode;
    
    const videoOverlay = document.getElementById('video-overlay');
    const audioOnlyBtn = document.querySelector('.audio-only-btn');
    
    if (audioOnlyMode) {
        videoOverlay.classList.add('active');
        audioOnlyBtn.classList.add('active');
    } else {
        videoOverlay.classList.remove('active');
        audioOnlyBtn.classList.remove('active');
    }
}

// Show video (exit audio only mode)
function showVideo() {
    audioOnlyMode = false;
    document.getElementById('video-overlay').classList.remove('active');
    document.querySelector('.audio-only-btn').classList.remove('active');
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Don't trigger shortcuts if user is typing in a text field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            // Special case for Escape key to exit note taking mode
            if (event.key === 'Escape' && window.isInNoteTakingMode) {
                window.finishNoteTaking();
                event.preventDefault();
            }
            // Special case for Ctrl+Space to toggle play/pause while typing
            else if (event.key === ' ' && event.ctrlKey && window.isInNoteTakingMode) {
                togglePlayPause();
                event.preventDefault();
            }
            return;
        }
        
        switch (event.key) {
            case ' ': // Space bar
                togglePlayPause();
                event.preventDefault();
                break;
            case '1':
                rewindVideo(2);
                event.preventDefault();
                break;
            case '2':
            case 'ArrowLeft':
                rewindVideo(5);
                event.preventDefault();
                break;
            case '3':
                rewindVideo(10);
                event.preventDefault();
                break;
            case 'ArrowRight':
                if (player) {
                    player.seekTo(player.getCurrentTime() + 5, true);
                }
                event.preventDefault();
                break;
            case 'Shift':
                rewindToSentence();
                event.preventDefault();
                break;
            case 'h':
            case 'H':
                toggleAudioOnlyMode();
                event.preventDefault();
                break;
            case 'Enter':
                // Start note taking mode if not already in it
                if (!window.isInNoteTakingMode && document.getElementById('video-notes')) {
                    window.startNoteTaking();
                    event.preventDefault();
                }
                break;
        }
    });
}

// Rewind to the beginning of the current sentence
function rewindToSentence() {
    if (!player) return;
    
    // This is a simplified implementation
    // In a real implementation, you would need to track sentence boundaries
    rewindVideo(3); // Rewind 3 seconds as a simple approximation
}

// Toggle YouTube subtitles on/off
function toggleYouTubeSubtitles() {
    if (!player) return;
    
    try {
        // Get current state of captions
        const currentState = player.getOption('captions', 'track');
        
        if (currentState && currentState.displayName) {
            // Captions are on, turn them off
            player.setOption('captions', 'track', {});
            const subtitleToggleText = document.getElementById('subtitle-toggle-text');
            if (subtitleToggleText) {
                subtitleToggleText.textContent = 'Show Subtitles';
            }
            subtitlesEnabled = false;
        } else {
            // Captions are off, turn them on
            const tracks = player.getOption('captions', 'tracklist') || [];
            if (tracks.length > 0) {
                // Look for English track first
                let englishTrack = tracks.find(track => 
                    track.languageCode === 'en' || 
                    track.languageCode === 'en-US' || 
                    track.languageCode === 'en-GB'
                );
                
                // If no English track, use the first available track
                const trackToUse = englishTrack || tracks[0];
                
                player.setOption('captions', 'track', trackToUse);
                const subtitleToggleText = document.getElementById('subtitle-toggle-text');
                if (subtitleToggleText) {
                    subtitleToggleText.textContent = 'Hide Subtitles';
                }
                subtitlesEnabled = true;
            }
        }
    } catch (error) {
        console.error("Error toggling YouTube subtitles:", error);
    }
}

// Set up event listeners for video controls
function setupVideoControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause');
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Rewind buttons
    document.getElementById('rewind-2s').addEventListener('click', () => rewindVideo(2));
    document.getElementById('rewind-5s').addEventListener('click', () => rewindVideo(5));
    
    // Custom rewind
    document.getElementById('rewind-custom').addEventListener('click', () => {
        const customTime = parseInt(document.getElementById('custom-time').value);
        if (customTime > 0) {
            customRewindTime = customTime;
            rewindVideo(customTime);
        }
    });
    
    // Audio only mode toggle
    document.getElementById('audio-only-toggle').addEventListener('click', toggleAudioOnlyMode);
    document.getElementById('show-video-btn').addEventListener('click', showVideo);
    
    // Subtitle toggle
    const subtitleToggleBtn = document.getElementById('subtitle-toggle');
    if (subtitleToggleBtn) {
        subtitleToggleBtn.addEventListener('click', toggleYouTubeSubtitles);
    }
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
}

// Show loading indicator
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }
}

// Show error message
function showError(message) {
    const videoDetailsElement = document.getElementById('video-details');
    if (videoDetailsElement) {
        videoDetailsElement.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <a href="index.html" class="back-button">Back to Videos</a>
            </div>
        `;
    }
}

// Initialize the page when the DOM is loaded
document.addEventListener('DOMContentLoaded', initVideoPlayerPage);
