import { test, expect } from "@playwright/test";
import { ChildProcess } from "child_process";
import { copyFileSync, existsSync } from "fs";
import { fireCmd, runCmd } from "./helpers";

const TARGET_DIR = "./next-js";
const PORT = 4004;

let webServerProcess: ChildProcess;

test.beforeAll(async () => {
  test.setTimeout(180000);

  if (!existsSync(TARGET_DIR)) {
    await runCmd(`yarn create next-app ${TARGET_DIR} --javascript --eslint`);
  }

  await runCmd(
    `node ../../dist/bin.js --ignore-git-changes --package-manager yarn`,
    { cwd: TARGET_DIR }
  );

  copyFileSync("./assets/next/test.js", TARGET_DIR + "/pages/test.js");

  await runCmd(`yarn --cwd ${TARGET_DIR} run relay`);

  await runCmd(`yarn --cwd ${TARGET_DIR} run build`);

  webServerProcess = fireCmd(`yarn start -- -p ${PORT}`, {
    cwd: TARGET_DIR,
    stdio: "inherit",
  });

  // Give the server some time to come up
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

test("Execute NEXT/JS graphql request", async ({ page }) => {
  await page.route("**/graphql", async (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { field: "next-js text" } }),
    });
  });

  await page.goto("http://localhost:" + PORT + "/test", {
    waitUntil: "networkidle",
  });

  const innerText = await page.locator("#test-data").innerText();

  await expect(innerText).toEqual("next-js text");
});

test.afterAll(() => {
  const killed = webServerProcess?.kill();

  if (!killed) {
    console.log("failed to kill dev server");
  }

  // if (existsSync(scaffoldDir)) {
  //   fs.rm(scaffoldDir, { recursive: true });
  // }
});
