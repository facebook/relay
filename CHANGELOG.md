## 0.10.0 (December 12, 2016)

* Update `babel-relay-plugin` to use `graphql@0.8.2`, which supports the latest revision of the GraphQL specification.
* Fix an issue with custom scalar field arguments not printing correctly.
* Promoted `RelayGraphQLMutation` to public API.
* Added `rollback` method to `RelayGraphQLMutation`.
* Added initial preparatory changes for moving to the new Relay API methods in a future release (eg. `BabelPluginGraphQL`).
* Avoid unnecessary un-ready updates.
* Add `graphiqlPrinter` argument to the `RelayNetworkDebug` constructor that can be used to print a link to view the request in GraphiQL.
* Fix problem using "node" as a key in a mutation response payload.

## 0.9.3 (September 1, 2016)

* Fix issue where containers would forget variables previously set with `setVariables`, specifically when using array/object variables (closes [#1357](https://github.com/facebook/relay/issues/1357)).
* Add `Relay.disableQueryCaching` API (closes [#754](https://github.com/facebook/relay/issues/754)), which may be useful running Relay in a server context.
* Suppress spurious warning when using `IGNORE` as a `rangeBehavior` (closes [#1337](https://github.com/facebook/relay/issues/1337)).
* Use a more accurate query name based on current route in `RelayQuery.cloneWithRoute` (see commit [de954992](https://github.com/facebook/relay/commit/de95499215827667b301160588976f2d3355dee6)), making logging and analytics that relies on query names more accurate.
* `RelayNetworkDebug` now prints an estimated request size (see commit [b94ba409](https://github.com/facebook/relay/commit/b94ba409fbe1a12b2d9e389598ea3859d9de1b75)).
* Preserve type information in `callsToGraphQL`/`callsFromGraphQL`, fixing issues with `null` (closes [#1256](https://github.com/facebook/relay/issues/1256)).
* Fix a subtle ordering issue by writing linked IDs before traversing plural linked fields; this solves a rare edge case where data could be written to the wrong ID given a recursive query (see commit [be45692f](https://github.com/facebook/relay/commit/be45692f7c784a30379fef5e49cd376b2a9a0af2)).
* Expose `injectCacheManager` on `RelayEnvironment` (closes [#1320](https://github.com/facebook/relay/pull/1320)).
* Expose `Relay.QueryConfig` (closes [#1279](https://github.com/facebook/relay/pull/1279)).
* Ensure that instances of `GraphQLRange` get correctly deserialized (closes [#1293](https://github.com/facebook/relay/issues/1293)).
* Fix a case where tracked nodes would incorrectly trigger a refetch of plural fields with null linked field children (see commit [5c08fd60](https://github.com/facebook/relay/commit/5c08fd6052be38c905938b71615d117c80843995)).
* Make error-handling consistent between 200 status responses with `errors` attributes and non-200 responses ([#1163](https://github.com/facebook/relay/pull/1163)).
* Warn when producing a diff query involving a `client:` ID, necessitating the use of a path when a refetchable ID would be preferable in order to produce a correct result (commit [928411df](https://github.com/facebook/relay/commit/928412df5605c697281bad433350d88a2ede791c)).

## 0.9.2 (July 11, 2016)

* Added a context property `useFakeData` that you can use to silence the warning when using a `RelayContainer` with fake data.
* You can now interpolate a function that returns an array of fragment references (eg. a route-conditional function) into a `Relay.QL` string. See https://github.com/facebook/relay/issues/896
* Added `RelayStoreData#toJSON`.
* Fixed a bug where the query for a plural field might get diffed out, when in fact there was data missing in the store for which a query should have been produced.

## 0.9.1 (June 24, 2016)

* Added `this.props.relay.pendingVariables` which can be used to access variables from in-flight queries (to e.g. display a component-specific loading spinner).
* Examples are moving from [their former home](https://github.com/facebook/relay/tree/081b4a3f17dcf/examples) inside the main Relay repo into a separate [relay-examples repository](https://github.com/relayjs/relay-examples).
* `npm run update-schema` inside the Relay repo works again.
* Fix a potential race condition in `GraphQLQueryRunner` (only relevant to users of the non-public cache manager API).
* We now show line numbers in the Babel Relay plugin, making it easier to understand transform errors.
* Relaxed validation when using a `rangeBehaviors` function to allow non-string calls.
* `subtractRelayQuery` is removed.
* The printer now knows how to print `Subscription` nodes.
* `RelayNetworkDebug` is won't do anything unless `console.groupCollapsed` is available, because otherwise the output is too noisy to be useful.
* `RelayContainer` now uses more descriptive names for stateless functional components, instead of `Relay(props => ReactElement)`.

## 0.9.0 (May 26, 2016)

* Relay is now built with Babel 6.
* Upgraded the Babel Relay plugin to `graphql-js` 0.6.0. Developers interested in upgrading to `graphql-js` 0.6.0 might have to make some changes to their existing GraphQL schemas. Read the migration guide for more information: https://gist.github.com/steveluscher/ffc1dfefbb10ad280c8a4c520a5c201c
* Debug information detailing every step of a Relay mutation is now printed to the console when `DEV` is true, and `console.groupCollapsed` and `console.groupEnd` are available.
* The `this.props.relay` prop passed into components by `Relay.Container` now exposes `applyUpdate` and `commitUpdate` methods for dispatching mutations in the context of the current `Relay.Environment`.
* `RANGE_DELETE` mutations can now remove multiple nodes from a connection, because `deletedIDFieldName` can now point to a plural field.
* You can now define `rangeBehaviors` as a function that receives the connection arguments and returns one of `GraphQLMutatorConstants.RANGE_OPERATIONS`.
* `RelayNetworkDebug#init` now lets you pass in a `RelayEnvironment` against which you would like to debug. This does not yet allow you to debug more than one environment at a time, but at least you can make the choice of which one.
* `RelayReadyState` now contains an `events` array; a stream of events that can be accessed from a `RelayReadyStateCallback`. You can reduce over this list of events to implement any kind of custom rendering logic you like.
* `this.props.variables` now reflects the variables after being processed with `prepareVariables`. The fact that variables were the un-prepared values was a source of confusion for many.
* Fixed a bug where `prepareVariables` could be called twice, breaking components with non-idempotent `prepareVariables` functions.
* Relay now warns when you try to set a variable using `setVariables`, or produce one through `prepareVariables`, that you have not declared in `initialVariables` upfront.
* It's now possible for the `stale` prop of a `readyState` to change even if there was previously an `error` present.
* Fixed a bug formatting error messages when the error being pointed to starts at column 0.
* A container definition can now optionally include a `shouldComponentUpdate: () => boolean` function. If specified, this function *always* overrides the default implementation (ie. there is no fall-through to the default).

## 0.8.1 (April 27, 2016)

* `RelayNetworkDebug` now logs query variables.
* `RelayNetworkDebug` is now added as a subscriber instead of replacing any existing network layers. It also no longer replaces the global `fetch`.
* `Relay.Environment#injectNetworkLayer` (and, by extension `Relay#injectNetworkLayer`) will now warn if injecting would overwrite a previously injected layer.
* Added experimental low-level `RelayGraphQLMutation` API (still being finalized and not yet documented, so use at your own risk).

## 0.8.0 (April 11, 2016)

* Added a React Native / Relay TodoMVC example app.
* You can now render multiple Relay apps at once, each with their own store. The following APIs are early versions and are as of yet undocumented so please use them with caution.
  * Added `Relay.Environment`. `Relay.Store` is now simply a global instance of `RelayEnvironment`. To create your own isolated store and network subsystem, create a `new RelayEnvironment()` and make use of it wherever `environment` is required.
  * Use `Relay.Environment#injectNetworkLayer` to inject a custom network layer for use within the context of a particular `Relay.Environment` instance.
  * Added `Relay.ReadyStateRenderer`. This component takes in an instance of `Relay.Environment`, a `queryConfig` that conforms to the `RelayQueryConfigInterface`, and a Relay `container`. It renders synchronously based on the supplied `readyState`. This primitive enables you to create alternatives to `Relay.Renderer` that fetch and handle data in a custom way (eg. for server rendered applications).
  * Added `Relay.Renderer` &ndash; a replacement for `Relay.RootContainer` that composes a `Relay.ReadyStateRenderer` and performs data fetching. `Relay.RootContainer` is now a wrapper around `Relay.Renderer` that substitutes `Relay.Store` for `environment`.
* Renamed the Flow type `RelayRendererRenderCallback` to `RelayRenderCallback`.
* Renamed the Flow type `RelayQueryConfigSpec` to `RelayQueryConfigInterface`.
* `RelayContainer.setVariables` will no longer check if the variables are changed before re-running the variables. To prevent extra work, check the current variables before calling `setVariables`.
* You can now roll back mutations in the `COMMIT_QUEUED` state using `RelayMutationTransaction#rollback`.
* When specifying a `NODE_DELETE` or `RANGE_DELETE` mutation config, you can omit `parentID` if your parent, in fact, does not have an ID.
* In cases where you query for a field, but that field is unset in the response, Relay will now write `null` into the store for that field. This allows you to return smaller payloads over the wire by simply omitting a key in the JSON response, rather than to write an explicit `fieldName: null`.
* If the `relay` prop does not change between renders, we now recycle the same object. This should enable you to make an efficient `this.props.relay === nextProps.relay` comparison in `shouldComponentUpdate`.
* You can now craft a connection query having invalid combinations of connection arguments (first/last/after/before) so long as the values of those arguments are variables and not concrete values (eg. `friends(first: $first, last: $last)` will no longer cause the Relay Babel plugin to throw).
* Added runtime validation to mutation configs to help developers to debug their `Relay.Mutation`.
* Added `RelayNetworkDebug`. Invoke `require('RelayNetworkDebug').init(Relay.DefaultNetworkLayer)` to enjoy simple to read logs of your network requests and responses on the console. Substitute your own network layer if you use one.
* Added two new `rangeBehaviors`:
  * `IGNORE` means the range should not be refetched at all.
  * `REFETCH` will refetch the entire connection.
* Connection diff optimization: Enables a mode where Relay skips diffing information about edges that have already been fetched. This can be enabled by adding `@relay(variables: ['variableNames'])` to a connection fragment.

## 0.7.3 (March 4, 2016)

* The instance of Babel that the babel-relay-plugin receives will now be used when making assertions about version numbers.

## 0.7.2 (March 4, 2016)

* Identifying arguments on root fields can now be of any type - boolean, number, string, or array/object of the the same.
* Fixes a bug when we read connections or fragments without allocating a record until we encounter a child field that is not null. We now ensure that we allocate the record for connections and fragments (if it exists) regardless.
* Made babelAdapter compatible with Babel 6.6
* `npm run build` now works on Windows
* Tests now pass when using Node 5 / NPM 3
* Passing an empty array as a prop corresponding to a plural fragment no longer warns about mock data. The empty array is now passed through to the component as-is.
* Removed `uri` from `RelayQueryConfigSpec`. The `uri` property was part of `RelayRoute`, but never `RelayQueryConfig`. This revision simply cleans up the Flow shape in `RelayContainer`.
* RelayRenderer now runs queries after mount to make sure `RelayRenderer` does not run queries during synchronous server-side rendering.

## 0.7.1 (February 18, 2016)

* Having fixed a bug, now you can *actually* interpolate an array of fragments into a `Relay.QL` query. eg. `${containers.map(c => c.getFragment('foo'))}`

## 0.7.0 (February 12, 2016)

* Eliminated a race condition that would cause `RelayGarbageCollector` to fatal when, in the middle of a `readRelayDiskCache` traversal, a container attempts to subscribe to a record not yet registered with the garbage collector.
* The garbage collector now strictly increments references to all subscribed nodes, and strictly decrements references to all previously subscribed nodes, eliminating a class of race condition by ensuring an exact 1:1 correspondence of increment/decrement calls for a given node.
* Replaced `GraphQLStoreDataHandler` with `RelayRecord`, and added the `RelayRecord#isRecord` method.
* Introduced `RelayQueryIndexPath` which tracks fragment indexes to the nearest parent field during query traversal. This replaces the existing logic used to generate field serialization keys.
* Added `RelayContext`, a step toward making all Relay state contextual.
* Improved query printing performance via short circuiting and inlining.
* Moved record writing functions out of `RelayRecordStore` and into a new `RelayRecordWriter` class.
* The Babel plugin now prints `canHaveSubselections` metadata on object-like fields that can contain child fields, making it possible to determine if a given field in a query is a true leaf node, or an object-type field having no subselections. This replaces `RelayQueryNode#isScalar` with `RelayQueryNode#canHaveSubselections`.
* `RANGE_DELETE` mutation configs now allow you to specify an array path to a deleted node, rather than just a `deletedIDFieldName`.
* Renamed `Records` to `RecordMap`.
* Record reads from cache managers are now abortable. If the network request finishes before the cache read, for instance, the cache read can be cancelled.
* Added USERS.md; a catalog of products and developers that use Relay.
* You can now interpolate an array of fragments into a `Relay.QL` query. eg. `${containers.map(c => c.getFragment('foo'))}`
* Fixed a bug where invalid queries could be printed due to different variables having the same value; duplicates are now avoided.

## 0.6.1 (January 8, 2016)

* Renamed `RelayStore#update` to `RelayStore#commitUpdate`. `RelayStore#commit` will be removed in v0.8.0. For an automated codemod that you can use to update your Relay app, visit https://github.com/relayjs/relay-codemod
* Replaced `RelayTestUtils.unmockRelay();` with `require('configureForRelayOSS');` in tests.
* Fragment names in printed queries are now less verbose.
* Fixed a bug that caused queries to be printed incorrectly.
* Eliminated concrete fragment hashes.
* Connections now handle repeated edges more gracefully.
* Created a new `RelayTaskQueue` class. Used it to back `RelayTaskScheduler`.
* Reduced memory by only storing paths to container root nodes.
* Renamed `RelayTaskScheduler#await` to `RelayTaskScheduler#enqueue`.
* Fixed a series of memory leaks with a new GC implementation.
* Tests now run with Jasmine 2.

## 0.6.0 (December 4, 2015)

* Bump the `babel-relay-plugin` version to v0.6.0 (now Babel 6 compatible).
* The keys in `rangeBehaviors` are now compared against the *sorted* filter arguments of a field. For the field `foo(first: 10, b:true, a:false)` the matching range behavior key will be `'a(false).b(true)'`.
* Relay will now throw an invariant if range behavior keys are unsorted.
* Fragments are now supported in mutation fat queries.
* Added `Relay.Store#applyUpdate` method to create a transaction optimistically without committing it. Returns a transaction object that you can use to `commit()` or `rollback()`.
* Added `RelayStoreData#clearCacheManager` method.
* Renamed `RelayQuery#getHash` to `RelayQuery#getConcreteFragmentHash`
* Removed `RelayQueryPath#toJSON` and `RelayQueryPath#fromJSON`

## 0.5.0 (November 11, 2015)

* Bump the `babel-relay-plugin` version to v0.4.1.
  * Added validation of arguments for connections with `edges` or `pageInfo`.
    * Connections without arguments in fat queries can add the new fragment directive `@relay(pattern: true)`.
  * Fixed validation of fields within inline fragments in connections.
  * Print queries using a plain-object representation (instead of `GraphQL` objects).
* `RelayQueryField#getStorageKey` will now produce the same key regardless of the order of a field's arguments.
* Range behavior keys in mutation configs are now guaranteed to be sorted.
* Added the `Relay.createQuery()` function which returns a `RelayQuery.Root` (that can be used with `Relay.Store` methods).
* Optimistic response keys now use GraphQL OSS syntax. (Usage of old, call-like syntax is now deprecated and will warn.)
* Fix a bug where optimistic queries could cause the error "Could not find a type name for record ...".

## 0.4.0 (October 13, 2015)

* Bump the `babel-relay-plugin` version to v0.3.0.
  * Fixed the metadata for fields on abstract types.
  * Directives are now validated against the schema.
  * Mutations field arguments are now validated.
  * Non-root `node(id: ...)` fields are now invalid.
  * Added support for `RelayQL` template tag.
  * Improvements to validation and error messages.
* The `__typename` of abstract types are now fetched and stored locally.
* Fixed `hasOptimisticUpdate` returning true after mutation succeeds (#86).
* Fixed printing mutations with generated `id` fields (#414).
* Fixed updating views when removing the last element in a plural field (#401).
* Fixed sending mutations via classes without invalid GraphQL characters (#448).
* Added a `__DEV__`-only warning when data is passed down via the wrong prop.

## 0.3.2 (September 18, 2015)

* Bump the `babel-relay-plugin` version to v0.2.5.
  * Queries now preserve directives.
  * Output is now generated by babel.
* Fix refragmenting diff queries (#305).
* Directives are now printed.

## 0.3.1 (September 11, 2015)

* Rebuild to replace faulty NPM package (no code changes).

## 0.3.0 (September 11, 2015)

* Fix query variable printing for non-null and list types (#203).
* Bumped React dependency to v0.14.0-rc.
* Switched to using `ReactDOM` rather than `React` for performing batched updates (via `unstable_batchedUpdates`).
* Updated the babel-relay-plugin to v0.2.3:
  * Added support for compiling queries containing introspection fields such as `__schema`, `__typename` and such.
  * Use of `field(before: ..., first: ...)` or `field(after: ..., last: ...)` is now an error.
* Various improvements to documentation, warnings and error messages.

## 0.2.1 (September 1, 2015)

* Support simplified route query definitions (previous API still supported).

## 0.2.0 (August 28, 2015)

* Upgraded jest to 0.5 and switched Relay to use iojs v2+ only.
* Changed `Relay.DefaultNetworkLayer` constructor to take an `init` object instead of `fetchTimeout` and `retryDelays`.
* Scalars other than strings are now allowed as cursors, so long as they serialize to strings.
* Added `npm run update-schema` to update the test schema.

## 0.1.1 (August 14, 2015)

* The 'main' entrypoint can now be used in non-ES6 projects (now built w/ Babel).
* Instance methods of `Relay.DefaultNetworkLayer` are bound to the instance, facilitating reuse.
* Renamed `GraphQL_EXPERIMENTAL` to `GraphQL` (internal change).
* Update copyright headers.
* Remove invariant in `RelayQueryField.getCallType()` when argument is unknown.
* `GraphQLRange` returns diff calls with numeric values instead of strings.
* Example apps now include an ES6 polyfill.
* Moved React to peer dependencies; projects should depend on React directly.
* Variables in the default network layer are no longer double-JSON encoded.
* The default network layer now passed cookies along to the server.

## 0.1.0 (August 11, 2015)

* Initial public release.
