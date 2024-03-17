/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {LiveState} from 'relay-runtime';

type Entity = {
  name: string,
  type: string,
  props: {
    battery: string,
  },
};

let HUMAN: Entity = {
  name: 'Alice',
  type: 'human',
  props: {
    battery: '0',
  },
};

let ROBOT: Entity = {
  name: 'Bob',
  type: 'robot',
  props: {
    battery: '0',
  },
};

const subscriptions: Array<() => void> = [];
let isHuman: boolean = true;
/**
 * @RelayResolver Query.mutable_entity: RelayResolverValue
 * @live

 */
function mutable_entity(): LiveState<Entity> {
  return {
    read() {
      return isHuman ? HUMAN : ROBOT;
    },
    subscribe(cb) {
      subscriptions.push(cb);
      return () => {
        subscriptions.filter(x => x !== cb);
      };
    },
  };
}

function setIsHuman(val: boolean): void {
  isHuman = val;
  subscriptions.forEach(x => x());
}

function chargeBattery(): void {
  ROBOT.props.battery = '100';
  subscriptions.forEach(x => x());
}

function resetModels(): void {
  HUMAN = {
    name: 'Alice',
    type: 'human',
    props: {
      battery: '0',
    },
  };
  ROBOT = {
    name: 'Bob',
    type: 'robot',
    props: {
      battery: '0',
    },
  };
}

module.exports = {
  mutable_entity,
  setIsHuman,
  chargeBattery,
  resetModels,
};
