const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const express = require('express');
const Tesseract = require('tesseract.js');
const path = require('path');

// Configuration variables
const frontViewVideo = '../../Movies/VanCam/OverlandExpo/PinecrestFront.mp4';
// const rearViewVideo = 'rear_view.mp4';
const gpsDataFile = 'gps_data.json';
const framesDir = 'frames';
const mapImagesDir = 'map_images';
const outputVideo = 'output_4k.mp4';

const app = express();
const port = 3000;

// Step 1: Extract Frames from Video
async function extractFrames(videoPath, outputDir, callback) {
  exec(`mkdir -p ${outputDir}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }

    console.log('Directory created successfully');
  // })

  // exec(`ffmpeg -i ${videoPath} -vf "fps=1/5,crop=in_w*0.2:in_h*0.05:in_w*0.3:in_h*0.95" ${outputDir}/frame_%04d.png`, (err, stdout, stderr) => {

  //   if (err) {
  //     console.error(`Error: ${err.message}`);
  //     return;
  //   }

  //   console.log('Frames extracted successfully');
     
    callback();
  });
}

// Step 2: Apply OCR to Extract GPS Coordinates
async function extractGPSFromFrames(frameDir, outputPath, callback) {

  console.log('Extracting GPS data from frames')

  const files = fs.readdirSync(frameDir).filter(file => file.endsWith('.png'));
  const gpsData = [];

  console.log('Files: ', files);

  for (const file of files) {

    console.log(`Processing ${file}`);

    const framePath = path.join(frameDir, file);
    
    const { data: { text } } = await Tesseract.recognize(framePath, 'eng');
    const gpsMatch = text.match(/\bN:(\d+\.\d+)\b\s+\bW:(\d+\.\d+)/)

    console.log(`Processing ${file} - GPS: ${gpsMatch} - Text: ${text}`);

    if (gpsMatch) {
      const [_, lat, lon] = gpsMatch;

      gpsData.push({ lat: parseFloat(lat), lon: parseFloat(lon), time: parseInt(file.match(/\d+/)[0]) });
    }
  }

  console.log('GPS data extracted successfully');
  console.log(gpsData);

  fs.writeFileSync(outputPath, JSON.stringify(gpsData));
  callback();
}

// Step 3: Generate Map Images with Route
async function generateMapImages(gpsDataPath, callback) {

  console.log('Generating map images');

  const gpsData = JSON.parse(fs.readFileSync(gpsDataPath));

  console.log('Loaded GPS data');

  const browser = await puppeteer.launch({headless: false});

  console.log('Browser launched');

  const page = await browser.newPage();


  (async () => {
    try {
      // const browser = await puppeteer.launch({ headless: false, timeout: 60000 });
      // const page = await browser.newPage();

      await page.goto('https://example.com')


      console.log('Browser launched');

      // Load a basic HTML template with Leaflet for the map
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
          <style>
            #map { width: 1280px; height: 720px; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
          <script>
            const map = L.map('map').setView([51.505, -0.09], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
            }).addTo(map);
            
            const route = ${JSON.stringify(gpsData)};
            const polyline = L.polyline([], { color: 'blue' }).addTo(map);

            route.forEach((point, index) => {
              setTimeout(() => {
                polyline.addLatLng([point.lat, point.lon]);
                map.setView([point.lat, point.lon], 13);
              }, index * 1000);
            });
          </script>
        </body>
        </html>
      `;

      fs.writeFileSync('map_template.html', htmlTemplate);

      for (let i = 0; i < gpsData.length; i++) {
        const { lat, lon } = gpsData[i];
        console.log(`Processing GPS data: ${lat}, ${lon}`);
        const url = `file://${path.join(__dirname, 'map_template.html')}`;
        await page.goto(url);
        await page.waitForTimeout(1000 * (i + 1)); // Simulate moving along the path
        await page.screenshot({ path: `${mapImagesDir}/map_${i}.png` });
        console.log(`Map image ${i} generated`)
      }


      await browser.close();

      console.log('Map images generated successfully');

      callback();

    } catch (error) {
      console.error('Error: ', error);
    }
  })();
}

// Step 4: Combine Videos and Map into a 4K Video
function create4KVideo(frontView, rearView, output, callback) {
  exec(`
    ffmpeg -i ${frontView} -i ${rearView} -framerate 1 -i ${mapImagesDir}/map_%d.png -filter_complex "
      [0:v]scale=3840x2160[front];
      [1:v]scale=1280x720[rear];
      [2:v]scale=1280x720[map];
      [front][map]overlay=W-w-10:10[front+map];
      [front+map][rear]overlay=W-w-10:H-h-10
    " -c:v libx264 -crf 18 -preset veryslow -tune film -r 30 ${output}
  `, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${err.message}`);
      return;
    }
    console.log('4K video created successfully');
    callback();
  });
}

// Express Server to Serve the Final Video
app.use(express.static('public'));

app.get('/gps-data', (req, res) => {
  extractGPSFromFrames(framesDir, gpsDataFile, (err, gpsData) => {
    if (err) return res.sxtatus(500).send(err);
    res.json(gpsData);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);

  // Run the steps in sequence
  extractFrames(frontViewVideo, framesDir, () => {
    console.log('Frames extracted from front view video');
    extractGPSFromFrames(framesDir, gpsDataFile, () => {
      console.log('GPS data extracted from frames');
      generateMapImages(gpsDataFile, () => {
        console.log('Map images generated');
        create4KVideo(frontViewVideo, rearViewVideo, outputVideo, () => {
          console.log('Process completed');
        });
      });
    });
  });
});
