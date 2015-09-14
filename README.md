# [Relay](https://facebook.github.io/relay/) [![Build Status](https://travis-ci.org/facebook/relay.svg)](https://travis-ci.org/facebook/relay) [![npm version](https://badge.fury.io/js/react-relay.svg)](http://badge.fury.io/js/react-relay)

Relay is a JavaScript framework for building data-driven React applications.

* **Declarative:** Never again communicate with your data store using an imperative API. Simply declare your data requirements using GraphQL and let Relay figure out how and when to fetch your data.
* **Colocation:** Queries live next to the views that rely on them, so you can easily reason about your app. Relay aggregates queries into efficient network requests to fetch only what you need.
* **Mutations:** Relay lets you mutate data on the client and server using GraphQL mutations, and offers automatic data consistency, optimistic updates, and error handling.

[Learn how to use Relay in your own project.](https://facebook.github.io/relay/docs/getting-started.html)

## Example

The repository comes with an implementation of [TodoMVC](http://todomvc.com/). To try it out:

```
git clone https://github.com/facebook/relay.git
cd relay/examples/todo && npm install
npm start
```

Then, just point your browser at `http://localhost:3000`.

## Contribute

We actively welcome pull requests, learn how to [contribute](./CONTRIBUTING.md).

## License

Relay is [BSD licensed](./LICENSE). We also provide an additional [patent grant](./PATENTS).
