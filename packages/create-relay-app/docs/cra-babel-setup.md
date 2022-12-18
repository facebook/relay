The recommended way to use the `graphql` transform in Create React App projects is through the `babel-plugin-relay` macro:

```js
import graphql from "babel-plugin-relay/macro";

const query = graphql`
  query App_Query {
    field
  }
`;
```

There is nothing wrong with this approach, but it can be frustrating if your editor imports `graphql` from the `react-relay` package instead and now suddenly things don't work.

Unfortunately Create React App does not offer a way to configure Babel plugins without ejecting. Fortunately we have some options.

# Ejecting

Yep, you guessed it: Ejecting is the first option.

Ejecting is the easiest and most "official" way to configure Babel plugins for Create React App projects. But it also comes with a cost, since you loose all of the convenience of Create React App.

If you want to go ahead regardless, follow the official tutorial on ejecting: https://create-react-app.dev/docs/available-scripts/#npm-run-eject

Once you have ejected, locate the `./config/webpack.config.js` file.

Now search for `plugins` until you find a section that looks similar to the following:

```js
plugins: [isEnvDevelopment && shouldUseReactRefresh && require.resolve("react-refresh/babel")].filter(Boolean);
```

Now simply add the `babel-plugin-relay` plugin:

```diff
plugins: [
+ require.resolve("babel-plugin-relay"),
  isEnvDevelopment &&
    shouldUseReactRefresh &&
    require.resolve("react-refresh/babel"),
].filter(Boolean);
```

Now you should be able to import `graphql` from `react-relay`, like you are supposed to:

```js
import { graphql } from "react-relay";

const query = graphql`
  query App_Query {
    field
  }
`;
```

# Craco

Another option is to use a tool like [craco](https://github.com/dilanx/craco) to configure Babel plugins without ejecting.

First, install craco as shown here: https://github.com/dilanx/craco/blob/master/packages/craco/README.md#installation

Next create a `craco.config.js` file at the root of your project and add the following code to it:

```js
module.exports = {
  babel: {
    plugins: ["babel-plugin-relay"],
  },
};
```

Now you should be able to import `graphql` from `react-relay`, like you are supposed to:

```js
import { graphql } from "react-relay";

const query = graphql`
  query App_Query {
    field
  }
`;
```
