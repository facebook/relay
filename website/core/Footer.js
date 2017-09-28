/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule Footer
 * @format
 */

'use strict';

const React = require('React');

class Footer extends React.Component {
  render() {
    const metadata = this.props.metadata;
    return (
      <footer>
        {metadata && (
          <span>
            <a
              className="edit-page-link"
              href={
                'https://github.com/facebook/relay/blob/master/docs/' +
                metadata.source
              }
              target="_blank">
              Edit This Page
            </a>
          </span>
        )}
        <span>Copyright © {new Date().getFullYear()} Facebook Inc</span>
      </footer>
    );
  }
}

module.exports = Footer;
