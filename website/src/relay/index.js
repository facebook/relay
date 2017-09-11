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

const Footer = require('Footer');
const React = require('React');
const Site = require('Site');

class index extends React.Component {
  render() {
    return (
      <Site>
        <div className="hero">
          <div className="wrap">
            <img
              className="hero-logo"
              src="/relay/img/logo.svg"
              width="300"
              height="300"
            />
            <h1 className="text">
              <strong>Relay</strong>
            </h1>
            <h2 className="minitext">
              A JavaScript framework for building data-driven React applications
            </h2>

            <div className="buttons-unit">
              <a className="button" href="docs/getting-started.html">
                Get Started
              </a>
            </div>
          </div>
        </div>

        <section className="content wrap">
          <section className="marketing-row">
            <div className="marketing-col">
              <h3>Declarative</h3>
              <p>
                Declare the data your components need with GraphQL, Relay
                determines how and when to fetch your data.
              </p>
            </div>
            <div className="marketing-col">
              <h3>Colocation</h3>
              <p>
                GraphQL is written next to the views that rely on them. Relay
                aggregates queries into efficient network requests.
              </p>
            </div>
            <div className="marketing-col">
              <h3>Mutations</h3>
              <p>
                Write GraphQL mutations and Relay offers automatic data
                consistency, optimistic updates, and error handling.
              </p>
            </div>
          </section>

          <section className="relay-modern">
            <div className="starburst">New</div>
            <h2>Relay Modern</h2>
            <p>
              Relay Modern is a new version of Relay designed from the ground up
              to be easier to use, more extensible and, most of all, able to
              improve performance on mobile devices. Relay Modern accomplishes
              this with static queries and ahead-of-time code generation.
            </p>
            <p>
              Incrementally convert existing Relay apps, or start a new one with
              Relay Modern.
            </p>
            <a className="button" href="docs/relay-modern.html">
              Try Relay Modern
            </a>
          </section>
        </section>

        <Footer />
      </Site>
    );
  }
}

module.exports = index;
