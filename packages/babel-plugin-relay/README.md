babel-plugin-relay
---

Relay requires a Babel plugin to convert GraphQL tags to runtime artifacts.


A *very* simplified example of what this plugin is doing:

```js

// It converts this code
const fragment = graphql`
  fragment User_fragment on User {
    name
  }
`;

// To require generated ASTs for fragments and queries
const fragment = require('__generated__/User_fragment.graphql');
```


[Configuration Instructions](
https://relay.dev/docs/getting-started/installation-and-setup/#set-up-babel-plugin-relay)
