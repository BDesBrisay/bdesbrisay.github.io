#!/bin/bash

# Check if the correct number of arguments are provided
if [ "$#" -ne 3 ]; then
    echo "Usage: $0 input_video target_duration output_video"
    exit 1
fi

# Assign input arguments to variables
input_video=$1
target_duration=$2
output_video=$3

# Example usage: ./timelapse.sh input.mp4 60 output.mp4

# Get the original duration of the video in seconds
original_duration=$(ffmpeg -i "$input_video" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//)
hours=$(echo $original_duration | cut -d ':' -f 1)
minutes=$(echo $original_duration | cut -d ':' -f 2)
seconds=$(echo $original_duration | cut -d ':' -f 3)
original_duration_in_seconds=$(echo "$hours*3600 + $minutes*60 + $seconds" | bc)

# Calculate the speed factor
speed_factor=$(echo "$target_duration / $original_duration_in_seconds" | bc -l)

echo "Original duration in seconds: $original_duration_in_seconds"
echo "Speed factor: $speed_factor"

# Use ffmpeg to make the video the target duration
ffmpeg -i "$input_video" -filter:v "setpts=${speed_factor}*PTS" -an "$output_video"

echo "Video has been sped up and saved to $output_video"
