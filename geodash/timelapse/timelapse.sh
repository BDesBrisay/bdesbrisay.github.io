#!/bin/bash

SECONDS=0

# Usage check
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 input_video target_duration_in_seconds"
    exit 1
fi

input_video="$1"
target_duration="$2"

# Generate output filename
filename=$(basename -- "$input_video")
extension="${filename##*.}"
filename_without_extension="${filename%.*}"
output_video="${filename_without_extension}_timelapse.${extension}"

# Get original video duration in seconds
duration_str=$(ffmpeg -i "$input_video" 2>&1 | grep "Duration" | cut -d ' ' -f 4 | sed s/,//)
IFS=: read hours minutes seconds <<< "$duration_str"
original_duration=$(echo "$hours*3600 + $minutes*60 + $seconds" | bc -l)

# Calculate speed factor
speed_factor=$(echo "$original_duration / $target_duration" | bc -l)
decimate=$(printf "%.0f" "$speed_factor")

# Set frame sample rate and output FPS
sample_rate=2 # grab 1 frame per second

echo "Original duration: $original_duration seconds"
echo "Target duration: $target_duration seconds"
echo "Speed factor: $speed_factor"
echo "Sampling $sample_rate frame per second"

# Run ffmpeg
ffmpeg -i "$input_video" \
  -vf "framestep=${decimate},setpts=PTS/${decimate}" \
  -c:v libx264 -preset veryfast \
  -an "$output_video"

echo "✅ Timelapse created: $output_video"

# Print execution time
duration=$SECONDS
echo "⏱️ Processing time: $((duration / 60)) min $((duration % 60)) sec"