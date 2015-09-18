/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import 'babel/polyfill';
import 'graphiql/graphiql.css';

import GraphiQL from 'graphiql';
import React from 'react'; window.React = React;
import ReactDOM from 'react/lib/ReactDOM';

import evalSchema from './evalSchema';
import queryString from 'querystring';
import {graphql} from 'graphql';

const IS_TRUSTED = (
  (
    // Running in an iframe on the Relay website
    window.self !== window.top &&
    /^https?:\/\/facebook.github.io\//.test(document.referrer)
  ) ||
  // Running locally
  /^(127\.0\.0\.1|localhost)/.test(document.location.host)
);

if (IS_TRUSTED) {
  // Don't trust location.hash not to have been unencoded by the browser
  var hash = window.location.href.split('#')[1];
  var {
    query,
    schema: schemaSource,
  } = queryString.parse(hash);
}

var Schema;
if (schemaSource) {
  Schema = evalSchema(schemaSource);
} else {
  Schema = require('./HelloSchema');
}

function graphQLFetcher(graphQLParams) {
  return graphql(Schema, graphQLParams.query);
}

var mountPoint = document.createElement('div');
mountPoint.style.height = '100%';
document.body.appendChild(mountPoint);

ReactDOM.render(
  <GraphiQL fetcher={graphQLFetcher} query={query} schema={Schema} />,
  mountPoint
);
