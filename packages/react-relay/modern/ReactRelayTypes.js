/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {Disposable} from '../classic/environment/RelayCombinedEnvironmentTypes';
import type {RerunParam, Variables} from '../classic/tools/RelayTypes';
import type {
  FragmentReference,
  GraphQLTaggedNode,
  IEnvironment,
  Observer,
} from 'RelayRuntime';

export type GeneratedNodeMap = {[key: string]: GraphQLTaggedNode};

export type ObserverOrCallback = Observer<void> | ((error: ?Error) => mixed);

export type RelayProp = {
  environment: IEnvironment,
};

export type RelayPaginationProp = RelayProp & {
  hasMore: () => boolean,
  isLoading: () => boolean,
  loadMore: (
    pageSize: number,
    observerOrCallback: ?ObserverOrCallback,
    options?: RefetchOptions,
  ) => ?Disposable,
  refetchConnection: (
    totalCount: number,
    observerOrCallback: ?ObserverOrCallback,
    refetchVariables: ?Variables,
  ) => ?Disposable,
};

export type RelayRefetchProp = RelayProp & {
  refetch: (
    refetchVariables: Variables | ((fragmentVariables: Variables) => Variables),
    renderVariables: ?Variables,
    observerOrCallback: ?ObserverOrCallback,
    options?: RefetchOptions,
  ) => Disposable,
};

export type RefetchOptions = {
  force?: boolean,
  rerunParamExperimental?: RerunParam,
};

/**
 * A utility type that takes the Props of a component and the type of
 * `props.relay` and returns the props of the container.
 */
// prettier-ignore
export type $RelayProps<Props, RelayPropT> = $ObjMap<
  $Diff<Props, {relay: RelayPropT | void}>,
  & (<T: empty>(T) => T)
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>(                 TFragData ) =>                  {+__fragments: TRef} )
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>(?                TFragData ) => ?                {+__fragments: TRef} )
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>( $ReadOnlyArray< TFragData>) =>  $ReadOnlyArray< {+__fragments: TRef}>)
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>(?$ReadOnlyArray< TFragData>) => ?$ReadOnlyArray< {+__fragments: TRef}>)
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>( $ReadOnlyArray<?TFragData>) =>  $ReadOnlyArray<?{+__fragments: TRef}>)
  & (<TRef: FragmentReference, TFragData: {+$refType: TRef}>(?$ReadOnlyArray<?TFragData>) => ?$ReadOnlyArray<?{+__fragments: TRef}>)
  & (<T>(T) => T),
>;
