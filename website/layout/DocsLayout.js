/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DocsLayout
*/

const React = require('React');
const Site = require('Site');
const Marked = require('Marked');
const DocsSidebar = require('DocsSidebar');
const DocsLayout = React.createClass({
  render: function() {
    const metadata = this.props.metadata;
    const content = this.props.children;
    const title = metadata.title + ' | Relay Docs';
    return (
      <Site section="docs" title={title}>
        <section className="content wrap documentationContent">
          <DocsSidebar metadata={metadata} />
          <div className="inner-content">
            <a id="content" />
            <a className="edit-page-link" href={'https://github.com/facebook/relay/blob/master/docs/' + metadata.source} target="_blank">Edit on GitHub</a>
            <h1>{metadata.title}</h1>
            <Marked>{content}</Marked>
            <div className="docs-prevnext">
              {metadata.previous && <a className="docs-prev" href={metadata.previous + '.html#content'}>&larr; Prev</a>}
              {metadata.next && <a className="docs-next" href={metadata.next + '.html#content'}>Next &rarr;</a>}
            </div>
          </div>
        </section>
      </Site>
    );
  }
});

module.exports = DocsLayout;
