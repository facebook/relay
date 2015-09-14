/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import 'babel/polyfill';

import React from 'react'; window.React = React;
import ReactDOM from 'react/lib/ReactDOM';
import RelayPlayground from './RelayPlayground';

import queryString from 'querystring';

var queryParams = queryString.parse(location.hash.slice(1));

if (
  /^https?:\/\/facebook.github.io\//.test(document.referrer) ||
  /^localhost/.test(document.location.host)
) {
  var {
    schema: schemaSource,
    source: appSource,
  } = queryParams;
}

var {cacheKey} = queryParams;
var appSourceCacheKey;
var schemaSourceCacheKey;
if (cacheKey) {
  appSourceCacheKey = `rp-${cacheKey}-source`;
  if (localStorage.getItem(appSourceCacheKey) != null) {
    appSource = localStorage.getItem(appSourceCacheKey);
  }
  schemaSourceCacheKey = `rp-${cacheKey}-schema`;
  if (localStorage.getItem(schemaSourceCacheKey) != null) {
    schemaSource = localStorage.getItem(schemaSourceCacheKey);
  }
}

var mountPoint = document.createElement('div');
document.body.appendChild(mountPoint);

ReactDOM.render(
  <RelayPlayground
    initialAppSource={
      appSource != null ? appSource : require('!raw!./HelloApp')
    }
    initialSchemaSource={
      schemaSource != null ? schemaSource : require('!raw!./HelloSchema')
    }
    onSchemaSourceChange={schemaSourceCacheKey &&
      function(source) { localStorage.setItem(schemaSourceCacheKey, source); }
    }
    onAppSourceChange={appSourceCacheKey &&
      function(source) { localStorage.setItem(appSourceCacheKey, source); }
    }
  />,
  mountPoint
);
