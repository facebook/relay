/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const DocsRating = require('./DocsRating');
const React = require('react');

class Footer extends React.Component {
  render() {
    const currentYear = new Date().getFullYear();
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div className="left-column">
            <DocsRating />
            <div>
              <a href={this.props.config.baseUrl} className="nav-home">
                <img
                  src={this.props.config.baseUrl + this.props.config.footerIcon}
                  alt={this.props.config.title}
                  width="66"
                  height="58"
                />
              </a>
              <div className="links-column">
                <h5>Docs</h5>
                <a
                  href={
                    this.props.config.baseUrl +
                    'docs/en/introduction-to-relay.html'
                  }>
                  Introduction
                </a>
              </div>
            </div>
          </div>
          <div>
            <h5>Community</h5>
            <a
              href={
                this.props.config.baseUrl + this.props.language + '/users.html'
              }>
              User Showcase
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href="https://github.com/facebook/relay">GitHub</a>
            <a href="https://opensource.facebook.com/legal/terms">
              Terms of Use
            </a>
            <a href="https://opensource.facebook.com/legal/privacy">
              Privacy Policy
            </a>
            <a href="https://opensource.facebook.com/legal/data-policy/">
              Data Policy
            </a>
            <a href="https://opensource.facebook.com/legal/cookie-policy/">
              Cookie Policy
            </a>
          </div>
        </section>

        <a
          href="https://code.facebook.com/projects/"
          target="_blank"
          className="fbOpenSource">
          <img
            src={this.props.config.baseUrl + 'img/oss_logo.png'}
            alt="Facebook Open Source"
            width="170"
            height="45"
          />
        </a>
        <section className="copyright">
          Copyright &copy; {currentYear} Facebook Inc.
        </section>
      </footer>
    );
  }
}

module.exports = Footer;
