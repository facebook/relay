# Relay Mongoose example

## Folders and files

### js
React components and entry point to the app.

### data
Models and schema for graphql

## Scripts
You can find some scripts in the package.json:
* `npm start` Is the default that comes with the relay-kit and starts the server
* `npm run update-schema` generates the associated schema file from the one we will code.
* `npm run restart` will run `npm run update-schema` and then `npm start`
* `npm run print-schema` Will print the schema in the console and generate a .graphql file in the data folder called *printedSchema.graphql*
* `npm run print-instrospection` the same than above but with introspection.
* `npm run populate` will fill with mock data your MongoDB using mongoose.

> Disclaimer: Info contained in the population script could not be accurate

## The schema
The schema we will use is the following (you can print it too using `npm run print-schema`):

```graphql
type Hobby implements Node {
  id: ID!
  title: String
  description: String
  type: String!
}

interface Node {
  id: ID!
  type: String!
}

type RootMutation {
  addUser(name: String!, surname: String!, age: Int, hobbies: [ID], friends: [ID]): User
  updateUser(id: ID, name: String, surname: String, age: Int): User
  addHobby(title: String!, description: String!): Hobby
  updateHobby(id: ID!, title: String, description: String): Hobby
}

type RootQuery {
  user(id: ID): User
  users: [User]
  hobby(id: ID): Hobby
  hobbies: [Hobby]
  node(id: ID!): Node
}

type User implements Node {
  id: ID!
  name: String
  surname: String
  age: Int
  hobbies: [Hobby]
  friends: [User]
  type: String!
}

```
As you can see, there is a hobby and user types that implements the node interface. Then you can find 5 queries:

### Queries
1. **`user(id: ID): User`** that needs the MongoDB *_id* as id parameter to recover that particular user.
2. **`users: [User]`** that returns the array of users in the ddbb
3. **`hobby(id: ID): Hobby`** returns a hobby by its ID
4. **`hobbies: [Hobby]`** returns the list of hobbies
5. **`node(id: ID!): Node`** returns a node, user or hobby, of the corresponding ID. Node will only return common parameters so
the following query:
```graphql
query query {
	node(id:"55ddeec2a54c37e61e0a2122") {
    	id
        type
    }
}
```
Will return
```json
{
    "data": {
        "node": {
            "id": "55ddeec2a54c37e61e0a2121",
            "type": "user"
        }
    }
}
```
In this case, I'm storing the type in the ddbb too. If you want to query a result via node, you have to use fragments to retrieve the rest of the info:

```graphql
query query {
	node(id:"55ddeec2a54c37e61e0a2122") {
    	id
      type
      ...user
    }
}

fragment user on User {
	name
    surname
}
```

Will return

```json
{
    "data": {
        "node": {
            "id": "55ddeec2a54c37e61e0a2121",
            "type": "user",
            "name": "Tim",
            "surname": "Berners-Lee"
        }
    }
}
```

### Mutations
1. **`addUser(name: String!, surname: String!, age: Int): User`** adds a user and accepts the 3 params:
  * *`name`* as non null(!) string. For example: `"Linus"`
  * *`surname`*  as non null string. For example: `"Torvalds"`
  * *`age`* as optional int. For example: `30`
2. **`updateUser(id: ID, name: String, surname: String, age: Int): User`**
3. **`addHobby(title: String!, description: String!): Hobby`**
4. **`updateHobby(id: ID!, title: String, description: String): Hobby`**

## Writing the schema

### Node interface
The node interface defines the common parameters for any "node" (user or hobby) of the app: id and type:
```javascript
let Node = new GraphQLInterfaceType({
  name:'Node',
  description:'An object with an ID',
  fields: () => ({
    id: {
      type:new GraphQLNonNull(GraphQLID),
      description: 'The global unique ID of an object'
    },
    type: {
      type: GraphQLString,
      description: "The type of the object"
    }
  }),
  resolveType: (obj) => {
    if(obj.type === 'user'){
      return UserType;
    } else if(obj.type === 'hobby') {
      return HobbyType;
    }
  }
});
```
resolveType must return the type of the corresponding fetched object. So if we fetch an object via "node" and it's type is user, here we must return the instance of "UserType".

### User and Hobby types
```javascript
// User
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
    surname:{
      type: GraphQLString
    },
    age:{
      type: GraphQLInt
    },
    hobbies:{
      type: new GraphQLList(HobbyType),
      description: 'The ships used by the faction.'
    },
    type:{
      type: new GraphQLNonNull(GraphQLString)
    }
  }),

  interfaces:[Node]
});
```

Pretty self-explanatory: it is composed for an id, name, surname and age atomic fields. The it has a one to many relationship with hobbies (a user has 0 or more hobbies).

```javascript
//Hobby
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
    description:{
      type: GraphQLString
    },
    type:{
      type: new GraphQLNonNull(GraphQLString)
    }
  }),

  interfaces:[Node]
});
```
Similar. A hobby is composed by an id, a title, a description and a type (always hobby).

