/**
 * Get route data by logging into google/mymaps and exporting the route as a KML file using playwright
 * 
 * Steps:
 * 1. login to google/mymaps
 * 2. enter route by clicking add destination
 * 3. export route as KML
 */

const playwright = require('playwright');

const EMAIL = 'campervanvoyage@gmail.com'
const PASSWORD = 'TESTING'

const DIRECTIONS = [
  'North Eagle Lake Campground, Susanville, CA',
  'Walmart Supercenter Washburn Way, Klamath Falls, OR',
  'Overland Expo Pacific Northwest'
]

const sleep = ms => new Promise(res => setTimeout(res, ms));

// Step 1: Login to Google MyMaps
async function loginToGoogle(page) {

  console.log('Logging into Google MyMaps')
  
  await page.goto('https://www.google.com/maps/d/u/0/');

  // wait 3 seconds for the page to load
  await sleep(3000);

  // Enter email
  await page.locator('input[type="email"]').fill(EMAIL);

  // Click next
  await page.locator('div[id="identifierNext"]').click();

  await sleep(3000);

  // // this goes to a screen that asks to try again
  // await page.waitForSelector('div[id="next"]');
  // await page.click('div[id="next"]')

  // await sleep(3000);

  // // enter email again
  // await page.waitForSelector('input[type="email"]');
  // await page.type('input[type="email"]', EMAIL, { delay: 100 });

  // await sleep(3000);

  // await page.waitForSelector('div[id="identifierNext"]');
  // await page.click('div[id="identifierNext"]')

  // await sleep(3000);

  // // enter password
  // await page.waitForSelector('input[type="password"]');
  // await page.type('input[type="password"]', PASSWORD, { delay: 100 });


  await sleep(6000);

  // await page.click('#passwordNext')

  // await page.waitForNavigation();

  console.log('Logged into Google MyMaps')
}

// Step 2: Enter Route
async function enterRoute(page) {
  
  console.log('Entering route')

  // await page.waitForSelector('input[aria-label="Search Google Maps"]');
  // await page.click('input[aria-label="Search Google Maps"]')

  // for (const direction of DIRECTIONS) {

  //   console.log(`Entering direction: ${direction}`)

  //   // click "Add destination"
  //   await page.waitForSelector('button[aria-label="Add destination"]');
  //   await page.click('button[aria-label="Add destination"]')

  //   await page.waitForSelector('input[aria-label="Search Google Maps"]');

  //   await page.type('input[aria-label="Search Google Maps"]', direction, { delay: 100 });
  //   await page.keyboard.press('Enter');
  //   await page.waitForTimeout(2000);
  // }

  console.log('Route entered')
}

// Step 3: Export Route as KML
async function exportRoute(page) {

  console.log('Exporting route as KML')

  // await page.waitForSelector('button[aria-label="Export to KML"]');
  // await page.click('button[aria-label="Export to KML"]')

  // await page.waitForSelector('button[aria-label="Export"]');
  // await page.click('button[aria-label="Export"]')

  console.log('Route exported as KML')
}

// Main function
async function main() {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Run them all!
  await loginToGoogle(page)
  await enterRoute(page)
  await exportRoute(page)

  await browser.close();
}

main();