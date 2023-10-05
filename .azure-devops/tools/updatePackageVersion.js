/*
  Script updates dist/package.json with custom version,
  that's created from existing version and unique tag,
  i.e.:
     old: 3.6.5-microsoft.5
     new: 3.6.5-microsoft.my-branch-1689254947

  Tag is built from branch name (passed in argument) and
  seconds since the epoch.
*/
const assert = require("assert");
const fs = require('fs');
const path = require('path');

const branchName = process.argv[2];
assert.notStrictEqual(branchName ?? "", "", "Branch name should be specified");

const pkgJsonPath = path.join(__dirname, "..", "..", "dist", "relay-compiler", "package.json");
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));
const version = pkgJson["version"];
assert.strictEqual(
  typeof version, "string",
  '"version" field missing from package.json',
);

const versionSegments = version.split(".");
assert.strictEqual(versionSegments.length, 4, "Unexpected package version format");

const secondsSinceEpoch = Math.floor(Date.now() / 1000);
const sanitizedBranchName = branchName.replace("refs/heads/", "").replaceAll(`/`, "-");
versionSegments[3] = `${sanitizedBranchName}-${secondsSinceEpoch}`
const newVersion = versionSegments.join(".");

pkgJson["version"] = newVersion;
const distPackageJson = JSON.stringify(pkgJson, undefined, 2) + "\n";
fs.writeFileSync(pkgJsonPath, distPackageJson);

console.log(`New package version: ${newVersion}`);
