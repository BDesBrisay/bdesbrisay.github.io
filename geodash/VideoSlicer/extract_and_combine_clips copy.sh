#!/bin/bash

# Variables
input_file="../../Movies/VanCam/OverlandExpo/PinecrestFront-Trimmed.mp4"  # Replace with your input video file
output_file="output_video.mp4"  # Output file name
num_clips=5  # Number of clips
video_length=14400  # Length of the video in seconds (4 hours)
clip_length=3  # Length of each clip in seconds

# Calculate the interval between each clip's start time
interval=$(( (video_length - num_clips * clip_length) / (num_clips - 1) ))

# Create a temporary directory
temp_dir="temp"
mkdir -p "$temp_dir"

# Extract clips
for i in $(seq -w 0 $((num_clips - 1))); do
  start_time=$((10#$i * interval))
  ffmpeg -y -ss $start_time -t $clip_length -i "$input_file"  -analyzeduration 2147483647 -probesize 2147483647 -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k "$temp_dir/clip_$i.mp4"
done

# Create a file list for concatenation
concat_file="$temp_dir/concat_list.txt"
touch "$concat_file"
chmod 777 "$concat_file"

for f in $temp_dir/clip_*.mp4; do
  echo "file '$PWD/$f'" >> "$concat_file"
done

# Combine clips
ffmpeg -f concat -safe 0 -i "$concat_file" -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k "$output_file"

# Cleanup
rm -r "$temp_dir"