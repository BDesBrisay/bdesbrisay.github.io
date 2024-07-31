#!/bin/bash

### Convert WebM to MP4
# This script converts a WebM video file to MP4 format using ffmpeg.
# Usage: ./convertWebmToMp4.sh inputfile.webm

# Check if the input file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 inputfile.webm"
  exit 1
fi

# Get the input file name
INPUT_FILE="$1"

# Get the current timestamp
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Define the output file name
OUTPUT_FILE="map_mp4_${TIMESTAMP}.mp4"

# Convert WebM to MP4
ffmpeg -i "$INPUT_FILE" -c:v libx264 -c:a aac "$OUTPUT_FILE"

# Check if the conversion was successful
if [ $? -eq 0 ]; then
  echo "Conversion successful: $OUTPUT_FILE"
else
  echo "Conversion failed"
  exit 1
fi
