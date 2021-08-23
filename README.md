# [Relay](https://relay.dev) &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/facebook/relay/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/react-relay.svg??style=flat)](https://www.npmjs.com/package/react-relay)

Relay is a JavaScript framework for building data-driven React applications.

* **Declarative:** Never again communicate with your data store using an imperative API. Simply declare your data requirements using GraphQL and let Relay figure out how and when to fetch your data.
* **Colocation:** Queries live next to the views that rely on them, so you can easily reason about your app. Relay aggregates queries into efficient network requests to fetch only what you need.
* **Mutations:** Relay lets you mutate data on the client and server using GraphQL mutations, and offers automatic data consistency, optimistic updates, and error handling.

[See how to use Relay in your own project](https://relay.dev/docs/en/introduction-to-relay).

## Example

The [relay-examples](https://github.com/relayjs/relay-examples) repository contains an implementation of [TodoMVC](http://todomvc.com/). To try it out:

```
git clone https://github.com/relayjs/relay-examples.git
cd relay-examples/todo
yarn
yarn build
yarn start
```

Then, just point your browser at `http://localhost:3000`.

## Contribute

We actively welcome pull requests, learn how to [contribute](./.github/CONTRIBUTING.md).

## Users

We have a [community-maintained list](https://relay.dev/users/) of people and projects using Relay in production.

## License

Relay is [MIT licensed](./LICENSE).

## Thanks

We'd like to thank [the contributors](https://github.com/facebook/relay/graphs/contributors) that helped make Relay in open source possible.

The open source project [`relay-hooks`](https://github.com/relay-tools/relay-hooks) allowed the community to experiment with Relay and React Hooks, and was a source of valuable feedback for us. The idea for the `useSubscription` hook originated in [an issue](https://github.com/relay-tools/relay-hooks/issues/5#issuecomment-603930570) on that repo. Thank you @morrys for driving this project and for playing such an important role in our open source community.

Thank you for helping make this possible!
