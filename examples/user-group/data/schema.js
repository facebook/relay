import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import {
  Viewer,
  Role,
  User,
  getViewer,
  getRole,
  getUser,
  createUser,
  addUserRole,
  removeUserRole,
} from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Viewer') {
      return getViewer();
    } else if (type === 'Role') {
      return getRole(id);
    } else if (type === 'User') {
      return getUser(id);
    } else {
      return null;
    }
  },
  (obj) => {
    if (obj instanceof Viewer) {
      return GraphQLViewer;
    } else if (obj instanceof Role) {
      return GraphQLRole;
    } else if (obj instanceof User) {
      return GraphQLUser;
    } else {
      return null;
    }
  }
);

var GraphQLUser = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app.',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
      description: 'A person\'s name.',
    },
    roles: {
      type: RoleConnection,
      description: 'A person\'s list of labor inputs.',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(
        _.roles.map(id => getRole(id)),
        args
      ),
    },
  }),
  interfaces: [nodeInterface],
});

var {
  connectionType: UserConnection,
  edgeType: GraphQLUserEdge
} = connectionDefinitions({
  name: 'User',
  nodeType: GraphQLUser,
});

var GraphQLRole = new GraphQLObjectType({
  name: 'Role',
  description: 'A labor input.',
  fields: {
    id: globalIdField('Role'),
    name: {
      type: GraphQLString,
      description: 'A labor input\'s name.',
    },
    users: {
      type: UserConnection,
      description: 'A labor input\'s list of users.',
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(
        _.users.map(id => getUser(id)),
        args
      ),
    },
  },
  interfaces: [nodeInterface],
});

var {
  connectionType: RoleConnection,
  edgeType: GraphQLRoleEdge
} = connectionDefinitions({
  name: 'Role',
  nodeType: GraphQLRole,
});

var GraphQLViewer = new GraphQLObjectType({
  name: 'Viewer',
  description: 'A root-level client wrapper.',
  fields: {
    id: globalIdField('Viewer'),
    roles: {
      type: RoleConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(
        _.roles.map(id => getRole(id)),
        args
      ),
    },
    users: {
      type: UserConnection,
      args: connectionArgs,
      resolve: (_, args) => connectionFromArray(
        _.users.map(id => getUser(id)),
        args
      ),
    },
  },
  interfaces: [nodeInterface],
});

var Root = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: GraphQLViewer,
      resolve: () => getViewer(),
    },
    node: nodeField,
  },
});

var GraphQLNewUserMutation = mutationWithClientMutationId({
  name: 'NewUser',
  inputFields: {
    userName: {
      type: new GraphQLNonNull(GraphQLString)
    }
  },
  outputFields: {
    userEdge: {
      type: GraphQLUserEdge,
      resolve: ({localUserId}) => {
        var viewer = getViewer();
        var user = getUser(localUserId);
        return {
          cursor: cursorForObjectInConnection(
            viewer.users.map(id => getUser(id)),
            user
          ),
          node: user,
        };
      }
    },
    viewer: {
      type: GraphQLViewer,
      resolve: () => getViewer(),
    }
  },
  mutateAndGetPayload: ({userName}) => {
    var localUserId = createUser(userName);
    return {localUserId};
  }
});

var GraphQLAddUserRoleMutation = mutationWithClientMutationId({
  name: 'AddUserRole',
  inputFields: {
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    roleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    userEdge: {
      type: GraphQLUserEdge,
      resolve: ({localRoleId, localUserId}) => {
        var role = getRole(localRoleId);
        var user = getUser(localUserId);
        return {
          cursor: cursorForObjectInConnection(
            role.users.map(id => getUser(id)),
            user
          ),
          node: user,
        };
      }
    },
    roleEdge: {
      type: GraphQLRoleEdge,
      resolve: ({localRoleId, localUserId}) => {
        var role = getRole(localRoleId);
        var user = getUser(localUserId);
        return {
          cursor: cursorForObjectInConnection(
            user.roles.map(id => getRole(id)), 
            role
          ),
          node: role,
        };
      }
    },
    user: {
      type: GraphQLUser,
      resolve: ({localUserId}) => getUser(localUserId),
    },
    role: {
      type: GraphQLRole,
      resolve: ({localRoleId}) => getRole(localRoleId),
    },
  },
  mutateAndGetPayload: ({userId, roleId}) => {
    var localUserId = fromGlobalId(userId).id;
    var localRoleId = fromGlobalId(roleId).id;
    addUserRole(localUserId, localRoleId);
    return { localUserId, localRoleId };
  }
});

var GraphQLRemoveUserRoleMutation = mutationWithClientMutationId({
  name: 'RemoveUserRole',
  inputFields: {
    userId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    roleId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  outputFields: {
    user: {
      type: GraphQLUser,
      resolve: ({localUserId}) => getUser(localUserId),
    },
    role: {
      type: GraphQLRole,
      resolve: ({localRoleId}) => getRole(localRoleId),
    },
    removedUserID: {
      type: GraphQLID,
      resolve: ({localUserId}) => localUserId,
    },
    removedRoleID: {
      type: GraphQLID,
      resolve: ({localRoleId}) => localRoleId,
    },
  },
  mutateAndGetPayload: ({userId, roleId}) => {
    var localUserId = fromGlobalId(userId).id;
    var localRoleId = fromGlobalId(roleId).id;
    removeUserRole(localUserId, localRoleId);
    return { localUserId, localRoleId };
  }
});

var Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    newUser: GraphQLNewUserMutation,
    addUserRole: GraphQLAddUserRoleMutation,
    removeUserRole: GraphQLRemoveUserRoleMutation,
  })
});

export var Schema = new GraphQLSchema({
  query: Root,
  mutation: Mutation
});
