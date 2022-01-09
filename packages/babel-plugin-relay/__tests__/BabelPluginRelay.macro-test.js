/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const plugin = require('babel-plugin-macros');
const pluginTester = require('babel-plugin-tester');

pluginTester({
  plugin,
  snapshot: true,
  title: 'BabelPluginRelayMacro',
  babelOptions: {filename: __filename, parserOpts: {plugins: ['jsx']}},
  tests: {
    works: `
      'use strict';

      const {graphql} = require('../BabelPluginRelay.macro');
      const ProfilePic = require('ProfilePic');

      const ViewerQuery = graphql\`
        query ViewerQuery($id: ID!, $scale: Float = 1.5) {
          node(id: $id) {
            ... on User {
              id
              ...ProfilePic_user
            }
          }
        }
      \`;
    `,
  },
});
