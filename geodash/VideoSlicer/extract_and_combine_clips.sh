#!/bin/bash

# Function to convert seconds to HH:MM:SS.sss format
seconds_to_time() {
    local T=$1
    local H=$(echo "$T/3600" | bc)
    local M=$(echo "($T%3600)/60" | bc)
    local S=$(echo "$T % 60" | bc)
    printf "%02d:%02d:%06.3f" $H $M $S
}

# Variables
# input_video="../../../Movies/VanCam/OverlandExpo/EagleLakeFront-full.mp4"  # Replace with your input video file
# # 5.74 Hours = X Seconds
# video_length=20640  # Length of the video in seconds (5.74 hours)
# clip_duration="0.5"  # duration of each clip in seconds
# num_clips=120  # number of clips to generate

### File Input Variables
# input_video - The path to the input video file
# video_length - The length of the input video in seconds
# clip_duration - The duration of each clip in seconds
# num_clips - The number of clips to generate
#
# Example usage:
# ./extract_and_combine_clips.sh input_video.mp4 20640 1 60

# CLI inline input Variables with default values
input_video=$1 || "../../../Movies/VanCam/OverlandExpo/EagleLakeFront-full.mp4"
video_length=$2 || 20640 # 5.74 Hours = X Seconds
clip_duration=$3 || 1 # Seconds
num_clips=$4 || 60 

# Convert video length and clip duration to seconds
total_seconds=$(echo "$video_length" | bc)
clip_duration_seconds=$(echo "$clip_duration" | bc)

# Calculate the interval between the start of each clip
interval=$(echo "scale=3; $total_seconds / $num_clips" | bc)

mkdir -p temp

# Generate timestamps and extract clips
for (( i=1; i<=num_clips; i++ )); do
    start_time=$(echo "scale=3; ($i - 1) * $interval" | bc)
    end_time=$(echo "scale=3; $start_time + $clip_duration_seconds" | bc)
    
    # Ensure the end_time does not exceed total_seconds
    if (( $(echo "$end_time > $total_seconds" | bc -l) )); then
        end_time=$total_seconds
    fi
    
    start_time_formatted=$(seconds_to_time $start_time)
    end_time_formatted=$(seconds_to_time $end_time)
    
    echo "Extracting clip from $start_time_formatted to $end_time_formatted"
    
    output_clip=$(printf "temp/clip_%03d.mp4" $i)
    ffmpeg -ss "$start_time_formatted" -to "$end_time_formatted" -i "$input_video" -c copy "$output_clip"
done

# Combine clips
output_file="output_video.mp4"
ffmpeg -f concat -safe 0 -i <(for f in temp/*.mp4; do echo "file '$PWD/$f'"; done) -c copy "$output_file"

# delete temp
rm -rf temp
