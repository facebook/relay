/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const pluginTester = require('babel-plugin-tester');
const plugin = require('babel-plugin-macros');

pluginTester({
  plugin,
  snapshot: true,
  title: 'BabelPluginRelayMacro',
  babelOptions: {filename: __filename, parserOpts: {plugins: ['jsx']}},
  tests: {
    works: `
      'use strict';

      const {graphql} = require('../../react-relay/modern/ReactRelayGraphQL.macro');
      const CompatProfilePic = require('CompatProfilePic');

      const CompatViewerQuery = graphql\`
        query CompatViewerQuery($id: ID!, $scale: Float = 1.5) {
          node(id: $id) {
            ... on User {
              id
              ...CompatProfilePic_user
            }
          }
        }
      \`;
    `,
  },
});
