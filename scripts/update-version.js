'use strict';

const fs = require('fs');
const path = require('path');

const RELAY_NPM_PACKAGES = [
  'babel-plugin-relay',
  'react-relay',
  'relay-compiler',
  'relay-runtime',
  'relay-test-utils',
  'relay-test-utils-internal',
];

const CARGO_FILES = [
  `compiler/crates/relay-bin/Cargo.toml`,
  `compiler/Cargo.lock`,
];

/**
 * Updates the version of relay across all package.json files
 * Based on previous internal version @see https://gist.github.com/captbaritone/3351af94fb0821b93e26e23fbbc0c4c5
 * @param {string} version The version to update to
 * @example
 * node scripts/update-version.js 1.0.0
 */
(function main() {
  const version = process.argv[2] // first argument

  updateVersion(version);
})();

function resolveRootPath(filePath) {
  return path.resolve(__dirname, '..', filePath);
}

function getCurrentVersion() {
  const packageJsonPath = resolveRootPath("./package.json");
  const packageJson = require(packageJsonPath);

  return packageJson.version;
}

function isVersionValid(version) {
  return version && /^\d+\.\d+\.\d+(\-[\d\w\.]+)?$/.test(version)
}

function updatePackageJson(packageJsonPath, version) {
  const packageJson = require(packageJsonPath);

  packageJson.version = version;

  for (const dependenciesKey of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ]) {
    for (const dep in packageJson[dependenciesKey]) {
      if (RELAY_NPM_PACKAGES.includes(dep)) {
        packageJson[dependenciesKey][dep] = version;
      }
    }
  }

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + '\n',
    'utf8',
  );
}

function updateNodePackagesFiles(nextVersion){
  for (const pkg of RELAY_NPM_PACKAGES) {
    updatePackageJson(resolveRootPath(`./packages/${pkg}/package.json`), nextVersion);
  }
}

function updateCompilerCargoFiles(nextVersion){
  for (const file of CARGO_FILES) {
    const text = fs.readFileSync(resolveRootPath(file), 'utf8');
    const withUpdatedVersion = text.replace(
      `version = "${getCurrentVersion()}"`,
      `version = "${nextVersion}"`,
    );
    fs.writeFileSync(resolveRootPath(file), withUpdatedVersion);
  }
}

function updateVersion(nextVersion) {
  const currentVersion = getCurrentVersion();

  if (!isVersionValid(nextVersion)) {
    console.error(`Invalid version: ${nextVersion}\nExample: 1.2.3, 1.2.3-rc.1`);
    process.exit(1)
    return;
  }

  updatePackageJson(resolveRootPath('./package.json'), nextVersion);
  updateNodePackagesFiles(nextVersion);
  updateCompilerCargoFiles(nextVersion);

  console.log(
    `Updated relevant files to version ${currentVersion} → ${nextVersion}`,
  )
}
