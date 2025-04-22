# YouTube to JSON Converter Tool

This tool helps you convert YouTube videos to JSON format for use in the English Study Website.

## Batch YouTube to JSON Converter

A powerful script that processes multiple YouTube videos from a JSON file and completely replaces the content of the listening.js file.

### Usage:

```bash
./youtube-batch-converter.sh [input-file.json]
```

If no input file is specified, the script will use the default `videos.json` file in the same directory.

### Input File Format:

The input file uses a JSON array of groups, where each group can have its own settings:

```json
[
  {
    "urls": [
      "https://www.youtube.com/watch?v=VIDEO_ID1",
      "https://www.youtube.com/watch?v=VIDEO_ID2"
    ],
    "level": "Beginner",           // Default level for this group
    "category": "Listening",       // Default category for this group
    "series": "Mr. Duncan's English", // Default series for this group
    "sortBy": "title",             // Sort videos by: "title", "level", "duration", "series"
    "overrides": {                 // Optional: override specific properties for individual videos
      "VIDEO_ID1": {
        "level": "Elementary",
        "subtitle": "Custom subtitle text"
      }
    }
  },
  {
    "urls": [
      "https://www.youtube.com/watch?v=VIDEO_ID3"
    ],
    "level": "Intermediate",
    "category": "Listening",
    "series": "BBC Learning English",
    "sortBy": "title"
  }
]
```

### Features:

- Process multiple videos in one go
- Support for multiple groups with different settings
- Completely replaces the listening.js file with new content
- Uses advanced techniques to extract the full description from YouTube
- Allows you to provide default parameters for each group
- Supports overriding parameters for specific videos
- Organizes videos by series in the output
- Sorts videos by title, level, duration, or series

### Output Format:

The script generates a listening.js file with videos organized by series:

```javascript
const listeningVideos = [
    {
        "series": "Mr. Duncan's English",
        "videos": [
            {
                "id": "FWI9GEwJNzc",
                "title": "Learn English Lesson 1 - How do I learn English?",
                // other video properties...
            },
            {
                "id": "wJvJBcS3RmY",
                "title": "Learn English LESSON 2 / Saying 'hello' and 'goodbye'",
                // other video properties...
            }
        ]
    },
    {
        "series": "BBC Learning English",
        "videos": [
            {
                "id": "WDrCAf_4Qao",
                "title": "Learn English LESSON 3 / Saying 'PLEASE' and 'THANK YOU'",
                // other video properties...
            }
        ]
    }
];
```

This format makes it easy to display videos grouped by series in your UI.

### Sorting Options:

You can specify how videos should be sorted using the `sortBy` parameter:

- `title`: Sort alphabetically by title (default)
- `level`: Sort by difficulty level, then by title
- `duration`: Sort by video length, then by title
- `series`: Sort by series name, then by title

### Important Note About Subtitles:

Due to YouTube's limitations, automatically extracted descriptions may not always be complete. For best results:

1. Check the extracted subtitle text after running the script
2. If the subtitle is incomplete, add it to the overrides section in videos.json:

```json
"overrides": {
  "VIDEO_ID": {
    "subtitle": "Your complete subtitle text here...\nWith line breaks as needed."
  }
}
```

## Example:

See `videos-example.json` for an example of how to structure your input file.

## Tips:

1. To update your videos, simply edit the videos.json file and run the script
2. The converter will completely replace the listening.js file, so make sure your videos.json file contains all videos you want to include
3. If automatic description extraction is incomplete, provide your own subtitle text in the overrides section
4. Use the sorting features to organize your videos in a logical way
5. You can create as many groups as you need, each with its own settings
