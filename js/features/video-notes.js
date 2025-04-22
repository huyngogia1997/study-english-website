// Video Notes Functionality

// Initialize notes functionality
function initVideoNotes() {
    console.log("Initializing video notes functionality");
    
    // Initialize global flag for note taking mode
    window.isInNoteTakingMode = false;
    
    // Get DOM elements
    const notesTextarea = document.getElementById('video-notes');
    const saveNoteBtn = document.getElementById('save-note');
    const clearNoteBtn = document.getElementById('clear-note');
    const noteTakingSection = document.querySelector('.note-taking-section');
    
    if (!notesTextarea || !saveNoteBtn || !clearNoteBtn || !noteTakingSection) {
        console.error("Required note elements not found");
        return;
    }
    
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');
    
    if (!videoId) {
        console.error("No video ID found in URL");
        return;
    }
    
    // Load saved notes for this video
    loadNotes(videoId);
    
    // Save notes when button is clicked
    saveNoteBtn.addEventListener('click', () => {
        saveNotes(videoId, notesTextarea.value);
        showSaveConfirmation();
    });
    
    // Clear notes when button is clicked
    clearNoteBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your notes?")) {
            notesTextarea.value = '';
            saveNotes(videoId, '');
        }
    });
    
    // Auto-save notes every 30 seconds
    let autoSaveInterval = setInterval(() => {
        if (notesTextarea.value) {
            saveNotes(videoId, notesTextarea.value);
            console.log("Auto-saved notes");
        }
    }, 30000);
    
    // Add keyboard shortcut for play/pause while typing
    notesTextarea.addEventListener('keydown', (event) => {
        // Ctrl+Space to toggle play/pause
        if (event.ctrlKey && event.code === 'Space') {
            event.preventDefault(); // Prevent space from being typed
            togglePlayPause();
        }
        
        // Escape key to finish note taking and play video
        if (event.key === 'Escape') {
            event.preventDefault();
            finishNoteTaking(videoId, notesTextarea);
        }
        
        // Prevent Tab key from moving focus out of textarea
        if (event.key === 'Tab') {
            event.preventDefault();
            // Insert tab character (optional)
            const start = notesTextarea.selectionStart;
            const end = notesTextarea.selectionEnd;
            notesTextarea.value = notesTextarea.value.substring(0, start) + '\t' + notesTextarea.value.substring(end);
            notesTextarea.selectionStart = notesTextarea.selectionEnd = start + 1;
        }
    });
    
    // Global keyboard shortcuts for the video page
    document.addEventListener('keydown', (event) => {
        // Only process if not in a text input (except for Escape)
        const isInTextInput = event.target.tagName === 'TEXTAREA' || 
                             event.target.tagName === 'INPUT';
        
        // Enter key to start note taking (only when not already in textarea)
        if (event.key === 'Enter' && !isInTextInput) {
            event.preventDefault();
            startNoteTaking(notesTextarea);
        }
        
        // Escape key to finish note taking (handled in textarea event for when in note mode)
        if (event.key === 'Escape' && isInTextInput && event.target === notesTextarea) {
            event.preventDefault();
            finishNoteTaking(videoId, notesTextarea);
        }
    });
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        clearInterval(autoSaveInterval);
        saveNotes(videoId, notesTextarea.value); // Save notes before leaving
    });
}

// Start note taking mode
function startNoteTaking(notesTextarea) {
    console.log("Starting note taking mode");
    
    // Pause the video
    if (typeof player !== 'undefined' && player) {
        player.pauseVideo();
    }
    
    // Set a flag to indicate we're in note taking mode
    window.isInNoteTakingMode = true;
    
    // Focus on the textarea (no need to scroll since it's side-by-side now)
    setTimeout(() => {
        notesTextarea.focus();
        
        // Add active class to highlight the note section
        const noteTakingSection = document.querySelector('.note-taking-section');
        if (noteTakingSection) {
            noteTakingSection.classList.add('active-note-taking');
        }
        
        // Show notification
        showNotification('Note taking mode activated. Press ESC when done.');
    }, 100);
}

// Finish note taking mode
function finishNoteTaking(videoId, notesTextarea) {
    console.log("Finishing note taking mode");
    
    // Save the notes
    saveNotes(videoId, notesTextarea.value);
    showSaveConfirmation();
    
    // Remove focus from textarea
    notesTextarea.blur();
    
    // Remove active class
    const noteTakingSection = document.querySelector('.note-taking-section');
    if (noteTakingSection) {
        noteTakingSection.classList.remove('active-note-taking');
    }
    
    // Reset note taking mode flag
    window.isInNoteTakingMode = false;
    
    // Resume video playback
    if (typeof player !== 'undefined' && player) {
        player.playVideo();
    }
    
    // Show notification
    showNotification('Notes saved. Video playback resumed.');
}

// Load notes for a specific video
function loadNotes(videoId) {
    try {
        const notesTextarea = document.getElementById('video-notes');
        const savedNotes = localStorage.getItem(`video-notes-${videoId}`);
        
        if (savedNotes) {
            notesTextarea.value = savedNotes;
            console.log("Loaded saved notes for video:", videoId);
        }
    } catch (error) {
        console.error("Error loading notes:", error);
    }
}

// Save notes for a specific video
function saveNotes(videoId, notes) {
    try {
        localStorage.setItem(`video-notes-${videoId}`, notes);
        console.log("Saved notes for video:", videoId);
    } catch (error) {
        console.error("Error saving notes:", error);
        alert("Failed to save notes. Your browser might have storage restrictions.");
    }
}

// Show save confirmation
function showSaveConfirmation() {
    showNotification('Notes saved!');
}

// Show notification
function showNotification(message) {
    // Create or get existing notification element
    let notification = document.getElementById('video-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'video-notification';
        notification.className = 'video-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show the notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Add to the list of modules to initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the video player page
    if (document.getElementById('video-notes')) {
        // Wait for YouTube player to be ready
        if (typeof YT !== 'undefined' && YT.Player) {
            initVideoNotes();
        } else {
            // If YouTube API isn't loaded yet, wait for it
            window.addEventListener('youtubePlayerReady', initVideoNotes);
        }
    }
});
    // Add direct event listener to textarea to ensure it captures all key events
    notesTextarea.addEventListener('focus', () => {
        // When textarea gets focus, ensure note taking mode is active
        window.isInNoteTakingMode = true;
    });
    
    notesTextarea.addEventListener('blur', () => {
        // When textarea loses focus (but not when pressing Escape which is handled separately)
        // Only deactivate if we're not in the middle of another operation
        setTimeout(() => {
            // Check if focus moved to another element within the note section
            const activeElement = document.activeElement;
            const isStillInNoteSection = noteTakingSection.contains(activeElement);
            
            if (!isStillInNoteSection) {
                window.isInNoteTakingMode = false;
            }
        }, 100);
    });
