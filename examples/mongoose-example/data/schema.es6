import User from './Models/UserSchema.es6';
import Hobby from './Models/HobbySchema.es6';

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInterfaceType,
  GraphQLString,
  GraphQLInt
  } from 'graphql';


let Node = new GraphQLInterfaceType({
  name: 'Node',
  description: 'An object with an ID',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The global unique ID of an object'
    },
    type: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The type of the object"
    }
  }),
  resolveType: (obj) => {
    if (obj.type === 'user') {
      return UserType;
    } else if (obj.type === 'hobby') {
      return HobbyType;
    }
  }
});

let HobbyType = new GraphQLObjectType({
  name: 'Hobby',
  description: 'A hobby',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    title: {
      type: GraphQLString
    },
    description: {
      type: GraphQLString
    },
    type: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),

  interfaces: [Node]
});

let UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    name: {
      type: GraphQLString
    },
    surname: {
      type: GraphQLString
    },
    age: {
      type: GraphQLInt
    },
    hobbies: {
      type: new GraphQLList(HobbyType),
      description: 'The ships used by the faction.'
    },
    friends: {
      type: new GraphQLList(UserType)
    },
    type: {
      type: new GraphQLNonNull(GraphQLString)
    }
  }),

  interfaces: [Node]
});

let nodeField = {
  name: 'Node',
  type: Node,
  description: 'A node interface field',
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Id of node interface'
    }
  },
  resolve: (obj, {id}) => {
    return User.getUserById(obj, {id: id})
      .then((user) => {
        return user ? user : Hobby.getHobbyById(obj, {id: id});
      }).then((hobby) => {
        return hobby;
      });
  }
};

let UserQueries = {
  users: {
    type: new GraphQLList(UserType),
    name: 'users',
    description: 'A user list',
    resolve: User.getListOfUsers
  },
  user: {
    type: UserType,
    args: {
      id: {
        type: GraphQLID
      }
    },
    resolve: User.getUserById
  }
};

let HobbyQueries = {
  hobby: {
    type: HobbyType,
    args: {
      id: {
        type: GraphQLID
      }
    },
    resolve: Hobby.getHobbyById
  },

  hobbies: {
    type: new GraphQLList(HobbyType),
    resolve: Hobby.getListOfHobbies
  }
};

let UserMutations = {
  addUser: {
    type: UserType,
    args: {
      name: {
        name: 'name',
        type: new GraphQLNonNull(GraphQLString)
      },
      surname: {
        name: 'surname',
        type: new GraphQLNonNull(GraphQLString)
      },
      age: {
        name: 'age',
        type: GraphQLInt
      },
      hobbies: {
        name: 'hobbies',
        type: new GraphQLList(GraphQLID)
      },
      friends: {
        name: 'friends',
        type: new GraphQLList(GraphQLID)
      }
    },
    resolve: User.addUser,
    resolveType: UserType
  },
  updateUser: {
    type: UserType,
    args: {
      id: {
        name: 'id',
        type: GraphQLID
      },
      name: {
        name: 'name',
        type: GraphQLString
      },
      surname: {
        name: 'surname',
        type: GraphQLString
      },
      age: {
        name: 'age',
        type: GraphQLInt
      }
    },
    resolve: User.updateUser,
    resolveType: UserType
  }
};

let HobbyMutations = {
  addHobby: {
    type: HobbyType,
    args: {
      title: {
        name: 'title',
        type: new GraphQLNonNull(GraphQLString)
      },
      description: {
        name: 'description',
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    resolve: Hobby.addHobby,
    resolveType: HobbyType
  },
  updateHobby: {
    type: HobbyType,
    args: {
      id: {
        name: 'id',
        type: new GraphQLNonNull(GraphQLID)
      },
      title: {
        name: 'title',
        type: GraphQLString
      },
      description: {
        name: 'description',
        type: GraphQLString
      }
    },
    resolve: Hobby.updateHobby,
    resolveType: HobbyType
  }
};

let RootQuery = new GraphQLObjectType({
  name: 'RootQuery',      //Return this type of object

  fields: () => ({
    user: UserQueries.user,
    users: UserQueries.users,
    hobby: HobbyQueries.hobby,
    hobbies: HobbyQueries.hobbies,
    node: nodeField
  })
});


let RootMutation = new GraphQLObjectType({
  name: "RootMutation",

  fields: () => ({
    addUser: UserMutations.addUser,
    updateUser: UserMutations.updateUser,
    addHobby: HobbyMutations.addHobby,
    updateHobby: HobbyMutations.updateHobby
  })
});


let schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});

export default schema;