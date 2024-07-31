#!/bin/bash

### Record Map Animation
# 1. run web server to serve the map animation page (node server.js)
# 2. open the page in browser (http://localhost:3000)
# 3. record the animation over 2 minutes
# 4. save the animation as a video

echo "Recording map animation..."

# 1. run web server to serve the map animation page
node server.js &

echo "Web server running..."

# 2. open the page in browser
open http://localhost:3000/

echo "Opening the map animation page..."

# Wait a few seconds to ensure the server is running and the page is loaded
sleep 5

# 3. record the animation over 2 minutes
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
duration=60
output_file="map-movie-$DATE.mov"

# Determine the screen size (you can adjust this if needed)
screen_size=$(ffmpeg -f avfoundation -list_devices true -i "" 2>&1 | grep -oE '[0-9]{4}x[0-9]{3,4}')

# Use ffmpeg to record the screen with a supported pixel format
# ffmpeg -f avfoundation -framerate 30 -t $duration -pixel_format uyvy422 -i "1" -s $screen_size -c:v libx264 -pix_fmt uyvy422 $output_file
ffmpeg -f avfoundation -framerate 30 -t $duration -pix_fmt uyvy422 -i "1" -s 1920x1080 -c:v libx264 -preset ultrafast -pix_fmt yuv420p $output_file

echo "Recording complete. Saved as $output_file"

# Stop server
killall node