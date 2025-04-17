// Simple test script for speech recognition

console.log("Speech recognition test script loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded in test script");
    
    // Create a simple UI for testing
    const testContainer = document.createElement('div');
    testContainer.style.position = 'fixed';
    testContainer.style.bottom = '20px';
    testContainer.style.left = '20px';
    testContainer.style.backgroundColor = '#f0f0f0';
    testContainer.style.padding = '15px';
    testContainer.style.borderRadius = '5px';
    testContainer.style.zIndex = '9999';
    
    const statusText = document.createElement('div');
    statusText.id = 'test-status';
    statusText.textContent = 'Space key test: Press space';
    
    testContainer.appendChild(statusText);
    document.body.appendChild(testContainer);
    
    // Set up simple space key detection
    document.addEventListener('keydown', (event) => {
        console.log("Key pressed:", event.code);
        if (event.code === 'Space') {
            statusText.textContent = 'SPACE DOWN';
            statusText.style.color = 'green';
            statusText.style.fontWeight = 'bold';
            
            // Prevent default only if not in input
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                event.preventDefault();
            }
        }
    });
    
    document.addEventListener('keyup', (event) => {
        console.log("Key released:", event.code);
        if (event.code === 'Space') {
            statusText.textContent = 'Space key test: Press space';
            statusText.style.color = 'black';
            statusText.style.fontWeight = 'normal';
        }
    });
});
