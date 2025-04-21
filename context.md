# English Study Website - Project Context

## Project Overview
This is a comprehensive web application for studying English words and their pronunciations, inspired by the Oxford Learner's Dictionary. The application provides various tools for searching, comparing, and practicing English words with a focus on phonetics.

## Key Features
1. **Word Search**: Search for English words and see their definitions, types, and pronunciation
2. **Phonetic Search**: Search for words containing specific phonetic sounds
3. **Multi-Phonetic Search**: Search for words containing multiple phonetic sounds with AND/OR logic
4. **Sound Comparison**: Compare two phonetic sounds and find words with similar phonetic structures
5. **Speech Practice**: Record and play back your pronunciation (with speech recognition in Chrome)
6. **Save for Later**: Save words to a personal list for future reference, with export functionality
7. **Games Section**: Multiple interactive games for pronunciation practice:
   - Sound Matching Game
   - Minimal Pairs Challenge
   - Sound Position Puzzle
   - Phonetic Hangman
   - Sound Sorting Game
8. **Special Phonetic Handling**: Properly handles special cases for combined sounds like "tʃ" and "dʒ"
9. **Pagination**: Implemented for search results to handle large result sets
10. **Keyboard Shortcuts**: Extensive keyboard shortcuts for efficient navigation and gameplay

## Technical Implementation
- **Frontend**: HTML, CSS, and vanilla JavaScript (no frameworks)
- **Database**: Uses an online JSON file from GitHub repository (Oxford-5000-words)
- **Responsive Design**: Works on desktop, tablets, and mobile devices
- **Modular Code Structure**:
  - Core modules: DOM elements, app initialization, pagination
  - Feature modules: Word search, phonetic search, multi-phonetic search, sound comparison
  - Games modules: Various interactive pronunciation games
- **CSS**: Separate stylesheets for main styles, games, mobile optimization, and feature-specific styles

## Project Structure
- `index.html`: Main entry point with UI structure
- `styles.css`: Main stylesheet
- `script.js`: Main JavaScript file
- `/js/core/`: Core functionality modules (app.js, dom-elements.js, pagination.js)
- `/js/features/`: Feature-specific modules (word-search.js, phonetic-search.js, etc.)
- `/js/games/`: Game-related modules (games-manager.js, sound-matching-game.js, etc.)
- `/css/`: Additional stylesheets (games.css, mobile.css, speech-recognition.css, etc.)

## Recent Additions
- **Save for Later**: Functionality to save words to local storage with export to CSV
- **Keyboard Shortcuts**: Comprehensive keyboard navigation for games and main features
- **Mobile Optimization**: Enhanced mobile experience with dedicated stylesheets
- **Online Database**: Using GitHub repository for word data instead of local file

## Browser Compatibility
- **Chrome**: Full functionality including speech recognition
- **Safari, Firefox, Edge**: All features except speech-to-text recognition
- All browsers support recording and playback of speech

## Future Development
- Add more phonetic sounds to the quick-access buttons
- Implement filtering options (by word type, level, etc.)
- Expand the games section with more interactive exercises
- Add user accounts to save progress across devices
