/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule PageLayout
 * @format
 */

'use strict';

const Footer = require('Footer');
const Marked = require('Marked');
const React = require('React');
const Site = require('Site');

class support extends React.Component {
  render() {
    const metadata = this.props.metadata;
    const content = this.props.children;
    return (
      <Site section={metadata.section}>
        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <Marked>{content}</Marked>
          </div>
        </section>
        <Footer metadata={metadata} />
      </Site>
    );
  }
}

module.exports = support;
