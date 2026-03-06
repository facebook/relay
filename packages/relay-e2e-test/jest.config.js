/**
 * Jest configuration for the relay e2e test package.
 *
 * Dependencies come from two locations:
 * - Root node_modules: jest, babel, build tooling
 * - E2E node_modules: react@19, graphql@16, @testing-library (isolated versions)
 * - Relay source: packages/relay-runtime, packages/react-relay (from source)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const RELAY_ROOT = path.resolve(__dirname, '../..');

/**
 * Get the main git working tree root for resolving build artifacts.
 */
function getMainRepoRoot() {
  try {
    const dotGit = path.join(RELAY_ROOT, '.git');
    const stat = fs.statSync(dotGit);
    if (stat.isFile()) {
      const content = fs.readFileSync(dotGit, 'utf-8').trim();
      const match = content.match(/^gitdir:\s+(.+)$/);
      if (match) {
        const gitdir = path.resolve(RELAY_ROOT, match[1]);
        const mainGitDir = path.resolve(gitdir, '../..');
        return path.dirname(mainGitDir);
      }
    }
    return RELAY_ROOT;
  } catch {
    return RELAY_ROOT;
  }
}

const mainRoot = getMainRepoRoot();

module.exports = {
  testMatch: ['<rootDir>/**/fixtures.test.js'],
  transform: {
    '\\.[jt]sx?$': '<rootDir>/jest-transform.js',
  },
  // Transform relay source files and temp dir files (not in node_modules)
  // Also transform @testing-library since it uses ESM
  transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library)/)',
  ],
  moduleNameMapper: {
    // Force all react imports to use the e2e package's React 19,
    // not the root repo's experimental React. Without this, relay
    // source files resolve react from root node_modules, causing
    // a dual-React-instance error.
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^react-dom$': '<rootDir>/node_modules/react-dom',
    '^react-dom/(.*)$': '<rootDir>/node_modules/react-dom/$1',
    // Point to Relay source files directly
    '^relay-runtime$': path.join(RELAY_ROOT, 'packages/relay-runtime'),
    '^relay-runtime/(.*)$': path.join(RELAY_ROOT, 'packages/relay-runtime/$1'),
    '^react-relay$': path.join(RELAY_ROOT, 'packages/react-relay'),
    '^react-relay/(.*)$': path.join(RELAY_ROOT, 'packages/react-relay/$1'),
  },
  // Resolve modules from both e2e node_modules (react@19, graphql@16)
  // and root node_modules (fbjs, invariant)
  // E2E comes first so react@19 wins over root's react@experimental
  modulePaths: [
    '<rootDir>/node_modules',
    path.join(mainRoot, 'node_modules'),
  ],
  // Use jsdom for DOM testing with @testing-library
  testEnvironment: 'jest-environment-jsdom',
  roots: ['<rootDir>'],
  // Increase timeout for fixture compilation (grats + relay-compiler)
  testTimeout: 30000,
  setupFiles: ['<rootDir>/jest-setup.js'],
};
