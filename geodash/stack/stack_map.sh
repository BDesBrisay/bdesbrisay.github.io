#!/bin/bash

### Script to combine and stack two videos on top of each other, centered, and also synchronized so each video is sped or slowed down to be exactly 1 minute long
# First video: 1920x1080 (top)
# Second video: 881x992 (bottom)

echo "Stacking videos..."

# start timer for whole process
start=$(date +%s)

# Variables
top_video="../VideoSlicer/output_video.mp4"
bottom_video="./map-movie-3.mov"
output_file="stacked_video.mp4"

# Get the duration of the top video
top_duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$top_video")
# Get the duration of the bottom video
bottom_duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$bottom_video")

# Create a temporary directory
mkdir -p temp

echo "Top video duration: $top_duration"
echo "Bottom video duration: $bottom_duration"

# Set the target duration to 1 minute (60 seconds)
target_duration=60

# Calculate the speed factors
top_speed_factor=$(echo "$target_duration / $top_duration" | bc -l)
bottom_speed_factor=$(echo "$target_duration / $bottom_duration" | bc -l)

echo "SPEED factors: top=$top_speed_factor, bottom=$bottom_speed_factor"

echo "Speeding up or slowing down the TOP videos..."

# Adjust the speed of the top video
ffmpeg -i "$top_video" -filter:v "setpts=${top_speed_factor}*PTS" -an temp/top_speed_adjusted.mp4

echo "Speeding up or slowing down the BOTTOM video..."
echo "TIMER for the whole process: $(( $(date +%s) - $start )) seconds"

# Adjust the speed of the bottom video
ffmpeg -i "$bottom_video" -filter:v "setpts=${bottom_speed_factor}*PTS" -an temp/bottom_speed_adjusted.mp4

echo "Resizing the BOTTOM video..."

# Resize and pad the top video to 1920x1080
ffmpeg -i temp/top_speed_adjusted.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" temp/top_resized.mp4

# Resize and pad the bottom video to 1920x1080 with black bars
ffmpeg -i temp/bottom_speed_adjusted.mp4 -vf "scale=-1:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" temp/bottom_resized.mp4

echo "TIMER for the whole process: $(( $(date +%s) - $start )) seconds"

echo "Combining videos..."

# Stack the videos on top of each other
ffmpeg -i temp/top_resized.mp4 -i temp/bottom_resized.mp4 -filter_complex "[0:v][1:v]vstack=inputs=2" -c:v libx264 -crf 23 -preset veryfast "$output_file"

echo "Cleaning up..."

# Remove temporary files
rm -rf temp

echo "Done! Output file: $output_file"
echo "Total time taken: $(( $(date +%s) - $start )) seconds"
