# Relay Example App

This directory contains an entire example app demonstrating end-to-end use of Relay. It aims to model the patterns and best practices that we recommend for building a Relay both in terms of client architecture and server implementation. To that end it's not simply an example of Relay, but rather an encoding of best practices for building with GraphQL.

## Goals

While this app is still new, and may not yet live up to all of these goals, our ambition is to create an example app that is:

* **Realistic**: The example should demonstrate a realistic app that uses Relay to fetch and update data. Use of Relay features should not be contrived simply to demonstrate their use, but should be used in a context where they make sense.
* **Exemplary**: The example should demonstrate best practices for using Relay, including how to structure your app, how to architect a server, and how to manage data updates.
* **Complete**: Ideally all major features of Relay should be demonstrated in the app, including pagination, mutations, subscriptions, and optimistic updates.
* **Documented**: The code should be thoroughly covered with educational comments explaining the role of each piece of code and how it fits into the overall architecture.
* **Aligned**: The example should demonstrate how to build a GraphQL app that is aligned with industry norms, and should not over-fit to Meta specific use cases or technologies.

In addition to providing an example app for Relay users to reference, this example will also serve as a playground for those working on Relay to validate new features in a realistic, non-Meta context.

## Running the Example

To run the example, first install the dependencies:

```sh
cd relay/example
yarn
```

Then start the server:

```sh
cd relay/example/server
yarn start
```

And start the client:

```sh
cd relay/example/client
yarn dev
```

## TODO

- [ ] Ensure TypeScript type checking works and that the Relay types are pulled in
- [ ] Ensure Prettier is enabled
- [ ] Enable Relay's lint rules for detecting unused fields and unused fragments
- [ ] Add VSCode configuration for the Relay VSCode extension
    - [ ] Enable click to definition from fields/types to their Grats' definitions
