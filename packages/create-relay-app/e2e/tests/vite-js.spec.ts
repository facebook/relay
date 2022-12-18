import { test, expect } from "@playwright/test";
import { ChildProcess, exec } from "child_process";
import { copyFileSync, existsSync } from "fs";
import {
  fireCmd,
  insertTestComponentBelowRelayProvider,
  runCmd,
} from "./helpers";

const TARGET_DIR = "./vite-js";
const PORT = 4002;
let webServerProcess: ChildProcess;

test.beforeAll(async () => {
  test.setTimeout(180000);

  if (!existsSync(TARGET_DIR)) {
    await runCmd(`yarn create vite vite-js --template react`);
  }

  await runCmd(
    `node ../../dist/bin.js --ignore-git-changes --package-manager yarn`,
    {
      cwd: TARGET_DIR,
    }
  );

  copyFileSync(
    "./assets/vite/TestComponent.jsx",
    TARGET_DIR + "/src/TestComponent.jsx"
  );

  const indexPath = TARGET_DIR + "/src/main.jsx";
  await insertTestComponentBelowRelayProvider(indexPath, "TestComponent");

  await runCmd(`yarn --cwd ${TARGET_DIR} run relay`);

  await runCmd(`yarn --cwd ${TARGET_DIR} run build`);

  webServerProcess = fireCmd(
    `yarn --cwd ${TARGET_DIR} run preview -- --port ${PORT}`,
    { stdio: "inherit" }
  );

  // Give the server some time to come up
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

test("Execute Vite/JS graphql request", async ({ page }) => {
  await page.route("**/graphql", async (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { field: "vite-js text" } }),
    });
  });

  await page.goto("http://localhost:" + PORT, { waitUntil: "networkidle" });

  const innerText = await page.locator("#test-data").innerText();

  await expect(innerText).toEqual("vite-js text");
});

test.afterAll(() => {
  webServerProcess?.kill();

  // if (existsSync(scaffoldDir)) {
  //   fs.rm(scaffoldDir, { recursive: true });
  // }
});
