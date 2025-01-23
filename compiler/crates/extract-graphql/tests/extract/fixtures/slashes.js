/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
  *   escape in docblock
  *   \\n
 */
const newline = "\\/escape in string \n newline in string ";

function MyComponent() {
    useFragment(graphql`
      fragment Test on User {
        __typename
      }
    `, user)
    return <div>Test</div>;
  }
