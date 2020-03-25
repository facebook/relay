/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
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
            <a name="next" />
            <h3>Latest Version</h3>
            <p>
              Here you can find the latest unreleased documentation and code.
            </p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>next</th>
                  <td>
                    <a
                      href={`${siteConfig.baseUrl}docs/en/next/introduction-to-relay`}>
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a href="https://github.com/facebook/relay">Source Code</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <a name="latest" />
            <h3>Current Version (Stable)</h3>
            <p>Latest stable version of Relay Modern</p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>{latestVersion}</th>
                  <td>
                    <a
                      href={`${siteConfig.baseUrl}docs/en/introduction-to-relay`}>
                      Documentation
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://github.com/facebook/relay/releases/tag/${latestVersion}`}>
                      Release Notes
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <a name="archive" />
            <h3>Experimental</h3>
            <table className="versions">
              <tbody>
                {versions.map(
                  (version) =>
                    version === 'experimental' && (
                      <tr key={version}>
                        <th>{version}</th>
                        <td>
                          <a
                            href={`${siteConfig.baseUrl}docs/en/${version}/step-by-step`}>
                            Documentation
                          </a>
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
            <h3>Past Versions</h3>
            <p>
              This section contains documentation and release notes for previous
              versions of Relay, as well as a reference to Relay Classic docs,
              which is the old, now deprecated, version of Relay.
            </p>
            <table className="versions">
              <tbody>
                {versions.map(
                  (version) =>
                    version !== latestVersion &&
                    version !== 'experimental' && (
                      <tr key={version}>
                        <th>{version}</th>
                        <td>
                          <a
                            href={
                              version === 'classic'
                                ? `${siteConfig.baseUrl}docs/en/${version}/classic-guides-containers`
                                : `${siteConfig.baseUrl}docs/en/${version}/introduction-to-relay`
                            }>
                            Documentation
                          </a>
                        </td>
                        {version !== 'classic' ? (
                          <td>
                            <a
                              href={`https://github.com/facebook/relay/releases/tag/${version}`}>
                              Release Notes
                            </a>
                          </td>
                        ) : null}
                      </tr>
                    ),
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
