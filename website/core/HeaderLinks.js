/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule HeaderLinks
 * @format
 */

'use strict';

const HeaderLinks = React.createClass({
  links: [
    {section: 'docs', href: '/relay/docs/getting-started.html', text: 'Docs'},
    {section: 'support', href: '/relay/support.html', text: 'Support'},
    {
      section: 'github',
      href: 'https://github.com/facebook/relay',
      text: 'GitHub',
    },
  ],

  render: function() {
    return (
      <ul className="nav-site">
        {this.links.map(function(link) {
          return (
            <li key={link.section}>
              <a
                href={link.href}
                className={link.section === this.props.section ? 'active' : ''}>
                {link.text}
              </a>
            </li>
          );
        }, this)}
      </ul>
    );
  },
});

module.exports = HeaderLinks;
