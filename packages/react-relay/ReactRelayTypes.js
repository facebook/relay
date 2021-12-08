/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {
  Disposable,
  FragmentType,
  GraphQLTaggedNode,
  IEnvironment,
  Observer,
  Variables,
} from 'relay-runtime';

export type GeneratedNodeMap = {[key: string]: GraphQLTaggedNode, ...};

export type ObserverOrCallback = Observer<void> | ((error: ?Error) => mixed);

// NOTE: This is an inexact type in order to allow a RelayPaginationProp or
// RelayRefetchProp to flow into a RelayProp.
export type RelayProp = {+environment: IEnvironment, ...};

export type RelayPaginationProp = {|
  +environment: IEnvironment,
  +hasMore: () => boolean,
  +isLoading: () => boolean,
  +loadMore: (
    pageSize: number,
    observerOrCallback: ?ObserverOrCallback,
    options?: RefetchOptions,
  ) => ?Disposable,
  +refetchConnection: (
    totalCount: number,
    observerOrCallback: ?ObserverOrCallback,
    refetchVariables: ?Variables,
  ) => ?Disposable,
|};

export type RelayRefetchProp = {|
  +environment: IEnvironment,
  +refetch: (
    refetchVariables: Variables | ((fragmentVariables: Variables) => Variables),
    renderVariables: ?Variables,
    observerOrCallback: ?ObserverOrCallback,
    options?: RefetchOptions,
  ) => Disposable,
|};

export type RefetchOptions = {|
  +force?: boolean,
  +fetchPolicy?: 'store-or-network' | 'network-only',
  +metadata?: {[key: string]: mixed, ...},
|};

/**
 * A utility type which takes the type of a fragment's data (typically found in
 * a relay generated file) and returns a fragment reference type. This is used
 * when the input to a Relay component needs to be explicitly typed:
 *
 *   // ExampleComponent.js
 *   import type {ExampleComponent_data} from './generated/ExampleComponent_data.graphql';
 *   type Props = {
 *     title: string,
 *     data: ExampleComponent_data,
 *   };
 *
 *   export default createFragmentContainer(
 *     (props: Props) => <div>{props.title}, {props.data.someField}</div>,
 *     graphql`
 *       fragment ExampleComponent_data on SomeType {
 *         someField
 *       }`
 *   );
 *
 *   // ExampleUsage.js
 *   import type {ExampleComponent_data} from './generated/ExampleComponent_data.graphql';
 *   type Props = {
 *     title: string,
 *     data: $FragmentRef<ExampleComponent_data>,
 *   };
 *
 *   export default function ExampleUsage(props: Props) {
 *     return <ExampleComponent {...props} />
 *   }
 *
 */
export type $FragmentRef<T> = {
  +$fragmentSpreads: T['$fragmentType'],
  ...
};

/**
 * A utility type that takes the Props of a component and the type of
 * `props.relay` and returns the props of the container.
 */
// prettier-ignore
export type $RelayProps<Props, RelayPropT = RelayProp> = $ObjMap<
  $Diff<Props, { relay: RelayPropT | void, ... }>,
  & (<T: { +$fragmentType: empty, ... }>( T) =>  T)
  & (<T: { +$fragmentType: empty, ... }>(?T) => ?T)
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>(                 T ) =>                  $FragmentRef<T> )
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>(?                T ) => ?                $FragmentRef<T> )
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>( $ReadOnlyArray< T>) =>  $ReadOnlyArray< $FragmentRef<T>>)
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>(?$ReadOnlyArray< T>) => ?$ReadOnlyArray< $FragmentRef<T>>)
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>( $ReadOnlyArray<?T>) =>  $ReadOnlyArray<?$FragmentRef<T>>)
  & (<TFragmentType: FragmentType, T: { +$fragmentType: TFragmentType, ... }>(?$ReadOnlyArray<?T>) => ?$ReadOnlyArray<?$FragmentRef<T>>)
  & (<T>(T) => T),
>;

export type RelayFragmentContainer<TComponent> = React$ComponentType<
  $RelayProps<React$ElementConfig<TComponent>, RelayProp>,
>;

export type RelayPaginationContainer<TComponent> = React$ComponentType<
  $RelayProps<React$ElementConfig<TComponent>, RelayPaginationProp>,
>;

export type RelayRefetchContainer<TComponent> = React$ComponentType<
  $RelayProps<React$ElementConfig<TComponent>, RelayRefetchProp>,
>;
