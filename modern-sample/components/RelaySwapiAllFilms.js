/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelaySwapiAllFilms
 * @flow
 */

'use strict';

const {graphql} = require('RelayModern');

/**
 * This would usually be a RelayQueryRenderer. Getting that set up
 * requires configuring RelayEnvironment to match your application's needs.
 */

module.exports = graphql`
  query RelaySwapiAllFilmsQuery {
    allFilms(first: 3) {
      edges {
        node {
          title
          ...RelaySwapiFilm_film
        }
      }
    }
  }
`;
