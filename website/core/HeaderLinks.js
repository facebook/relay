/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule HeaderLinks
*/

const HeaderLinks = React.createClass({
  links: [
    {section: 'playground', href: '/relay/prototyping/playground.html', text: 'Try it out'},
    {section: 'docs', href: '/relay/docs/getting-started.html#content', text: 'Docs'},
    {section: 'support', href: '/relay/support.html', text: 'Support'},
    {section: 'github', href: 'https://github.com/facebook/relay', text: 'GitHub'},
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
  }
});

module.exports = HeaderLinks;
