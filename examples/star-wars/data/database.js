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

var rebels = {
  id: '1',
  name: 'Alliance to Restore the Republic',
  ships: ['1', '2', '3', '4', '5']
};

var empire = {
  id: '2',
  name: 'Galactic Empire',
  ships: ['6', '7', '8']
};

var data = {
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

var nextShip = 9;
export function createShip(shipName, factionId) {
  var newShip = {
    id: '' + (nextShip++),
    name: shipName
  };
  data.Ship[newShip.id] = newShip;
  data.Faction[factionId].ships.push(newShip.id);
  return newShip;
}

export function getShip(id) {
  return data.Ship[id];
}

export function getFaction(id) {
  return data.Faction[id];
}

export function getFactions(names) {
  return names.map(name => {
    if (name === 'empire') {
      return empire;
    }
    if (name === 'rebels') {
      return rebels;
    }
    return null;
  });
}
