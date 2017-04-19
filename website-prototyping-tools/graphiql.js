import 'babel/polyfill';
import 'graphiql/graphiql.css';

import GraphiQL from 'graphiql';
import React from 'react'; window.React = React;
import ReactDOM from 'react/lib/ReactDOM';

import evalSchema from './evalSchema';
import queryString from 'query-string';
import {graphql} from 'graphql';

if (
  /^https?:\/\/facebook.github.io\//.test(document.referrer) ||
  /^localhost/.test(document.location.host)
) {
  var {
    query,
    schema: schemaSource,
  } = queryString.parse(location.hash);
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
