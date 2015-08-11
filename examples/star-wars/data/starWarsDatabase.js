/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * This defines a basic set of data for our Star Wars Schema.
 *
 * This data is hard coded for the sake of the demo, but you could imagine
 * fetching this data from a backend service rather than from hardcoded
 * JSON objects in a more complex demo.
 */

var xwing = {
  id: '1',
  name: 'X-Wing',
};

var ywing = {
  id: '2',
  name: 'Y-Wing',
};

var awing = {
  id: '3',
  name: 'A-Wing',
};

// Yeah, technically it's Corellian. But it flew in the service of the rebels,
// so for the purposes of this demo it's a rebel ship.
var falcon = {
  id: '4',
  name: 'Millenium Falcon',
};

var homeOne = {
  id: '5',
  name: 'Home One',
};

var tieFighter = {
  id: '6',
  name: 'TIE Fighter',
};

var tieInterceptor = {
  id: '7',
  name: 'TIE Interceptor',
};

var executor = {
  id: '8',
  name: 'Executor',
};

var nextShip = 9;
export function getNewShipId() {
  return '' + (nextShip++);
}

export var rebels = {
  id: '1',
  name: 'Alliance to Restore the Republic',
  ships: ['1', '2', '3', '4', '5']
};

export var empire = {
  id: '2',
  name: 'Galactic Empire',
  ships: ['6', '7', '8']
};

export var data = {
  Faction: {
    1: rebels,
    2: empire
  },
  Ship: {
    1: xwing,
    2: ywing,
    3: awing,
    4: falcon,
    5: homeOne,
    6: tieFighter,
    7: tieInterceptor,
    8: executor
  }
};
