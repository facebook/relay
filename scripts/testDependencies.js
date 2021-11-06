/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const fs = require('fs');
const path = require('path');

if (module.parent) {
  module.exports = testDependencies;
} else {
  // Called directly
  const topLevelPackagePath = path.join(__dirname, '../');
  const packagesRoot = path.join(topLevelPackagePath, 'packages');
  const packagePaths = fs
    .readdirSync(packagesRoot)
    .map((filepath) => path.join(packagesRoot, filepath))
    .filter((filepath) => fs.statSync(filepath).isDirectory());

  const errors = testDependencies(topLevelPackagePath, packagePaths);
  if (errors.length !== 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }
}

function testDependencies(topLevelPackagePath, packagePaths) {
  return packagePaths.reduce(
    (errors, packagePath) =>
      errors.concat(testPackageDependencies(topLevelPackagePath, packagePath)),
    [],
  );
}

function testPackageDependencies(topLevelPackagePath, packagePath) {
  const errors = [];
  const topLevelPackageJson = require(path.join(
    topLevelPackagePath,
    'package.json',
  ));
  const packageJson = require(path.join(packagePath, 'package.json'));
  const packageName = path.basename(packagePath);

  expectEqual(
    errors,
    packageJson.name,
    packageName,
    `${packageName} should have a matching package name.`,
  );

  expectEqual(
    errors,
    packageJson.optionalDependencies,
    undefined,
    `${packageName} should have no optional dependencies.`,
  );

  expectEqual(
    errors,
    packageJson.bundledDependencies,
    undefined,
    `${packageName} should have no bundled dependencies.`,
  );

  // `babel-plugin-relay` requires its devDependencies to be declared because it is
  // integrated into two workspaces at Facebook.
  if (packageJson.name !== 'babel-plugin-relay') {
    expectEqual(
      errors,
      packageJson.devDependencies,
      undefined,
      `${packageName} should have no dev dependencies.`,
    );
  }

  const requiredRepoPackages = new Set([
    'relay-compiler',
    'relay-runtime',
    'react-relay',
  ]);
  for (const dependencyName in packageJson.dependencies) {
    // packages in this repo, won't be in the top level package.json.
    if (requiredRepoPackages.has(dependencyName)) {
      continue;
    }
    expectEqual(
      errors,
      getDependency(topLevelPackageJson, dependencyName),
      getDependency(packageJson, dependencyName),
      `${packageName} should have same ${dependencyName} version ` +
        'as the top level package.json.',
    );
  }

  return errors;
}

function expectEqual(errors, expected, actual, message) {
  if (expected !== actual) {
    errors.push(`Expected ${actual} to equal ${expected}. ${message}`);
  }
}

function getDependency(packageJson, name) {
  const version = packageJson.dependencies[name];
  return version ? `${name}@${version}` : `(missing ${name})`;
}
