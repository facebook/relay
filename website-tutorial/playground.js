import 'babel/polyfill';

import React from 'react'; window.React = React;
import ReactDOM from 'react/lib/ReactDOM';
import RelayPlayground from './RelayPlayground';

import queryString from 'query-string';

if (
  /^https?:\/\/facebook.github.io\//.test(document.referrer) ||
  /^localhost/.test(document.location.host)
) {
  var {
    schema: schemaSource,
    source: appSource,
  } = queryString.parse(location.search);
}

var mountPoint = document.createElement('div');
document.body.appendChild(mountPoint);

ReactDOM.render(
  <RelayPlayground
    initialAppSource={appSource || require('!raw!./HelloApp')}
    initialSchemaSource={schemaSource || require('!raw!./HelloSchema')}
  />,
  mountPoint
);
