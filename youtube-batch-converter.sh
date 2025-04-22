#!/bin/bash

# YouTube Batch Converter Script
# This script runs the batch-youtube-converter.js tool

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Run the converter with the provided input file or default to videos.json
node "$SCRIPT_DIR/tools/batch-youtube-converter.js" "$@"
