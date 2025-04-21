# English Study Website - Project Context

## Project Overview
This is a comprehensive web application for studying English words and their pronunciations, inspired by the Oxford Learner's Dictionary. The application provides various tools for searching, comparing, and practicing English words with a focus on phonetics.

## Key Features
1. **Word Search**: Search for English words and see their definitions, types, and pronunciation
2. **Phonetic Search**: Search for words containing specific phonetic sounds
3. **Multi-Phonetic Search**: Search for words containing multiple phonetic sounds with AND/OR logic
4. **Sound Comparison**: Compare two phonetic sounds and find words with similar phonetic structures
5. **Speech Practice**: Simplified and compact speech recording and playback interface (with speech recognition in Chrome)
6. **Save for Later**: Save words to a personal list for future reference, with export functionality
7. **Games Section**: Multiple interactive games for pronunciation practice with improved layout:
   - Sound Matching Game
   - Minimal Pairs Challenge
   - Sound Position Puzzle
   - Phonetic Hangman
   - Sound Sorting Game
8. **Special Phonetic Handling**: Properly handles special cases for combined sounds like "tʃ" and "dʒ"
9. **Pagination**: Implemented for search results to handle large result sets
10. **Keyboard Shortcuts**: Extensive keyboard shortcuts for efficient navigation and gameplay
11. **Theme Switching**: Support for light and dark themes

## Technical Implementation
- **Frontend**: HTML, CSS, and vanilla JavaScript (no frameworks)
- **Database**: Uses an online JSON file from GitHub repository (Oxford-5000-words)
- **Responsive Design**: Works on desktop, tablets, and mobile devices
- **Modular Code Structure**:
  - Core modules: DOM elements, app initialization, pagination
  - Feature modules: Word search, phonetic search, multi-phonetic search, sound comparison
  - Games modules: Various interactive pronunciation games
- **CSS**: Modular stylesheets for main styles, games, mobile optimization, and feature-specific styles

## Project Structure
- `index.html`: Main entry point with UI structure
- `styles.css`: Main stylesheet
- `script.js`: Main JavaScript file
- `/js/core/`: Core functionality modules (app.js, dom-elements.js, pagination.js)
- `/js/features/`: Feature-specific modules (word-search.js, phonetic-search.js, etc.)
- `/js/games/`: Game-related modules (games-manager.js, sound-matching-game.js, etc.)
- `/css/`: Multiple specialized stylesheets:
  - `simplified-speech-practice.css`: Compact speech practice interface
  - `fix-games-layout.css`: Improved games section layout
  - `theme-switcher.css`: Theme switching functionality
  - `mobile.css`: Mobile-specific styles
  - `animations.css`: UI animations
  - And many other feature-specific stylesheets

## Recent Improvements
- **Simplified Speech Practice**: Reduced size and complexity of the speech practice component
- **Improved Games Layout**: Fixed layout issues in the games section for better responsiveness
- **Theme Support**: Enhanced dark theme support across all components
- **Mobile Optimization**: Better layout and usability on small screens
- **Performance Optimizations**: Improved loading times and UI responsiveness
- **Bug Fixes**: Fixed various layout and functionality issues

## Browser Compatibility
- **Chrome**: Full functionality including speech recognition
- **Safari, Firefox, Edge**: All features except speech-to-text recognition
- All browsers support recording and playback of speech

## Future Development
- Add more phonetic sounds to the quick-access buttons
- Implement filtering options (by word type, level, etc.)
- Expand the games section with more interactive exercises
- Add user accounts to save progress across devices
- Improve accessibility features
- Add offline support with service workers
