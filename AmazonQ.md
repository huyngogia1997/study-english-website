# English Study Website - Project Context

## Project Overview
This is a comprehensive web application for studying English words and their pronunciations, inspired by the Oxford Learner's Dictionary.

## Key Features
1. **Word Search**: Search for English words and see their definitions, types, and pronunciation
2. **Phonetic Search**: Search for words containing specific phonetic sounds
3. **Multi-Phonetic Search**: Search for words containing multiple phonetic sounds with AND/OR logic
4. **Sound Comparison**: Compare two phonetic sounds and find words with similar phonetic structures
5. **Games Section**: Multiple interactive games for pronunciation practice:
   - Sound Matching Game
   - Minimal Pairs Challenge
   - Sound Position Puzzle
   - Phonetic Hangman
   - Sound Sorting
6. **Special Phonetic Handling**: Properly handles special cases for combined sounds like "tʃ" and "dʒ"
7. **Pagination**: Implemented for search results

## Technical Implementation
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **Database**: Now sourced from a website rather than local files
- **Responsive Design**: Works on both desktop and mobile devices
- **Modular Code Structure**:
  - Core modules: DOM elements, app initialization, pagination
  - Feature modules: Word search, phonetic search, multi-phonetic search, sound comparison
  - Games modules: Various interactive pronunciation games
- **CSS**: Separate stylesheets for main styles and games

## Project Structure
- `index.html`: Main entry point with UI structure
- `styles.css`: Main stylesheet
- `/js/core/`: Core functionality modules
- `/js/features/`: Feature-specific modules
- `/js/games/`: Game-related modules
- `/css/`: Additional stylesheets

## Special Notes
- The database is now sourced from a website rather than using the local `words.json` file
- The project has evolved beyond what was described in the original README.md, particularly with the addition of the games section and keyboard shortcuts functionality
