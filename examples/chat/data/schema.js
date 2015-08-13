import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
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
  Message,
  User,
  addMessage,
  getMessage,
  getMessages,
  markMessageAsRead,
  getUser,
  getViewer,
} from './database';

var {nodeInterface, nodeField} = nodeDefinitions(
  (globalId) => {
    var {type, id} = fromGlobalId(globalId);
    if (type === 'Message') {
      return getMessage(id);
    } else if (type === 'User') {
      return getUser(id);
    }
    return null;
  },
  (obj) => {
    if (obj instanceof Message) {
      return GraphQLMessage;
    } else if (obj instanceof User) {
      return GraphQLUser;
    }
    return null;
  }
);

var GraphQLMessage = new GraphQLObjectType({
  name: 'Message',
  fields: {
    id: globalIdField('Message'),
    threadID: {
      type: GraphQLString,
      resolve: (obj) => obj.threadID
    },
    threadName: {
      type: GraphQLString,
      resolve: (obj) => obj.threadName
    },
    authorName: {
      type: GraphQLString,
      resolve: (obj) => obj.authorName
    },
    text: {
      type: GraphQLString,
      resolve: (obj) => obj.text
    },
    timestamp: {
      type: GraphQLInt,
      resolve: (obj) => obj.timestamp
    },
    isRead: {
      type: GraphQLBoolean,
      resolve: (obj) => obj.isRead,
    }
  },
  interfaces: [nodeInterface]
});

var {
  connectionType: MessagesConnection,
  edgeType: GraphQLMessageEdge,
} = connectionDefinitions({
  name: 'Message',
  nodeType: GraphQLMessage,
  connectionFields: () => ({
    unreadCount: {
      type: GraphQLInt,
      resolve: (conn) => conn.edges.filter(edge => !edge.node.isRead).length
    },
  })
});

var GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    messages: {
      type: MessagesConnection,
      args: connectionArgs,
      resolve: (obj, args) => connectionFromArray(getMessages(), args),
    }
  },
  interfaces: [nodeInterface]
});

var Root = new GraphQLObjectType({
  name: 'Root',
  fields: {
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer()
    },
    node: nodeField
  },
});

var GraphQLAddMessageMutation = mutationWithClientMutationId({
  name: 'AddMessage',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) },
    currentThreadID: { type: GraphQLString }
  },
  outputFields: {
    MessageEdge: {
      type: GraphQLMessageEdge,
      resolve: ({localMessageId}) => {
        var message = getMessage(localMessageId);
        return {
          cursor: cursorForObjectInConnection(getMessages(), message),
          node: message,
        };
      }
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({text, currentThreadID}) => {
    var localMessageId = addMessage(text, currentThreadID);
    return {localMessageId};
  }
});

var GraphQLMarkMessageAsReadMutation = mutationWithClientMutationId({
  name: 'MarkMessageAsRead',
  inputFields: {
    isRead: { type: new GraphQLNonNull(GraphQLBoolean) },
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    Message: {
      type: GraphQLMessage,
      resolve: ({localMessageId}) => getMessage(localMessageId),
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer(),
    },
  },
  mutateAndGetPayload: ({id, isRead}) => {
    var localMessageId = fromGlobalId(id).id;
    markMessageAsRead(localMessageId, isRead);
    return {localMessageId};
  },
});

var Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addMessage: GraphQLAddMessageMutation,
    markMessageAsRead: GraphQLMarkMessageAsReadMutation
  },
});

export var GraphQLMessageSchema = new GraphQLSchema({
  query: Root,
  mutation: Mutation
});
