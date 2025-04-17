# English Study Website

A comprehensive web application for studying English words and their pronunciations, inspired by the Oxford Learner's Dictionary.

## Features

- **Word Search**: Search for English words and see their definitions, types, and pronunciation
- **Phonetic Search**: Search for words containing specific phonetic sounds
- **Multi-Phonetic Search**: Search for words containing multiple phonetic sounds simultaneously with AND/OR logic
- **Sound Comparison**: Compare two phonetic sounds and find words with similar phonetic structures
- **Speech Practice**: Record and play back your pronunciation (speech recognition available in Chrome)
- **Games Section**: Interactive games for pronunciation practice
- **Special Phonetic Handling**: Properly handles special cases for combined sounds like "tʃ" and "dʒ"
- **Audio Playback**: Listen to UK and US pronunciations of words
- **Oxford Dictionary Integration**: Links to the Oxford Learner's Dictionary for more detailed information

## Technical Details

- **Database**: Uses an online JSON file from GitHub repository (Oxford-5000-words)
- **Frontend**: Built with HTML, CSS, and vanilla JavaScript
- **Responsive Design**: Works on desktop, tablets, and mobile devices
- **Modular Code Structure**: Organized into core, features, and games modules

## How to Use

1. **Word Search**:
   - Enter a word in the search box and click "Search" or press Enter
   - View the word's details including type, level, and pronunciation
   - Click on the audio buttons to hear the pronunciation

2. **Phonetic Search**:
   - Click on the "Phonetic Search" tab
   - Enter a phonetic sound (e.g., "æ") or click on one of the phonetic buttons
   - View all words containing that sound in their pronunciation

3. **Multi-Phonetic Search**:
   - Click on the "Multi-Phonetic Search" tab
   - Select multiple phonetic sounds using the checkboxes
   - Choose search mode:
     - "AND" - find words containing ALL selected sounds
     - "OR" - find words containing ANY of the selected sounds
   - Click "Search Selected Sounds" to perform the search
   - Use "Clear Selection" to reset your choices

4. **Sound Comparison**:
   - Click on the "Sound Comparison" tab
   - Select two different phonetic sounds from the dropdown menus
   - Click "Compare Sounds" to find words with similar phonetic structures
   - Use the position buttons (First, Middle, Last) to switch between position categories
   - Words are matched based on where the sounds appear in the word

5. **Speech Practice**:
   - Click on the "Record" button or press and hold the SPACE key
   - Speak the word you want to practice
   - Release the button or SPACE key to stop recording
   - Your recording will automatically play back
   - **Chrome Only**: The recognized word will be displayed and if found in the dictionary, its pronunciation will play for comparison
   - **Other Browsers**: Record and play back your speech without word recognition
   - Click "Replay" to hear your recording again

6. **Games Section**:
   - Choose from various interactive games:
     - Sound Matching Game
     - Minimal Pairs Challenge
     - Sound Position Puzzle
     - Phonetic Hangman
     - Sound Sorting

## Special Phonetic Search Handling

When searching for individual sounds like "t", "ʃ", "d", or "ʒ", the search will not include words with combined sounds like "tʃ" and "dʒ" because the pronunciation of these combined sounds differs from their individual components.

## Mobile and Tablet Support

- Responsive design that adapts to different screen sizes
- Touch-friendly interface with appropriately sized buttons
- Special optimizations for iPad and tablet devices
- Support for both portrait and landscape orientations
- Cross-browser compatibility including Safari

## Browser Compatibility

- **Chrome**: Full functionality including speech recognition
- **Safari, Firefox, Edge, etc.**: All features except speech-to-text recognition
- All browsers support recording and playback of speech

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. Internet connection is required to access the online word database

## Future Improvements

- Add more phonetic sounds to the quick-access buttons
- Implement filtering options (by word type, level, etc.)
- Add a favorites/bookmarks feature
- Expand the games section with more interactive exercises
- Add user accounts to save progress

## Credits

- Word data sourced from Oxford Learner's Dictionary
- Audio files linked from Oxford Learner's Dictionary
