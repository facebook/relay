/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const CompLibrary = require('../../core/CompLibrary');
const React = require('react');
const Container = CompLibrary.Container;

const CWD = process.cwd();

const siteConfig = require(CWD + '/siteConfig.js');
const versions = require(CWD + '/versions.json');

class Versions extends React.Component {
  render() {
    const latestVersion = versions[0];
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer versionsContainer">
          <div className="post">
            <header className="postHeader">
              <h2>{siteConfig.title + ' Versions'}</h2>
            </header>
            <p>
              Relay Modern is Relay's latest version. Relay Classic is deprecated, but its docs are preserved here for reference.
            </p>
            <a name="latest" />
            <h3>Relay Modern Docs</h3>
            <table className="versions">
              <tbody>
                <tr>
                  <th>
                    {latestVersion}
                  </th>
                  <td>
                    <a href={
                      siteConfig.baseUrl +
                      'docs/en/introduction-to-relay-modern.html'
                    }>Documentation</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <a name="archive" />
            <h3>Relay Classic Docs</h3>
            <table className="versions">
              <tbody>
                {versions.map(
                  version =>
                    version !== latestVersion &&
                    <tr key={version}>
                      <th>
                        {version}
                      </th>
                      <td>
                        <a href={
                          siteConfig.baseUrl +
                          `docs/en/${version}/classic-guides-containers.html`
                        }>Documentation</a>
                      </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Versions;
