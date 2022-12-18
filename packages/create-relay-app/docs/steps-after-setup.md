After you have [run the script](../README.md#usage), there are still some manual steps you need to take to finish the Relay setup (they are also printed to the console).

### 1. Replace the GraphQL schema file

If you haven't already done so, grab the schema (SDL) of your GraphQL server and place it in the `.graphql` file you specified when running the script. You can also find the location of the schema file by opening your `package.json` file and inspecting the `relay.schema` property.

### 2. Specify the endpoints of your GraphQL server

Open the `RelayEnvironment` file that was created by the script.

At the top you should see a `HTTP_ENDPOINT` variable. Switch the value to the URL of your GraphQL server, where you want to send queries and mutations to.

If you have choosen to configure subscriptions, there will also be a `WEBSOCKET_ENDPOINT` variable. Point it to the URL of your GraphQL server, where you want to send subscriptions to (must be a WebSocket URL).

### 3. Ensure that your tooling does not modify Relay's artifacts

You might have certain tools configured that format or lint your code. Relay's artifact should not be modified by these tools or you might get validation errors from the `relay-compiler`.

Make sure your tools ignore `*.graphql.ts` / `*.graphql.js` files.

[Prettier](https://github.com/prettier/prettier) for example has a [`.prettierignore`](https://prettier.io/docs/en/ignore.html#ignoring-files-prettierignore) file and [ESLint](https://github.com/eslint/eslint) a [`.eslintignore`](https://eslint.org/docs/latest/user-guide/configuring/ignoring-code#the-eslintignore-file) file.

> Note: If you are using GIT, the script will already fix the line ending of Relay artifacts to `LF` using a `.gitattributes` file.

### Create-React-App

If you are using Create-React-App, you need to remember to import `graphql` from `babel-plugin-relay/macro` instead of `react-relay` or any other package exporting it:

```typescript
import graphql from "babel-plugin-relay/macro";

const query = graphql`
    query App_Query {
        # ...
    }
`;
```

If you wish to stick to importing from `react-relay`, there are some other options you can explore [here](./cra-babel-setup.md).

### Next.js

If you are using Next.js and you want to do server-side rendering with Relay, check out [this guide](./next-data-fetching.md).
