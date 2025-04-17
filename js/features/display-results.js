// Display search results

// Display search results
function displayResults(results) {
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    let html = '';
    
    results.forEach(result => {
        const word = result.value;
        
        html += `
            <div class="word-result">
                <div class="word-header">
                    <h2 class="word-title">${word.word}</h2>
                    ${word.level ? `<span class="word-level">${word.level}</span>` : ''}
                </div>
                
                ${word.type ? `<p class="word-type">${word.type}</p>` : ''}
                
                <div class="pronunciation">
                    <div class="pronunciation-title">Pronunciation:</div>
                    <div class="phonetics">
                        ${word.phonetics?.uk ? `<div>UK: ${word.phonetics.uk}</div>` : ''}
                        ${word.phonetics?.us ? `<div>US: ${word.phonetics.us}</div>` : ''}
                    </div>
                    
                    <div class="audio-controls">
                        ${word.uk?.mp3 ? `
                            <button class="audio-btn" onclick="playAudio('${word.uk.mp3}')">
                                Play UK 🔊
                            </button>
                        ` : ''}
                        
                        ${word.us?.mp3 ? `
                            <button class="audio-btn" onclick="playAudio('${word.us.mp3}')">
                                Play US 🔊
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <a href="${word.href}" target="_blank">View on Oxford Learner's Dictionary</a>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
}
