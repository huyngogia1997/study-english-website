#!/usr/bin/env node

/**
 * Batch YouTube to JSON Converter
 * 
 * This script reads a list of YouTube URLs and metadata from a JSON file,
 * converts them to JSON format, and replaces the content of the listening.js file.
 * 
 * Usage: node batch-youtube-converter.js [input-file.json]
 * Default input file: videos.json in the same directory
 * 
 * Input file format (JSON array of groups):
 * [
 *   {
 *     "urls": [
 *       "https://www.youtube.com/watch?v=VIDEO_ID1",
 *       "https://www.youtube.com/watch?v=VIDEO_ID2"
 *     ],
 *     "level": "Beginner",           // Default level for this group
 *     "category": "Listening",       // Default category for this group
 *     "series": "Mr. Duncan's English", // Default series for this group
 *     "group": "General English",    // Group name
 *     "sortBy": "title",             // Sort videos by: "title", "level", "duration", "series"
 *     "overrides": {                 // Optional: override specific properties for individual videos
 *       "VIDEO_ID1": {
 *         "level": "Elementary",
 *         "subtitle": "Custom subtitle text"
 *       }
 *     }
 *   },
 *   {
 *     "urls": [
 *       "https://www.youtube.com/watch?v=VIDEO_ID3"
 *     ],
 *     "level": "Intermediate",
 *     "category": "Listening",
 *     "series": "BBC Learning English",
 *     "group": "Pronunciation",
 *     "sortBy": "title"
 *   }
 * ]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');
const { execSync } = require('child_process');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to extract video ID from YouTube URL
function extractVideoId(url) {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Function to fetch HTML content
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
      }
    }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch URL: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Function to try to get description using curl (sometimes gets more data)
function getDescriptionWithCurl(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const curlCommand = `curl -s -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36" "${url}"`;
    
    const html = execSync(curlCommand).toString();
    
    // Try to extract description from the HTML
    return extractDescriptionFromHtml(html);
  } catch (error) {
    console.error('Error using curl:', error.message);
    return null;
  }
}

// Function to extract description from HTML with multiple methods
function extractDescriptionFromHtml(html) {
  let descriptions = [];
  
  try {
    // Method 1: Look for "shortDescription" in JSON data
    const shortDescRegex = /"shortDescription":\s*"((?:\\"|[^"])+)"/;
    const shortDescMatch = html.match(shortDescRegex);
    if (shortDescMatch && shortDescMatch[1]) {
      const desc = shortDescMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\');
      descriptions.push(desc);
    }
    
    // Method 2: Look for "description" in JSON data
    const descRegex = /"description":\s*"((?:\\"|[^"])+)"/g;
    let match;
    while ((match = descRegex.exec(html)) !== null) {
      const desc = match[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\');
      descriptions.push(desc);
    }
    
    // Method 3: Look for description in meta tags
    const metaDescRegex = /<meta name="description" content="([^"]+)"/;
    const metaDescMatch = html.match(metaDescRegex);
    if (metaDescMatch && metaDescMatch[1]) {
      descriptions.push(metaDescMatch[1]);
    }
    
    // Method 4: Look for og:description
    const ogDescRegex = /<meta property="og:description" content="([^"]+)"/;
    const ogDescMatch = html.match(ogDescRegex);
    if (ogDescMatch && ogDescMatch[1]) {
      descriptions.push(ogDescMatch[1]);
    }
    
    // Method 5: Look for videoDescription
    const videoDescRegex = /"videoDescription":\s*"((?:\\"|[^"])+)"/;
    const videoDescMatch = html.match(videoDescRegex);
    if (videoDescMatch && videoDescMatch[1]) {
      const desc = videoDescMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\');
      descriptions.push(desc);
    }
    
    // Method 6: Look for detailedDescription
    const detailedDescRegex = /"detailedDescription":\s*"((?:\\"|[^"])+)"/;
    const detailedDescMatch = html.match(detailedDescRegex);
    if (detailedDescMatch && detailedDescMatch[1]) {
      const desc = detailedDescMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\');
      descriptions.push(desc);
    }
    
    // Find the longest description
    if (descriptions.length > 0) {
      return descriptions.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
    }
  } catch (error) {
    console.error('Error extracting description:', error);
  }
  
  return 'No description available';
}

// Function to extract video info from HTML
function extractVideoInfo(html, videoId) {
  try {
    // Extract title
    const titleRegex = /<meta name="title" content="([^"]+)"/;
    const titleMatch = html.match(titleRegex);
    const title = titleMatch ? titleMatch[1] : 'Unknown Title';
    
    // Extract short description
    const descRegex = /<meta name="description" content="([^"]+)"/;
    const descMatch = html.match(descRegex);
    const shortDescription = descMatch ? descMatch[1] : 'No description available';
    
    // Get full description using multiple methods
    const fullDescription = extractDescriptionFromHtml(html);
    
    // Extract duration
    const durationRegex = /"lengthSeconds":"(\d+)"/;
    const durationMatch = html.match(durationRegex);
    let duration = 'Unknown';
    
    if (durationMatch && durationMatch[1]) {
      const seconds = parseInt(durationMatch[1]);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      duration = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    return { 
      title, 
      description: shortDescription, 
      fullDescription: fullDescription,
      duration, 
      videoId 
    };
  } catch (error) {
    console.error('Error extracting video info:', error);
    return {
      title: 'Unknown Title',
      description: 'No description available',
      fullDescription: 'No description available',
      duration: 'Unknown',
      videoId
    };
  }
}

// Function to read input file with new multi-group format
function readInputFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let groups;
      
      try {
        // Try to parse as JSON
        groups = JSON.parse(content);
        
        // Validate groups
        if (!Array.isArray(groups)) {
          reject(new Error('Input file must contain a JSON array of groups'));
          return;
        }
        
        // Process each group
        const allEntries = [];
        let globalSortBy = 'title'; // Default sort
        
        for (let i = 0; i < groups.length; i++) {
          const group = groups[i];
          
          // Validate group
          if (!group.urls || !Array.isArray(group.urls) || group.urls.length === 0) {
            console.warn(`Group ${i + 1} has no URLs, skipping`);
            continue;
          }
          
          // Set default values for this group
          const groupDefaults = {
            level: group.level || 'Beginner',
            category: group.category || 'Listening',
            series: group.series || "General English",
            overrides: group.overrides || {}
          };
          
          // Remember the sort order from the first group that specifies it
          if (group.sortBy && i === 0) {
            globalSortBy = group.sortBy;
          }
          
          // Create entries for this group
          const groupEntries = group.urls.map(url => {
            const videoId = extractVideoId(url);
            const override = videoId && groupDefaults.overrides[videoId] ? groupDefaults.overrides[videoId] : {};
            
            return {
              url,
              level: override.level || groupDefaults.level,
              category: override.category || groupDefaults.category,
              series: override.series || groupDefaults.series,
              subtitle: override.subtitle || null
            };
          });
          
          // Add entries from this group to the overall list
          allEntries.push(...groupEntries);
        }
        
        resolve({
          entries: allEntries,
          sortBy: globalSortBy
        });
      } catch (jsonError) {
        reject(new Error(`Failed to parse JSON: ${jsonError.message}`));
        return;
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to sort videos based on the sortBy parameter
function sortVideos(videos, sortBy = 'title') {
  // Extract lesson number from title if possible
  const getLessonNumber = (title) => {
    const match = title.match(/lesson\s+(\d+)/i);
    return match ? parseInt(match[1]) : 999; // Default to high number if no match
  };

  return [...videos].sort((a, b) => {
    switch (sortBy.toLowerCase()) {
      case 'title':
        // First try to sort by lesson number if present
        const aNum = getLessonNumber(a.title);
        const bNum = getLessonNumber(b.title);
        
        if (aNum !== bNum) {
          return aNum - bNum; // Sort by lesson number
        }
        return a.title.localeCompare(b.title); // Fall back to alphabetical
      case 'level':
        return a.level.localeCompare(b.level) || a.title.localeCompare(b.title);
      case 'duration':
        // Convert duration to seconds for comparison
        const getSeconds = (duration) => {
          if (duration === 'Unknown') return 0;
          const parts = duration.split(':');
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        };
        return getSeconds(a.duration) - getSeconds(b.duration) || a.title.localeCompare(b.title);
      case 'series':
        return a.series.localeCompare(b.series) || a.title.localeCompare(b.title);
      case 'group':
        return a.group.localeCompare(b.group) || a.title.localeCompare(b.title);
      default:
        return a.title.localeCompare(b.title);
    }
  });
}

// Function to replace listening.js file with new content
function replaceListeningJs(jsonDataArray) {
  return new Promise((resolve, reject) => {
    try {
      // Path to listening.js
      const listeningPath = path.join(__dirname, '..', 'listening-practice-resources', 'listening.js');
      
      if (!fs.existsSync(path.dirname(listeningPath))) {
        fs.mkdirSync(path.dirname(listeningPath), { recursive: true });
      }
      
      // Group videos by series
      const videosBySeries = {};
      jsonDataArray.forEach(video => {
        const series = video.series || 'Uncategorized';
        if (!videosBySeries[series]) {
          videosBySeries[series] = [];
        }
        videosBySeries[series].push(video);
      });
      
      // Create a new array with series objects
      const seriesArray = Object.keys(videosBySeries).map(seriesName => {
        return {
          series: seriesName,
          videos: videosBySeries[seriesName]
        };
      });
      
      // Format the JSON array with proper indentation
      const formattedJsonArray = JSON.stringify(seriesArray, null, 4)
        .replace(/^/gm, '    ')  // Add 4 spaces to the beginning of each line
        .replace(/^\s+\[/, '[')  // Remove spaces before the opening bracket
        .replace(/\s+\]$/, ']'); // Remove spaces before the closing bracket
      
      // Create the new content for listening.js
      const newContent = `// Listening practice videos
const listeningVideos = ${formattedJsonArray};`;
      
      // Write the new content to the file
      fs.writeFileSync(listeningPath, newContent);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// Main function
async function main() {
  try {
    console.log('\n=== Batch YouTube to JSON Converter ===\n');
    
    // Get input file path from command line args or use default
    let inputFilePath = process.argv[2];
    if (!inputFilePath) {
      inputFilePath = path.join(__dirname, 'videos.json');
      console.log(`No input file specified. Using default: ${inputFilePath}`);
    }
    
    // Make sure the path is absolute
    if (!path.isAbsolute(inputFilePath)) {
      inputFilePath = path.join(process.cwd(), inputFilePath);
    }
    
    if (!fs.existsSync(inputFilePath)) {
      console.error(`File not found: ${inputFilePath}`);
      rl.close();
      return;
    }
    
    console.log(`\nReading input file: ${inputFilePath}\n`);
    
    // Read input file with new multi-group format
    const { entries, sortBy } = await readInputFile(inputFilePath);
    console.log(`Found ${entries.length} entries to process across multiple groups.\n`);
    
    // Array to store all processed JSON data
    const allJsonData = [];
    
    // Process each entry
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      console.log(`Processing entry ${i + 1}/${entries.length}: ${entry.url}`);
      
      const videoId = extractVideoId(entry.url);
      if (!videoId) {
        console.error(`  Invalid YouTube URL: ${entry.url}`);
        continue;
      }
      
      console.log(`  Fetching information for video ID: ${videoId}...`);
      
      // Fetch video page
      const html = await fetchHtml(`https://www.youtube.com/watch?v=${videoId}`);
      const videoInfo = extractVideoInfo(html, videoId);
      
      // Try to get a better description with curl if the current one is short
      if (videoInfo.fullDescription.length < 500 && !entry.subtitle) {
        console.log(`  Description seems short, trying alternative method...`);
        const curlDescription = getDescriptionWithCurl(videoId);
        if (curlDescription && curlDescription.length > videoInfo.fullDescription.length) {
          videoInfo.fullDescription = curlDescription;
          console.log(`  Found better description (${curlDescription.length} characters)`);
        }
      }
      
      console.log(`  Title: ${videoInfo.title}`);
      console.log(`  Duration: ${videoInfo.duration}`);
      console.log(`  Level: ${entry.level}`);
      console.log(`  Category: ${entry.category}`);
      console.log(`  Series: ${entry.series}`);
      console.log(`  Description length: ${videoInfo.fullDescription.length} characters`);
      
      // Use provided subtitle if available, otherwise use the extracted description
      const subtitle = entry.subtitle || videoInfo.fullDescription;
      
      // Create JSON object
      const jsonData = {
        id: videoId,
        title: videoInfo.title,
        description: videoInfo.description,
        level: entry.level,
        category: entry.category,
        duration: videoInfo.duration,
        youtubeId: videoId,
        series: entry.series,
        subtitle: subtitle
      };
      
      // Add to the array
      allJsonData.push(jsonData);
      console.log(`  Added to JSON array.\n`);
    }
    
    // Sort the videos based on the sortBy parameter
    const sortedJsonData = sortVideos(allJsonData, sortBy);
    console.log(`Videos sorted by: ${sortBy}`);
    
    // Replace listening.js with all the processed data
    console.log(`Replacing listening.js with ${sortedJsonData.length} entries...`);
    await replaceListeningJs(sortedJsonData);
    console.log(`Done! listening.js has been updated with ${sortedJsonData.length} entries.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    rl.close();
  }
}

// Run the main function
main();
