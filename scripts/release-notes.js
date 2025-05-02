/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

'use strict';

const {execSync} = require('child_process');
const {existsSync, readFileSync} = require('fs');
const http = require('http');

/**
 * This function will create a simple HTTP server that will show the list
 * of commits to the Relay repo since the last release.
 *
 * To run the app:
 * ```
 *  node ./scripts/release-notes.js
 * ```
 *
 * And follow the link, printed in console: http://localhost:3123
 */
function main() {
  log('Generating release notes...');

  const server = http.createServer((request, response) => {
    // Supported Static Resources
    if (request.url.endsWith('.css') || request.url.endsWith('.js')) {
      const path = `./scripts/release-notes/${request.url}`;
      if (!existsSync(path)) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.write('Not Found.');
        response.end();
        return;
      }

      const data = readFileSync(path);
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.write(data);
      response.end();
      return;
    }

    const [commits, lastRelease] = getData();

    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write(
      ` 
        <html>
          <head>
            <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>        
            <title>Relay commits since ${lastRelease}</title>
            <link rel="stylesheet" href="/style.css">
          </head>
          <body>
            <div id="app"></div>
            <script type="text/babel" src="/App.js"></script>
            <script type="text/babel">
              const root = ReactDOM.createRoot(document.getElementById('app'));
              root.render(<App commits={${JSON.stringify(
                commits,
              )}} lastRelease="${lastRelease}" />);
            </script>
          </body>
        </html>
      `,
    );
    response.end();
  });

  const PORT = 3123;
  server.listen(PORT);
  log(`Release notes App started at http://localhost:${PORT}`);
}

function getData() {
  const lastRelease = execSync('git describe --tags --abbrev=0')
    .toString()
    .trim();

  const listOfCommits = execSync(
    `git log --pretty=format:"%h|%ai|%aN|%ae" ${lastRelease}...`,
  ).toString();

  const summary = execSync(`git log --pretty=format:"%s" ${lastRelease}...`)
    .toString()
    .split('\n');

  const body = execSync(
    `git log --pretty=format:"%b<!----!>" ${lastRelease}...`,
  )
    .toString()
    .split('<!----!>\n');
  const commits = listOfCommits.split('\n').map((commitMessage, index) => {
    const diffMatch = body[index].match(/D\d+/);
    const diff = diffMatch != null && diffMatch[0];
    const [hash, date, name, _email] = commitMessage.split('|');
    return {
      hash: hash.slice(0, 7),
      fullHash: hash,
      summary: summary[index],
      message: body[index],
      author: name,
      diff,
      date,
    };
  });

  return [commits, lastRelease];
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

main();
