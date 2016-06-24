---
id: tutorial
title: 教程
layout: docs
category: Quick Start
permalink: docs/tutorial.zh-CN.html
next: thinking-in-graphql
---

在这篇教程里，我们将利用 GraphQL mutations 来构建一个游戏。游戏目标是在9个方块里寻找到隐藏的宝藏。玩家将有三次机会来找出宝藏。这个游戏能让我们从里到外了解 Relay ——从服务端的 GraphQL schema，到客户端的 React 应用。

## 热身

让我们以 [Relay Starter Kit](https://github.com/relayjs/relay-starter-kit) 为基础，快速开始一个项目吧。

```
git clone https://github.com/relayjs/relay-starter-kit.git relay-treasurehunt
cd relay-treasurehunt
npm install
```

## 简单数据库

我们需要一块能藏起宝藏的地方，一种能检查隐藏地点的方法，以及一种能追踪剩余次数的办法。带着这些目的，我们将这些数据保存在内存中(藏在记忆里)。

```
/**
 * ./data/database.js
 */

// Model types
export class Game {}
export class HidingSpot {}

// Mock data
var game = new Game();
game.id = '1';

var hidingSpots = [];
(function() {
  var hidingSpot;
  var indexOfSpotWithTreasure = Math.floor(Math.random() * 9);
  for (var i = 0; i < 9; i++) {
    hidingSpot = new HidingSpot();
    hidingSpot.id = `${i}`;
    hidingSpot.hasTreasure = (i === indexOfSpotWithTreasure);
    hidingSpot.hasBeenChecked = false;
    hidingSpots.push(hidingSpot);
  }
})();

var turnsRemaining = 3;

export function checkHidingSpotForTreasure(id) {
  if (hidingSpots.some(hs => hs.hasTreasure && hs.hasBeenChecked)) {
    return;
  }
  turnsRemaining--;
  var hidingSpot = getHidingSpot(id);
  hidingSpot.hasBeenChecked = true;
};
export function getHidingSpot(id) {
  return hidingSpots.find(hs => hs.id === id)
}
export function getGame() { return game; }
export function getHidingSpots() { return hidingSpots; }
export function getTurnsRemaining() { return turnsRemaining; }
```


刚才我们写了一个假的数据库接口，可以认为现在就是连接着真的数据库，好让我们继续往下走。

## 授权一个 schema

GraphQL schema 描述了你的数据模型，以及提供了一个 GraphQL 服务器， 该服务器配有一套知道如何获取数据的 resolve方法。我们将使用 [graphql-js](https://github.com/graphql/graphql-js) 和 [graphql-relay-js](https://github.com/graphql/graphql-relay-js) 来构建 schema 。

让我们解开 kit 里的 schema，用我们刚才写的替换里面的数据库导入操作：

```
/**
 * ./data/schema.js
 */

/* ... */

import {
  Game,
  HidingSpot,
  checkHidingSpotForTreasure,
  getGame,
  getHidingSpot,
  getHidingSpots,
  getTurnsRemaining,
} from './database';
```

你可以删掉 `./data/schema.js` 里除了 `queryType` 部分的代码。

接下来，我们将定义一个节点接口和类型。我们只需要为 Relay 提供一种能够遍历 object 的方法，例如从一个 object 到一个与之关联的 GraphQL 类型，一个全局的 ID 到这个 ID 指向的 object：

```
var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Game') {
      return getGame(id);
    } else if (type === 'HidingSpot') {
      return getHidingSpot(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Game) {
      return gameType;
    } else if (obj instanceof HidingSpot)  {
      return hidingSpotType;
    } else {
      return null;
    }
  }
);
```

然后，让我们定义游戏和隐藏点的类型，以及它们各自可用的字段。

```
var gameType = new GraphQLObjectType({
  name: 'Game',
  description: 'A treasure search game',
  fields: () => ({
    id: globalIdField('Game'),
    hidingSpots: {
      type: hidingSpotConnection,
      description: 'Places where treasure might be hidden',
      args: connectionArgs,
      resolve: (game, args) => connectionFromArray(getHidingSpots(), args),
    },
    turnsRemaining: {
      type: GraphQLInt,
      description: 'The number of turns a player has left to find the treasure',
      resolve: () => getTurnsRemaining(),
    },
  }),
  interfaces: [nodeInterface],
});

var hidingSpotType = new GraphQLObjectType({
  name: 'HidingSpot',
  description: 'A place where you might find treasure',
  fields: () => ({
    id: globalIdField('HidingSpot'),
    hasBeenChecked: {
      type: GraphQLBoolean,
      description: 'True if this spot has already been checked for treasure',
      resolve: (hidingSpot) => hidingSpot.hasBeenChecked,
    },
    hasTreasure: {
      type: GraphQLBoolean,
      description: 'True if this hiding spot holds treasure',
      resolve: (hidingSpot) => {
        if (hidingSpot.hasBeenChecked) {
          return hidingSpot.hasTreasure;
        } else {
          return null;  // Shh... it's a secret!
        }
      },
    },
  }),
  interfaces: [nodeInterface],
});
```

因为一局游戏中，可以有许多隐藏地点，所以我们需要创建一个链接来将它们关联起来。

```
var {connectionType: hidingSpotConnection} =
  connectionDefinitions({name: 'HidingSpot', nodeType: hidingSpotType});
```

现在，就让我们把这些类型和根查询类型关联起来。

```
var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  }),
});
```

在此方法之外的查询，我们在 我们仅有的 mutation 里开始：就是花一次机会来检查一个藏宝点。在这里，我们为 mutation (用来检查宝藏的点的ID)定义一个输入，和一个在 mutation 发生时，客户端可能会去更新的所有可能的字段的列表。最后，我们将实现一个方法，来执行潜在的 mutation。


```
var CheckHidingSpotForTreasureMutation = mutationWithClientMutationId({
  name: 'CheckHidingSpotForTreasure',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    hidingSpot: {
      type: hidingSpotType,
      resolve: ({localHidingSpotId}) => getHidingSpot(localHidingSpotId),
    },
    game: {
      type: gameType,
      resolve: () => getGame(),
    },
  },
  mutateAndGetPayload: ({id}) => {
    var localHidingSpotId = fromGlobalId(id).id;
    checkHidingSpotForTreasure(localHidingSpotId);
    return {localHidingSpotId};
  },
});
```

让我们把刚创建的 mutation 和根 mutation 类型联系起来：

```
var mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    checkHidingSpotForTreasure: CheckHidingSpotForTreasureMutation,
  }),
});
```

最后，构造并导出我们的 schema(开始查询类型就是我们之前定义的)：

```
export var Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
});
```

## 处理 schema

在继续教程之前，需要利用 Relay.QL transpiler 将 schema 序列化为 Relay 能够使用的 JSON。跟着命令行，然后启动服务：

```
npm run update-schema
npm start
```

## 编写游戏

让我们改进一下 `./js/routes/AppHomeRoute.js` 这个文件，使它把游戏关联到 schema 的 `game` 的根字段：

```
export default class extends Relay.Route {
  static path = '/';
  static queries = {
    game: () => Relay.QL`query { game }`,
  };
  static routeName = 'AppHomeRoute';
}
```

接下来，让我们新建一个 `./js/mutations/CheckHidingSpotForTreasureMutation.js` 的文件，并创建一个 `Relay.Mutation` 的子类，名为 `CheckHidingSpotForTreasureMutation`，用来完成 mutation 的实现：


```
import Relay from 'react-relay';

export default class CheckHidingSpotForTreasureMutation extends Relay.Mutation {
  static fragments = {
    game: () => Relay.QL`
      fragment on Game {
        id,
        turnsRemaining,
      }
    `,
    hidingSpot: () => Relay.QL`
      fragment on HidingSpot {
        id,
      }
    `,
  };
  getMutation() {
    return Relay.QL`mutation{checkHidingSpotForTreasure}`;
  }
  getCollisionKey() {
    return `check_${this.props.game.id}`;
  }
  getFatQuery() {
    return Relay.QL`
      fragment on CheckHidingSpotForTreasurePayload {
        hidingSpot {
          hasBeenChecked,
          hasTreasure,
        },
        game {
          turnsRemaining,
        },
      }
    `;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        hidingSpot: this.props.hidingSpot.id,
        game: this.props.game.id,
      },
    }];
  }
  getVariables() {
    return {
      id: this.props.hidingSpot.id,
    };
  }
  getOptimisticResponse() {
    return {
      game: {
        turnsRemaining: this.props.game.turnsRemaining - 1,
      },
      hidingSpot: {
        id: this.props.hidingSpot.id,
        hasBeenChecked: true,
      },
    };
  }
}
```

最后，将所有文件在 `./js/components/App.js` 集合：

```
import CheckHidingSpotForTreasureMutation from '../mutations/CheckHidingSpotForTreasureMutation';

class App extends React.Component {
  _getHidingSpotStyle(hidingSpot) {
    var color;
    if (this.props.relay.hasOptimisticUpdate(hidingSpot)) {
      color = 'lightGrey';
    } else if (hidingSpot.hasBeenChecked) {
      if (hidingSpot.hasTreasure) {
        color = 'blue';
      } else {
        color = 'red';
      }
    } else {
      color = 'black';
    }
    return {
      backgroundColor: color,
      cursor: this._isGameOver() ? null : 'pointer',
      display: 'inline-block',
      height: 100,
      marginRight: 10,
      width: 100,
    };
  }
  _handleHidingSpotClick(hidingSpot) {
    if (this._isGameOver()) {
      return;
    }
    this.props.relay.commitUpdate(
      new CheckHidingSpotForTreasureMutation({
        game: this.props.game,
        hidingSpot,
      })
    );
  }
  _hasFoundTreasure() {
    return (
      this.props.game.hidingSpots.edges.some(edge => edge.node.hasTreasure)
    );
  }
  _isGameOver() {
    return !this.props.game.turnsRemaining || this._hasFoundTreasure();
  }
  renderGameBoard() {
    return this.props.game.hidingSpots.edges.map(edge => {
      return (
        <div
          key={edge.node.id}
          onClick={this._handleHidingSpotClick.bind(this, edge.node)}
          style={this._getHidingSpotStyle(edge.node)}
        />
      );
    });
  }
  render() {
    var headerText;
    if (this.props.relay.getPendingTransactions(this.props.game)) {
      headerText = '\u2026';
    } else if (this._hasFoundTreasure()) {
      headerText = 'You win!';
    } else if (this._isGameOver()) {
      headerText = 'Game over!';
    } else {
      headerText = 'Find the treasure!';
    }
    return (
      <div>
        <h1>{headerText}</h1>
        {this.renderGameBoard()}
        <p>Turns remaining: {this.props.game.turnsRemaining}</p>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    game: () => Relay.QL`
      fragment on Game {
        turnsRemaining,
        hidingSpots(first: 9) {
          edges {
            node {
              hasBeenChecked,
              hasTreasure,
              id,
              ${CheckHidingSpotForTreasureMutation.getFragment('hidingSpot')},
            }
          }
        },
        ${CheckHidingSpotForTreasureMutation.getFragment('game')},
      }
    `,
  },
});
```

在 Relay 仓库的 [`./examples/`](https://github.com/facebook/relay/tree/081b4a3f17dcf/examples) 目录下，有这个寻宝游戏的副本。

学完这篇教程后，我们将会深入了解构建一个 GraphQL 客户端框架到底意味着什么，以及如何将它与更多的为客户端搭建的 REST 系统作比较。
