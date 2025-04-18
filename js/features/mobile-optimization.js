// Mobile optimization functionality

// Initialize mobile optimizations
function initMobileOptimizations() {
    console.log("Initializing mobile optimizations");
    
    // Check if we're on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    const isTablet = /iPad|tablet|Tablet/i.test(navigator.userAgent) || (window.innerWidth >= 768 && window.innerWidth <= 1024);
    
    if (isMobile) {
        console.log("Mobile device detected");
        applyMobileOptimizations();
    } else if (isTablet) {
        console.log("Tablet device detected");
        applyTabletOptimizations();
    } else {
        console.log("Desktop device detected");
    }
    
    // Always set up event listeners for resize events
    window.addEventListener('resize', handleResize);
    
    // Set up touch-specific event handlers
    setupTouchHandlers();
    
    // Add device class to body
    if (isTablet) {
        document.body.classList.add('tablet');
    }
    if (/iPad/i.test(navigator.userAgent)) {
        document.body.classList.add('ipad');
    }
}

// Apply mobile-specific optimizations
function applyMobileOptimizations() {
    // Add mobile class to body for CSS targeting
    document.body.classList.add('mobile');
    
    // Optimize tab navigation
    optimizeTabNavigation();
    
    // Adjust speech recognition container position
    optimizeSpeechRecognition();
    
    // Optimize audio controls for touch
    optimizeAudioControls();
    
    // Add mobile-specific instructions
    addMobileInstructions();
}

// Apply tablet-specific optimizations
function applyTabletOptimizations() {
    // Add tablet class to body for CSS targeting
    document.body.classList.add('tablet');
    
    // Optimize for tablet screens
    optimizeTabletLayout();
    
    // Optimize audio controls for touch
    optimizeAudioControls();
}

// Optimize layout for tablets
function optimizeTabletLayout() {
    // Ensure speech recognition container is properly sized
    const speechContainer = document.getElementById('speech-recognition-container');
    if (speechContainer) {
        // Force larger size for iPad/tablets
        speechContainer.style.width = '380px';
        speechContainer.style.maxWidth = '380px';
        
        // Make buttons larger
        const buttons = speechContainer.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.padding = '16px';
            button.style.fontSize = '18px';
        });
        
        // Make recognized word larger
        const recognizedWord = speechContainer.querySelector('#recognized-word');
        if (recognizedWord) {
            recognizedWord.style.fontSize = '32px';
            recognizedWord.style.minHeight = '48px';
        }
    }
    
    // Make tab buttons larger
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.style.padding = '12px 20px';
        btn.style.fontSize = '16px';
    });
}

// Optimize tab navigation for mobile
function optimizeTabNavigation() {
    const tabsContainer = document.querySelector('.tabs');
    if (!tabsContainer) return;
    
    // Add horizontal scrolling for tabs if needed
    tabsContainer.style.overflowX = 'auto';
    tabsContainer.style.WebkitOverflowScrolling = 'touch';
    
    // Make sure active tab is visible
    const activeTab = tabsContainer.querySelector('.tab-btn.active');
    if (activeTab) {
        setTimeout(() => {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 100);
    }
}

// Optimize speech recognition for mobile
function optimizeSpeechRecognition() {
    const speechContainer = document.getElementById('speech-recognition-container');
    if (!speechContainer) return;
    
    // Add touch button for mobile devices that can't use space key easily
    const touchRecordButton = document.createElement('button');
    touchRecordButton.id = 'touch-record-button';
    touchRecordButton.className = 'touch-record-button';
    touchRecordButton.textContent = 'Tap and Hold to Record';
    
    // Add touch events
    let touchRecording = false;
    
    touchRecordButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!touchRecording && window.startRecording) {
            touchRecording = true;
            touchRecordButton.textContent = 'Release to Stop';
            touchRecordButton.classList.add('recording');
            window.startRecording();
        }
    });
    
    touchRecordButton.addEventListener('touchend', () => {
        if (touchRecording && window.stopRecording) {
            touchRecording = false;
            touchRecordButton.textContent = 'Tap and Hold to Record';
            touchRecordButton.classList.remove('recording');
            window.stopRecording();
        }
    });
    
    // Add the button to the speech container
    const instructions = speechContainer.querySelector('.speech-instructions');
    if (instructions) {
        speechContainer.insertBefore(touchRecordButton, instructions);
    } else {
        speechContainer.appendChild(touchRecordButton);
    }
    
    // Update instructions
    if (instructions) {
        instructions.textContent = 'Hold SPACE key or use the button below to record';
    }
}

// Optimize audio controls for touch
function optimizeAudioControls() {
    // Make audio buttons larger for touch
    const audioButtons = document.querySelectorAll('.audio-btn');
    audioButtons.forEach(btn => {
        btn.style.minWidth = '44px';
        btn.style.minHeight = '44px';
    });
}

// Add mobile-specific instructions
function addMobileInstructions() {
    // Add a mobile tip banner that can be dismissed
    const tipBanner = document.createElement('div');
    tipBanner.className = 'mobile-tip-banner';
    tipBanner.innerHTML = `
        <div class="tip-content">
            <p>Tip: Rotate your device to landscape for a better experience</p>
        </div>
        <button class="dismiss-tip">×</button>
    `;
    
    // Add dismiss functionality
    const dismissButton = tipBanner.querySelector('.dismiss-tip');
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            tipBanner.style.display = 'none';
            localStorage.setItem('mobile-tip-dismissed', 'true');
        });
    }
    
    // Only show if not previously dismissed
    if (!localStorage.getItem('mobile-tip-dismissed')) {
        document.body.appendChild(tipBanner);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (tipBanner.parentNode) {
                tipBanner.style.opacity = '0';
                setTimeout(() => {
                    if (tipBanner.parentNode) {
                        tipBanner.parentNode.removeChild(tipBanner);
                    }
                }, 500);
            }
        }, 5000);
    }
}

// Handle window resize events
function handleResize() {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
    
    if (isMobile && !document.body.classList.contains('mobile')) {
        document.body.classList.add('mobile');
        document.body.classList.remove('tablet');
        applyMobileOptimizations();
    } else if (isTablet && !document.body.classList.contains('tablet')) {
        document.body.classList.add('tablet');
        document.body.classList.remove('mobile');
        applyTabletOptimizations();
    } else if (!isMobile && !isTablet) {
        document.body.classList.remove('mobile');
        document.body.classList.remove('tablet');
        // Revert any mobile-specific DOM changes if needed
    }
}

// Set up touch-specific event handlers
function setupTouchHandlers() {
    // Expose recording functions globally so they can be called from touch events
    if (typeof startRecording === 'function') {
        window.startRecording = startRecording;
    }
    
    if (typeof stopRecording === 'function') {
        window.stopRecording = stopRecording;
    }
    
    // Prevent double-tap zoom on buttons
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.classList.contains('tab-btn')) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileOptimizations);

// Also initialize on window load as a fallback
window.addEventListener('load', () => {
    if (!document.body.classList.contains('mobile') && !document.body.classList.contains('tablet')) {
        initMobileOptimizations();
    }
});
