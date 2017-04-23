export class Viewer extends Object {}
export class User extends Object {}
export class Role extends Object {}

// Mock authenticated ID
const VIEWER_ID = 'me';

// Mock data
var busquets = Object.assign(
  new User(), {
    id: '1',
    name: 'Sergio Busquets',
    roles: ['2']
  }
);
var rakitic = Object.assign(
  new User(), {
    id: '2',
    name: 'Ivan Rakitic',
    roles: ['2']
  }
);
var iniesta = Object.assign(
  new User(), {
    id: '3',
    name: 'Andres Iniesta',
    roles: ['2','3']
  }
);
var alves = Object.assign(
  new User(), {
    id: '4',
    name: 'Dani Alves',
    roles: ['1'],
  }
);
var roberto = Object.assign(
  new User(), {
    id: '5',
    name: 'Sergi Roberto',
    roles: ['1','2'],
  }
);
var mathieu = Object.assign(
  new User(), {
    id: '6',
    name: 'Jeremy Mathieu',
    roles: ['1','2'],
  }
);
var mascherano = Object.assign(
  new User(), {
    id: '7',
    name: 'Javier Mascherano',
    roles: ['1','2']
  }
);
var suarez = Object.assign(
  new User(), {
    id: '8',
    name: 'Luis Suarez',
    roles: ['3'],
  }
);
var messi = Object.assign(
  new User(), {
    id: '9',
    name: 'Lionel Messi',
    roles: ['3'],
  }
);
var neymar = Object.assign(
  new User(), {
    id: '10',
    name: 'Neymar',
    roles: ['3'],
  }
);

var defender = Object.assign(
  new Role(), {
    id: '1',
    name: 'Defender',
    users: ['4','5','6','7']
  }
);
var midfielder = Object.assign(
  new Role(), {
    id: '2',
    name: 'Midfielder',
    users: ['1','2','3','5','6','7']
  }
);
var forward = Object.assign(
  new Role(), {
    id: '3',
    name: 'Forward',
    users: ['3','8','9','10']
  }
);

var data = {
  User: {
    1: busquets,
    2: rakitic,
    3: iniesta,
    4: alves,
    5: roberto,
    6: mathieu,
    7: mascherano,
    8: suarez,
    9: messi,
    10: neymar,
  },
  Role: {
    1: defender,
    2: midfielder,
    3: forward,
  },
};

var viewer = Object.assign(
  new Viewer(), {
    id: VIEWER_ID,
    users: Object.keys(data.User),
    roles: Object.keys(data.Role),
  }
);

export function getViewer () {
  return viewer;
}

export function getUser (id) {
  return data.User[id];
}

export function getRole (id) {
  return data.Role[id];
}

var nextUserId = 10;
export function createUser(userName) {
  var newUser = Object.assign(new User(), {
    id: `${nextUserId += 1}`,
    name: userName,
    roles: [],
  });
  viewer.users.push(newUser.id);
  data.User[newUser.id] = newUser;
  return newUser.id;
}

export function addUserRole (userId, roleId) {
  var user = getUser(userId);
  var role = getRole(roleId);
  var roleIndex = user.roles.indexOf(roleId);
  var userIndex = role.users.indexOf(userId);

  if (roleIndex > -1 && userIndex > -1) {
    return console.error(`User ${userId} and role ${roleId} already connected.`);
  }
  user.roles.push(roleId);
  role.users.push(userId);
  return {user, role};
}

export function removeUserRole (userId, roleId) {
  var user = getUser(userId);
  var role = getRole(roleId);
  var roleIndex = user.roles.indexOf(roleId);
  var userIndex = role.users.indexOf(userId);

  if (roleIndex === -1 || userIndex === -1) {
    return console.error(`User ${userId} and role ${roleId} not connected.`);
  }
  user.roles.splice(roleIndex, 1);
  role.users.splice(userIndex, 1);
  return {user, role};
}
