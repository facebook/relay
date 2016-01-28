/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule PageLayout
*/

var React = require('React');
var Site = require('Site');
var Marked = require('Marked');

var support = React.createClass({
  render: function() {
    var metadata = this.props.metadata;
    var content = this.props.children;
    return (
      <Site section={metadata.section}>
        <section className="content wrap documentationContent nosidebar">
          <div className="inner-content">
            <Marked>{content}</Marked>
          </div>
        </section>
      </Site>
    );
  }
});

module.exports = support;
