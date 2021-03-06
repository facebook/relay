import SelectorStoreUpdater from './SelectorStoreUpdater.md';
import CacheConfig from './CacheConfig.md';

#### Type `GraphQLSubscriptionConfig<TSubscriptionPayload>`

* An object with the following fields:
  * ~~`configs`: Deprecated.~~
  * `cacheConfig`: An optional [`CacheConfig`](#type-cacheconfig)
  * `subscription`: `GraphQLTaggedNode`. A GraphQL subscription specified using a `graphql` template literal
  * `variables`: The variables to pass to the subscription
  * `onCompleted`: `?() => void`. An optional callback that is executed when the subscription is established
  * `onError`: `?(Error) => {}`. An optional callback that is executed when an error occurs
  * `onNext`: `?(TSubscriptionPayload) => {}`. An optional callback that is executed when new data is received
  * `updater`: An optional [`SelectorStoreUpdater`](#type-selectorstoreupdater).

<CacheConfig />

<SelectorStoreUpdater />