### Queries
Now let's define the queries for User and Hobby
```javascript
//User
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
```
As we metioned before, we have 2 queries: user and users.
1. **users** do not accepts arguments and returns a list of users `new GraphQLList(UserType)`. Resolve makes the query on MongoDB using Mongoose and returns the list of users as a Promise.
2. **user** needs one argument: the mongodb id to query. Returns a UserType and it's resolve method returns a promise with the content of the user

```javascript
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
```
Hobbies queries are pretty similar to user queries:
1. **hobbies** do not accepts arguments and returns a list of users `new GraphQLList(HobbyType)`. Resolve makes the query on MongoDB using Mongoose and returns the list of hobbies as a Promise.
2. **hobby** needs one argument: the mongodb id to query. Returns a HobbyType and it's resolve method returns a promise with the content of the hobby

### Mutations
Mutations of user are like follows:
```javascript
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
```
* **addUser** needs minimum a name and surname string fields and accepts as optional "age", a friends list (id's of MongoDB) and a hobbies list (also id's). Returns, of course, a User type.
* **updateUser** needs minimum an id to find the user to update. Then any parameter to updated can be passed as optional.

Now the mutations of hobbies, that are really similar to User.
```javascript
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
```
* **addHobby** Works similarly to the previous addUser. Needs the title and description of the hobby as minimum arguments. It will return the new hobby type as result.
* **updateHobby** Only needs the id of the hobby to update, then you can pass a title or a description (or both) as arguments to update.

## React side

### Declaring RootQuery
```javascript
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
```
RootQuery just needs a name and to define the fields (queries) that will accept. There is where we passed the previous queries that we have code. As you can see, RootQuery is also a GraphQLObjectType like our UserQueries and HobbyQueries.

### Declaring the schema
let schema = new GraphQLSchema({
  query: RootQuery
});

Finally, we create a GraphQLSchema file to pass our queries object

## Server Ready
Let's pass to the client


## Client side
On the client, we will declare our React components, our RootContainer and our Route.

### Route (js/routes/AppHomeRoute.js)
In the route we have to declare 3 things at least:
1. a `static routeName` to simply give our route a name
2. a `static path` to access this route
3. a `static queries` with a Relay.QL query to fetch the object to fill the entire page.

```javascript
class AppHomeRoute extends Relay.Route {
  static path = '/';

  static queries = {
    user: (Component) => Relay.QL `
      query {
        user (id: $userId) {
          ${Component.getFragment('user')}
        }
      }
    `
  };

  static paramDefinitions = { userId: {required: true} };
  static routeName = 'AppHomeRoute';
}

export default AppHomeRoute;
```
* `${Component.getFragment('user')}` This could be the most annoying thing. It asks the component that is configured in the container for the fragment it needs. As you have realized, the route does not need to know what exact fields the component needs. This info is contained in the component.

### RootContainer (js/app.js)

In the RootContainer we render a Relay.RootContainer object configuring two objects and the root id on HTML:
* Component: A component as the parent of every child in the page. In our case, the User component.
* route: A route to query that has the first query to fetch all data.

```javascript
import User from './components/User.js';
import AppHomeRoute from './routes/AppHomeRoute';

React.render(
  <Relay.RootContainer
    Component={User}
    route={new AppHomeRoute({userId: "55ddeec2a54c37e61e0a211c"})}
  />,
  document.getElementById('root')
);

```

### User (js/components/User.js)
Is the main component. Shows the content of the User and uses a HobbyList component to pass the list of hobbies.
```javascript
import HobbyList from './HobbyList.js';

class User extends React.Component {
  render() {
    var user = this.props.user;

    return (
      <div>
        <h1>Hello {user.name} {user.surname}</h1>
        <h2>Hobbies</h2>
        <ul>
        <HobbyList hobbies={user} />
        </ul>
        <h2>Age: {user.age}</h2>
      </div>
    );
  }
}

export default Relay.createContainer(User, {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id
        name
        surname
        age
        ${HobbyList.getFragment('hobbies')}
      }
    `
  }
});
```
The most important thing is the declared fragment named `user` that matches the fragment queried by the route previously. This has few implications:
* Any parent component that wants to use this fragment must call it with this definition `${Component.getFragment('user')}` or `${User.getFragment('user')}`
* This means that the parent that queries this fragment will pass the fragment fetched information in a prop called `user`
* At the same time, this component also uses a fragment within its own fragment `${HobbyList.getFragment('hobbies')}`. So now our route, that was only asking for information about the user will also fetch the info needed by this new fragment **without knowing it!!**

## Final thoughts
You can continue nesting fragments that the parent component will receive via its route in the Root Container. This is the real power of Relay

# Contributions
Please feel free to help, specially with grammar mistakes as english is not my mother language and I learned it watching "Two and a half men" :)

Any other contribution must be on the road of simplicity to understand and to help others to learn Relay. Contributions must have a README file associated or to update this.

##### Contact
Mario C. mariocaster@gmail.com
