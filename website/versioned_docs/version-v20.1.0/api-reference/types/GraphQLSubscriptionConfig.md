import SelectorStoreUpdater from './SelectorStoreUpdater.md';
import CacheConfig from './CacheConfig.md';

#### Type `GraphQLSubscriptionConfig<TSubscriptionPayload>`

* An object with the following fields:
  * `cacheConfig`: *_[Optional]_* [`CacheConfig`](#type-cacheconfig)
  * `subscription`: `GraphQLTaggedNode`. A GraphQL subscription specified using a `graphql` template literal
  * `variables`: The variables to pass to the subscription
  * `onCompleted`: *_[Optional]_* `() => void`. An optional callback that is executed when the subscription is established
  * `onError`: *_[Optional]_* `(Error) => {}`. An optional callback that is executed when an error occurs
  * `onNext`: *_[Optional]_* `(TSubscriptionPayload) => {}`. An optional callback that is executed when new data is received
  * `updater`: *_[Optional]_* [`SelectorStoreUpdater`](#type-selectorstoreupdater).

<CacheConfig />

<SelectorStoreUpdater />
