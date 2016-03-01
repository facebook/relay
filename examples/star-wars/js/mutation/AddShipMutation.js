import Relay from 'react-relay';

export default class AddShipMutation extends Relay.Mutation {

  static fragments = {
    faction: () => Relay.QL`
      fragment on Faction {
        id,
        factionId
      }
    `,
  };

  getMutation() {
    return Relay.QL`mutation { introduceShip }`;
  }

  getVariables() {
    return {
      shipName: this.props.name,
      factionId: this.props.faction.factionId,
    };
  }

  getFatQuery() {
    return Relay.QL`
      fragment on IntroduceShipPayload @relay(pattern: true) {
        faction {
          name
          ships {
            edges {
              node {
                name
              }
            }
          }
        }
        newShipEdge
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'faction',
      parentID: this.props.faction.id,
      connectionName: 'ships',
      edgeName: 'newShipEdge',
      rangeBehaviors: {
        '': 'append',
        'orderby(oldest)': 'prepend',
      },
    }];
  }

  getOptimisticResponse() {
    return {
      newShipEdge: {
        node: {
          name: this.props.name,
        },
      },
      faction: {
        id: this.props.faction.id,
      },
    };
  }

}
