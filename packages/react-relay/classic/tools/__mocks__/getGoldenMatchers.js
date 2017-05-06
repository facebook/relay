/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

const invariant = require('invariant');
const partitionArray = require('partitionArray');

const COLOR = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  RED_BG: '\x1b[41m',
  GREEN_BG: '\x1b[42m',
  YELLOW_BG: '\x1b[43m',

  red(string) {
    return COLOR.BOLD + COLOR.RED_BG + string + COLOR.RESET;
  },

  green(string) {
    return COLOR.BOLD + COLOR.GREEN_BG + string + COLOR.RESET;
  },

  yellow(string) {
    return COLOR.BOLD + COLOR.YELLOW_BG + string + COLOR.RESET;
  },
};

/**
 * Returns "golden" matchers for use with the specified `testFile`.
 *
 * Golden tests read a collection of input files, process them with a
 * function, and compare the results against a collection of ("golden") output
 * files. Discrepancies are reported as textual diffs, and the golden files
 * can be updated by running the tests with an environment variable set.
 *
 * A directory containing input and output fixtures can be specified using a
 * path relative to the directory containing the current test file (passed in
 * via the `testFile` parameter):
 *
 *    beforeEach(() => {
 *      jasmine.addMatchers(getGoldenMatchers(__filename));
 *    });
 *
 * If you don't initialize in this way, either absolute paths, or paths
 * relative to the current working directory, may be used, but this is not
 * recommended.
 *
 * Additionally, an optional options object can be supplied to fine-tune the
 * comparison between actual and expected outputs:
 *
 *    getGoldenMatchers(
 *      __filename,
 *      {trimWhitespace: false}
 *    );
 *
 * Supported options:
 *
 *  - `trimWhitespace`: If `true` (the default), trailing whitespace is
 *    stripped before comparing actual and expected output.
 *
 */
