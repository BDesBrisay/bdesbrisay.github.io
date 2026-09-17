import { defineConfig, devices } from "@playwright/test";

const port = process.env.E2E_PORT ?? "4173";
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./flows",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 30_000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    viewport: { width: 1280, height: 800 },
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  outputDir: "./artifacts",
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: process.env.E2E_WEB_SERVER ?? "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
