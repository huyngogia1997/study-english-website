// Simple Subtitle Display Functionality

// Initialize subtitle display functionality
function initSubtitleDisplay() {
    console.log("Initializing simple subtitle display");
    
    // Get DOM elements
    const fullTranscriptEl = document.getElementById('full-transcript');
    
    if (!fullTranscriptEl) {
        console.error("Required subtitle elements not found");
        return;
    }
    
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
        
        if (videoData && videoData.subtitle) {
            console.log("Found subtitle for video:", videoId);
            displaySubtitle(fullTranscriptEl, videoData.subtitle);
        } else {
            console.error("No subtitle found for video:", videoId);
            fullTranscriptEl.innerHTML = '<div class="no-transcript">No transcript available for this video.</div>';
        }
    } else {
        console.error("No video ID in URL");
        fullTranscriptEl.innerHTML = '<div class="no-transcript">No video selected.</div>';
    }
}

// Display subtitle from the provided text
function displaySubtitle(transcriptElement, subtitleText) {
    // Clear loading message
    transcriptElement.innerHTML = '';
    
    // Split subtitle into lines
    const lines = subtitleText.split('\n');
    
    // Add each line as a paragraph
    lines.forEach((line, index) => {
        if (line.trim() === '') {
            // Add empty line as a separator
            const separatorElement = document.createElement('div');
            separatorElement.className = 'transcript-separator';
            transcriptElement.appendChild(separatorElement);
        } else {
            // Add text line
            const lineElement = document.createElement('div');
            lineElement.className = 'transcript-line';
            lineElement.innerHTML = `<span class="transcript-text">${line}</span>`;
            transcriptElement.appendChild(lineElement);
        }
    });
    
    // If no lines
    if (lines.length === 0) {
        transcriptElement.innerHTML = '<div class="no-transcript">No transcript available.</div>';
    }
}

// Make sure to initialize after listeningVideos is loaded
function ensureInitialization() {
    // Check if listeningVideos is defined
    if (typeof listeningVideos !== 'undefined') {
        console.log("listeningVideos is loaded, initializing subtitle display");
        initSubtitleDisplay();
    } else {
        console.log("Waiting for listeningVideos to load...");
        // Wait a bit and try again
        setTimeout(ensureInitialization, 100);
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the video player page
    if (document.getElementById('subtitle-container')) {
        console.log("Found subtitle container, initializing...");
        // Try to initialize immediately
        ensureInitialization();
    }
});
// Listen for custom subtitle loading event
window.addEventListener('loadCustomSubtitles', () => {
    console.log("Custom subtitle loading event received");
    initSubtitleDisplay();
});
