/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySwapiFilm
 * @flow
 */

'use strict';

const {graphql} = require('react-relay');

/**
 * This would normally be a FragmentContainer,
 * created via createFragmentContainer
 */

module.exports = graphql`
  fragment RelaySwapiFilm_film on Film {
    title
    episodeID
    planetConnection(first: 3) {
      totalCount
      edges {
        node {
          name
        }
      }
    }
  }
`;