function getGoldenMatchers(...args) {
  const [testFile, options] = args;
  const trimWhitespace = options && options.hasOwnProperty('trimWhitespace')
    ? options.trimWhitespace
    : true;

  return {
    /**
    * Implements the "golden" test pattern. Takes a path to a folder of input
    * and output fixtures, and a function to operate on the contents of each
    * input file.
    *
    * Input files have the form "$BASENAME.input.$EXT" and output files have
    * the form "$BASENAME.golden.$EXT". Input and output files are matched up
    * according to their basenames (ie. file extensions are ignored). This
    * enables viewing and editing input and output files with arbitrary syntax
    * highlighting in your editor.
    *
    * To run the tests:
    *
    *    expect('fixtures/parser').toMatchGolden(text => parse(text));
    *
    * To update the golden files, re-run the tests with the
    * `GOLDEN_ACCEPT` environment variable set:
    *
    *    GOLDEN_ACCEPT=1 jest MyTestModule
    *
    * Additionally, note that adding a new input file and running the tests
    * will cause the corresponding golden file to be created with a default
    * ".txt" extension.
    */
    toMatchGolden(util) {
      const fs = require('fs');
      const path = require('path');
      const base = testFile ? path.dirname(testFile) : process.cwd();

      return {
        compare(fixtures, operation) {
          const absoluteFixtures = path.isAbsolute(fixtures)
            ? fixtures
            : path.join(base, fixtures);
          invariant(
            fs.statSync(absoluteFixtures).isDirectory(),
            `toMatchGolden: "${fixtures}" is not a directory`,
          );
          const fixtureInfo = fs.readdirSync(absoluteFixtures).map(file => {
            const {ext, name: nameWithType} = path.parse(file);
            const {ext: type, name} = path.parse(nameWithType);
            const fixture = path.join(absoluteFixtures, file);
            invariant(
              ext !== '' && (type === '.input' || type === '.golden'),
              `toMatchGolden: "${file}" must be named ` +
                '"*.input.$EXTENSION" or "*.golden.$EXTENSION".',
            );
            invariant(
              fs.statSync(fixture).isFile(),
              `toMatchGolden: "${file}" must be a regular file.`,
            );
            return {
              ext: ext.slice(1),
              fixture,
              name,
              type: type.slice(1),
            };
          });
          const inputFilesSet = new Set();
          const outputFilesMap = new Map();
          const [
            inputFiles,
            outputFiles,
          ] = partitionArray(fixtureInfo, info => {
            const {name, type} = info;
            if (type === 'input') {
              inputFilesSet.add(name);
              return true;
            } else {
              outputFilesMap.set(name, info);
            }
          });
          outputFiles.forEach(({ext, name, type}) => {
            invariant(
              inputFilesSet.has(name),
              `toMatchGolden: golden file "${name}.${type}.${ext}" does ` +
                'not have a corresponding input file.',
            );
          });
          const failures = [];
          inputFiles.forEach(({ext, fixture, name, type}) => {
            const inputFile = `${name}.${type}.${ext}`;
            const input = fs.readFileSync(fixture).toString();
            let output;

            try {
              output = operation(input, inputFile);
            } catch (e) {
              throw new Error(
                'Failure applying function to input from file ' +
                  `"${inputFile}":\n` +
                  `${e.message}\n${e.stack}`,
              );
            }

            if (outputFilesMap.has(name)) {
              const expectedFileInfo = outputFilesMap.get(name);
              const expectedFile = expectedFileInfo.fixture;
              const expected = fs.readFileSync(expectedFile).toString();
              const trimmedOutput = trimWhitespace ? output.trim() : output;
              const trimmedExpected = trimWhitespace
                ? expected.trim()
                : expected;
              if (trimmedOutput !== trimmedExpected) {
                if (process.env.GOLDEN_ACCEPT) {
                  log(COLOR.green(' ACK  ') + ' ' + name);
                  fs.writeFileSync(expectedFile, normalize(output));
                } else {
                  log(COLOR.red(' FAIL ') + ' ' + name);
                  failures.push({
                    name,
                    expectedFile,
                    expected,
                    output,
                  });
                  printDiff(trimmedExpected, trimmedOutput, expectedFileInfo);
                }
              } else {
                log(COLOR.green('  OK  ') + ' ' + name);
              }
            } else {
              log(COLOR.yellow(' NEW  ') + ' ' + name);
              const golden = path.join(absoluteFixtures, `${name}.golden.txt`);
              fs.writeFileSync(golden, normalize(output));
            }
          });
          return {
            pass: failures.length === 0,
            message: 'actual output did not match expected for files: ' +
              failures.map(failure => failure.name).join(', ') +
              ' (if these changes are intended, re-run the tests with the ' +
              'environment variable GOLDEN_ACCEPT=1 to update the ' +
              'fixtures)',
          };
        },
      };
    },
  };
}

/**
 * Normalize a string by ensuring it ends with exactly one newline character and
 * no other whitespace.
 */
function normalize(string) {
  return string.replace(/\s*$/, '\n');
}

/**
 * Log some output.
 */
function log(...args) {
  // eslint-disable-next-line no-console-disallow
  console.log(...args);
}

function printDiff(expectedText, actualText, info) {
  const child_process = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const {ext, name, type} = info;
  const temp = getTemporaryDirectory();

  function write(suffix, contents) {
    const file = `${name}.${type}.${ext}.${suffix}`;
    fs.writeFileSync(path.join(temp, file), normalize(contents));
    return file;
  }

  try {
    child_process.execFileSync(
      'git',
      [
        'diff',
        '--color=always',
        write('expected', normalize(expectedText)),
        write('actual', normalize(actualText)),
      ],
      // Change into temporary directory to get prettier diff headers.
      {cwd: temp},
    );
  } catch (e) {
    if (e.status === 1) {
      // This is normal, because `git diff` exits with an exit code of 1
      // whenever there is a diff.
      log(e.stdout.toString());
    } else {
      throw e;
    }
  }
}

function getTemporaryDirectory() {
  // Very recent versions of Node have an fs.mkdtempSync call, but for now, just
  // shell out.
  const child_process = require('child_process');
  return child_process.execFileSync('mktemp', ['-d']).toString().trim();
}

module.exports = getGoldenMatchers;
