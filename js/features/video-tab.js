// Video Tab Functionality for Index Page

// Initialize the video tab
function initVideoTab() {
    console.log("Initializing video tab");
    
    // Check if elements exist
    const seriesFilter = document.getElementById('series-filter');
    const searchFilter = document.getElementById('search-filter');
    
    if (!seriesFilter || !searchFilter) {
        console.error("Required video tab elements not found");
        return;
    }
    
    // Check if listeningVideos is defined
    if (typeof listeningVideos === 'undefined' || !Array.isArray(listeningVideos)) {
        console.error("listeningVideos is not defined or not an array");
        return;
    }
    
    try {
        // Get all unique series
        const allSeries = [...new Set(listeningVideos.map(item => item.series))].sort();
        
        // Populate series filter
        seriesFilter.innerHTML = '<option value="all">All Series</option>';
        allSeries.forEach(series => {
            const option = document.createElement('option');
            option.value = series.toLowerCase().replace(/\s+/g, '-');
            option.textContent = series;
            seriesFilter.appendChild(option);
        });
        
        // Apply filters when changed
        seriesFilter.addEventListener('change', applyFilters);
        searchFilter.addEventListener('input', applyFilters);
        
        // Initial load
        applyFilters();
        console.log("Video tab initialized successfully");
    } catch (error) {
        console.error("Error initializing video tab:", error);
    }
    
    // Apply filters to videos
    function applyFilters() {
        try {
            const selectedSeries = seriesFilter.value.toLowerCase();
            const search = searchFilter.value.toLowerCase();
            
            // Create a flat array of all videos for filtering
            let allVideos = [];
            listeningVideos.forEach(seriesGroup => {
                seriesGroup.videos.forEach(video => {
                    // Add the series to each video for filtering
                    allVideos.push({
                        ...video,
                        seriesId: seriesGroup.series.toLowerCase().replace(/\s+/g, '-')
                    });
                });
            });
            
            // Filter videos based on criteria
            let filteredVideos = allVideos.filter(video => {
                // Filter by series
                if (selectedSeries !== 'all' && video.seriesId !== selectedSeries) {
                    return false;
                }
                
                // Filter by search term
                if (search && !video.title.toLowerCase().includes(search) && 
                    !video.description.toLowerCase().includes(search)) {
                    return false;
                }
                
                return true;
            });
            
            // Display filtered videos
            displayVideos(filteredVideos);
        } catch (error) {
            console.error("Error applying filters:", error);
        }
    }
    
    // Display videos in grid view
    function displayVideos(videos) {
        try {
            const videoGrid = document.getElementById('video-grid');
            const noResults = document.getElementById('no-results');
            
            if (!videoGrid || !noResults) {
                console.error("Video grid elements not found");
                return;
            }
            
            // Clear current videos
            videoGrid.innerHTML = '';
            
            if (videos.length === 0) {
                videoGrid.style.display = 'none';
                noResults.style.display = 'block';
                noResults.innerHTML = '<p>No videos match your search criteria. Please try different filters.</p>';
                return;
            }
            
            videoGrid.style.display = 'grid';
            noResults.style.display = 'none';
            
            // Group videos by series for display
            const videosBySeries = {};
            videos.forEach(video => {
                const series = video.series;
                if (!videosBySeries[series]) {
                    videosBySeries[series] = [];
                }
                videosBySeries[series].push(video);
            });
            
            // Display videos grouped by series
            Object.keys(videosBySeries).sort().forEach(series => {
                // Create series header
                const seriesHeader = document.createElement('div');
                seriesHeader.className = 'series-header';
                seriesHeader.innerHTML = `<h2>${series}</h2>`;
                videoGrid.appendChild(seriesHeader);
                
                // Create series container
                const seriesContainer = document.createElement('div');
                seriesContainer.className = 'series-container';
                videoGrid.appendChild(seriesContainer);
                
                // Add videos to this series
                videosBySeries[series].forEach(video => {
                    const videoCard = createVideoCard(video);
                    seriesContainer.appendChild(videoCard);
                });
            });
        } catch (error) {
            console.error("Error displaying videos:", error);
        }
    }
}

// Create a video card element
function createVideoCard(video) {
    try {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Truncate description to 100 characters with ellipsis
        const truncatedDescription = video.description.length > 100 
            ? video.description.substring(0, 100) + '...' 
            : video.description;
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <img src="https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg" 
                     onerror="this.onerror=null; this.src='https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg';" 
                     alt="${video.title}">
                <div class="video-duration">${video.duration}</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <p class="video-description">${truncatedDescription}</p>
                <div class="video-meta">
                    <span class="video-level level-${video.level.toLowerCase().replace(' ', '-')}">${video.level}</span>
                    <span class="video-category">${video.category}</span>
                </div>
            </div>
        `;
        
        videoCard.addEventListener('click', () => {
            window.location.href = `video-player.html?id=${video.id}`;
        });
        
        return videoCard;
    } catch (error) {
        console.error("Error creating video card:", error);
        return document.createElement('div'); // Return empty div as fallback
    }
}

// Initialize the video tab when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the index page with the videos tab
    const videosTab = document.getElementById('videos');
    const videoGrid = document.getElementById('video-grid');
    
    if (videosTab && videoGrid) {
        // Wait a bit to ensure all other scripts are loaded
        setTimeout(() => {
            console.log("Checking if video tab should be initialized");
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab && activeTab.getAttribute('data-tab') === 'videos') {
                initVideoTab();
            }
        }, 500);
    }
});
