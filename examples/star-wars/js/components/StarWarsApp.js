/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
