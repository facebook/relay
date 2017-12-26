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

const babel = require('babel-core');

describe('BabelPluginRelayMacro', () => {
  test('works', () => {
    const basic = `
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
    `;
    const {code} = babel.transform(basic, {
      plugins: ['babel-plugin-macros'],
      filename: __filename,
      compact: false,
      parserOpts: {plugins: ['jsx']},
      babelrc: false,
    });
    expect(code).toMatchSnapshot();
  });
});
