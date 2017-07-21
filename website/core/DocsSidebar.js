/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule DocsSidebar
 */

'use strict';

const Metadata = require('Metadata');
const React = require('React');

/**
 * We're not really set up to support translations well at the moment (ie.
 * multiple documents with the same `id` but different `permalink`s of the
 * form "foo.html" and "foo.zh-CN.html"), so we make sure we always prefer
 * the "canonical" (non-localized) version.
 */
function shouldOverwritePreviousWithCanonical(previous, maybeCanonical) {
  let match = previous.permalink.match(/^(.+)\.[a-z]+-[a-z]+\.html$/i);
  if (match) {
    // `previous` is a localized file.
    const previousBase = match[1];
    match = maybeCanonical.permalink.match(/^(.+)\.html/);
    if (match && match[1] === previousBase) {
      // Found canonical "foo.html"; should overwrite "foo.zh-CN.html".
      return true;
    }
  }
  return false;
}

const DocsSidebar = React.createClass({
  getCategories: function() {
    // Skip over non-docs and non-en_US entries.
    const metadatas = Array.from(
        Metadata.files.reduce(function(acc, metadata) {
          if (metadata.layout === 'docs') {
            const previous = acc.get(metadata.id);
            if (
              !previous ||
              shouldOverwritePreviousWithCanonical(previous, metadata)
            ) {
              acc.delete(metadata.id);
              acc.set(metadata.id, metadata);
            }
          }
          return acc;
        }, new Map()
      ).values()
    );

    // Build a hashmap of article_id -> metadata
    const articles = {};
    for (var i = 0; i < metadatas.length; ++i) {
      var metadata = metadatas[i];
      articles[metadata.id] = metadata;
    }

    // Build a hashmap of article_id -> previous_id
    const previous = {};
    for (var i = 0; i < metadatas.length; ++i) {
      var metadata = metadatas[i];
      if (metadata.next) {
        if (!articles[metadata.next]) {
          throw '`next: ' + metadata.next + '` in ' + metadata.id + ' doesn\'t exist';
        }
        previous[articles[metadata.next].id] = metadata.id;
      }
    }

    // Find the first element which doesn't have any previous
    let first = null;
    for (var i = 0; i < metadatas.length; ++i) {
      var metadata = metadatas[i];
      if (!previous[metadata.id]) {
        first = metadata;
        break;
      }
    }

    const categories = [];
    let currentCategory = null;

    var metadata = first;
    var i = 0;
    while (metadata && i++ < 1000) {
      if (!currentCategory || metadata.category !== currentCategory.name) {
        currentCategory && categories.push(currentCategory);
        currentCategory = {
          name: metadata.category,
          links: [],
        };
      }
      currentCategory.links.push(metadata);
      metadata = articles[metadata.next];
    }
    categories.push(currentCategory);

    return categories;
  },

  getLink: function(metadata) {
    if (metadata.permalink.match(/^https?:/)) {
      return metadata.permalink;
    }
    return '/relay/' + metadata.permalink;
  },

  render: function() {
    return <div className="nav-docs">
      {this.getCategories().map((category) =>
        <div className="nav-docs-section" key={category.name}>
          <h3>{category.name}</h3>
          <ul>
            {category.links.map((metadata) =>
              <li key={metadata.id}>
                <a
                  target={metadata.permalink.match(/^https?:/) && '_blank'}
                  style={{marginLeft: metadata.indent ? 20 : 0}}
                  className={metadata.id === this.props.metadata.id ? 'active' : ''}
                  href={this.getLink(metadata)}>
                  {metadata.title}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>;
  },
});

module.exports = DocsSidebar;
