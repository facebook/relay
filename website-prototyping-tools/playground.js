import 'babel/polyfill';

import React from 'react'; window.React = React;
import ReactDOM from 'react/lib/ReactDOM';
import RelayPlayground from './RelayPlayground';

import queryString from 'query-string';

var queryParams = queryString.parse(location.hash);

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
