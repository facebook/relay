/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import 'babel/polyfill';

import React from 'react'; window.React = React;
import ReactDOM from 'react-dom';
import RelayPlayground from './RelayPlayground';

import filterObject from 'fbjs/lib/filterObject';
import queryString from 'querystring';

const DEFAULT_CACHE_KEY = 'default';
const IS_TRUSTED = (
  (
    // Running in an iframe on the Relay website
    window.self !== window.top &&
    /^https?:\/\/facebook.github.io\//.test(document.referrer)
  ) ||
  // Running locally
  /^(127\.0\.0\.1|localhost)/.test(document.location.host)
);

let sourceWasInjected = false;

function setHash(object) {
  // Caution: setting it to nothing causes the page to jump to the top, hence /.
  window.location.hash = queryString.stringify(object) || '/';
}

// Don't trust location.hash not to have been unencoded by the browser
var hash = window.location.href.split('#')[1];
let queryParams = queryString.parse(hash);

let {
  cacheKey,
  noCache,
} = queryParams;
noCache = (noCache !== undefined) && (noCache !== 'false');
if (noCache) {
  cacheKey = undefined;
} else if (!cacheKey) {
  cacheKey = DEFAULT_CACHE_KEY;
}
const appSourceCacheKey = `rp-${cacheKey}-source`;
const schemaSourceCacheKey = `rp-${cacheKey}-schema`;

let initialAppSource;
let initialSchemaSource;
const storedAppSource = localStorage.getItem(appSourceCacheKey);
const storedSchemaSource = localStorage.getItem(schemaSourceCacheKey);
if (noCache) {
  // Use case #1
  // We use the noCache param to force a playground to have certain contents.
  // eg. static example apps
  initialAppSource = queryParams.source || '';
  initialSchemaSource = queryParams.schema || '';
  sourceWasInjected = true;
  queryParams = {};
} else if (cacheKey === DEFAULT_CACHE_KEY) {
  // Use case #2
  // The user loaded the playground without a custom cache key.
  //   Allow code injection via the URL
  //   OR load code from localStorage
  //   OR prime the playground with some default 'hello world' code
  if (queryParams.source != null) {
    initialAppSource = queryParams.source;
    sourceWasInjected = queryParams.source !== storedAppSource;
  } else if (storedAppSource != null) {
    initialAppSource = storedAppSource;
  } else {
    initialAppSource = require('!raw!./HelloApp');
  }
  if (queryParams.schema != null) {
    initialSchemaSource = queryParams.schema;
    sourceWasInjected = queryParams.schema !== storedSchemaSource;
  } else if (storedSchemaSource != null) {
    initialSchemaSource = storedSchemaSource;
  } else {
    initialSchemaSource = require('!raw!./HelloSchema');
  }
  queryParams = filterObject({
    source: queryParams.source,
    schema: queryParams.schema,
  }, v => v !== undefined);
} else if (cacheKey) {
  // Use case #3
  // Custom cache keys are useful in cases where you want to embed a playground
  // that features both custom boilerplate code AND saves the developer's
  // progress, without overwriting the default code cache. eg. a tutorial.
  if (storedAppSource != null) {
    initialAppSource = storedAppSource;
  } else {
    initialAppSource = queryParams[`source_${cacheKey}`];
    if (initialAppSource != null) {
      sourceWasInjected = true;
    }
  }
  if (storedSchemaSource != null) {
    initialSchemaSource = storedSchemaSource;
  } else {
    initialSchemaSource = queryParams[`schema_${cacheKey}`];
    if (initialSchemaSource != null) {
      sourceWasInjected = true;
    }
  }
  queryParams = {};
}
setHash(queryParams);

const mountPoint = document.createElement('div');
document.body.appendChild(mountPoint);

ReactDOM.render(
  <RelayPlayground
    autoExecute={IS_TRUSTED || !sourceWasInjected}
    initialAppSource={initialAppSource}
    initialSchemaSource={initialSchemaSource}
    onSchemaSourceChange={function(source) {
      localStorage.setItem(schemaSourceCacheKey, source);
      if (cacheKey === DEFAULT_CACHE_KEY) {
        queryParams.schema = source;
        setHash(queryParams);
      }
    }}
    onAppSourceChange={function(source) {
      localStorage.setItem(appSourceCacheKey, source);
      if (cacheKey === DEFAULT_CACHE_KEY) {
        queryParams.source = source;
        setHash(queryParams);
      }
    }}
  />,
  mountPoint
);
