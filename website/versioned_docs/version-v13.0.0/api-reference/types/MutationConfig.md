import CacheConfig from './CacheConfig.md';
import SelectorStoreUpdater from './SelectorStoreUpdater.md';
import UploadableMap from './UploadableMap.md';

#### Type `MutationConfig<TMutationConfig: MutationParameters>`

* An object with the following fields:
  * `cacheConfig`: *_[Optional]_* [`CacheConfig`](#type-cacheconfig)
  * `mutation`: `GraphQLTaggedNode`. A mutation specified using a GraphQL literal
  * `onError`: *_[Optional]_* `(Error) => void`. An optional callback executed if the mutation results in an error.
  * `onCompleted`: *_[Optional]_* `($ElementType<TMutationConfig, 'response'>) => void`. An optional callback that is executed when the mutation completes.
  * `onUnsubscribe`: *_[Optional]_* `() => void`. An optional callback that is executed when the mutation the mutation is unsubscribed, which occurs when the returned `Disposable` is disposed.
  * `optimisticResponse`: *_[Optional]_* An object whose type matches the raw response type of the mutation. Make sure you decorate your mutation with `@raw_response_type` if you are using this field.
  * `optimisticUpdater`: *_[Optional]_* [`SelectorStoreUpdater`](#type-selectorstoreupdater). A callback that is executed when `commitMutation` is called, after the `optimisticResponse` has been normalized into the store.
  * `updater`: *_[Optional]_* [`SelectorStoreUpdater`](#type-selectorstoreupdater). A callback that is executed when a payload is received, after the payload has been written into the store.
  * `uploadables`: *_[Optional]_* [`UploadableMap`](#type-uploadablemap). An optional uploadable map.
  * `variables`: `$ElementType<TMutationConfig, 'variables'>`. The variables to pass to the mutation.

<CacheConfig />

<SelectorStoreUpdater />

<UploadableMap />

#### Type `MutationParameters`

* An object with the following fields:
  * `response`: An object
  * `variables`: An object
  * `rawResponse`: An optional object
