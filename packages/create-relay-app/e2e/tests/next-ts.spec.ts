import { test, expect } from "@playwright/test";
import { ChildProcess } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { fireCmd, runCmd } from "./helpers";

const TARGET_DIR = "./next-ts";
const PORT = 4005;

let webServerProcess: ChildProcess;

test.beforeAll(async () => {
  test.setTimeout(180000);

  if (!existsSync(TARGET_DIR)) {
    await runCmd(`yarn create next-app ${TARGET_DIR} --typescript --eslint`);
  }

  await runCmd(
    `node ../../dist/bin.js --ignore-git-changes --package-manager yarn`,
    { cwd: TARGET_DIR }
  );

  copyFileSync("./assets/next/test.tsx", TARGET_DIR + "/pages/test.tsx");

  await runCmd(`yarn --cwd ${TARGET_DIR} run relay`);

  await runCmd(`yarn --cwd ${TARGET_DIR} run build`);

  webServerProcess = fireCmd(`yarn start -- -p ${PORT}`, {
    cwd: TARGET_DIR,
    stdio: "inherit",
  });

  // Give the server some time to come up
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

test("Execute NEXT/TS graphql request", async ({ page }) => {
  await page.route("**/graphql", async (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { field: "next-ts text" } }),
    });
  });

  await page.goto("http://localhost:" + PORT + "/test", {
    waitUntil: "networkidle",
  });

  const innerText = await page.locator("#test-data").innerText();

  await expect(innerText).toEqual("next-ts text");
});

test.afterAll(() => {
  webServerProcess?.kill();

  // if (existsSync(scaffoldDir)) {
  //   fs.rm(scaffoldDir, { recursive: true });
  // }
});
