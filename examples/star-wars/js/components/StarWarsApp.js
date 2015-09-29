/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import React from 'react';
import Relay from 'react-relay';
import StarWarsShip from './StarWarsShip';

class StarWarsApp extends React.Component {
  render() {
    var {factions} = this.props;
    return (
      <ol>
        {factions.map(faction => (
          <li>
            <h1>{faction.name}</h1>
            <ol>
              {faction.ships.edges.map(edge => (
                <li><StarWarsShip ship={edge.node} /></li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    );
  }
}

export default Relay.createContainer(StarWarsApp, {
  fragments: {
    factions: () => Relay.QL`
      fragment on Faction @relay(plural: true) {
        name,
        ships(first: 10) {
          edges {
            node {
              ${StarWarsShip.getFragment('ship')}
            }
          }
        }
      }
    `,
  },
});
