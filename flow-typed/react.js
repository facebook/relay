/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

/* eslint-disable no-unused-vars */

'use strict';

// TODO: Remove after upgrading the flow version. This was added because we changed
// the types of useTransition, startTranstion, and useDeferredValue used only in test.
declare module react {
  declare export var DOM: any;
  declare export var PropTypes: any;
  declare export var version: string;

  declare export function checkPropTypes<V>(
    propTypes: any,
    values: V,
    location: string,
    componentName: string,
    getStack: ?() => ?string,
  ): void;

  declare export var createClass: $FlowFixMe;
  declare export function createContext<T>(
    defaultValue: T,
    calculateChangedBits: ?(a: T, b: T) => number,
  ): React$Context<T>;
  declare export var createElement: React$CreateElement;
  declare export var cloneElement: React$CloneElement;
  declare export function createRef<T>(): {|current: null | T|};

  declare export function isValidElement(element: any): boolean;

  declare export var Component: typeof React$Component;
  declare export var PureComponent: typeof React$PureComponent;
  declare export type ComponentType<-P> = React$ComponentType<P>;
  declare export type MixedElement = React$MixedElement;
  declare export type ElementType = React$ElementType;
  declare export type Element<+C> = React$Element<C>;
  declare export var Fragment: React$FragmentType;
  declare export type Key = React$Key;
  declare export type RefSetter<-T> = React$RefSetter<T>;
  declare export type Node = React$Node;
  declare export type Context<T> = React$Context<T>;
  declare export type Portal = React$Portal;
  declare export var ConcurrentMode: ({
    children?: React$Node,
    ...
  }) => React$Node; // 16.7+
  declare export var StrictMode: ({children?: React$Node, ...}) => React$Node;

  declare export var Suspense: React$ComponentType<{
    children?: React$Node,
    fallback?: React$Node,
    ...
  }>; // 16.6+

  declare export type ElementProps<C> = React$ElementProps<C>;
  declare export type ElementConfig<C> = React$ElementConfig<C>;
  declare export type ElementRef<C> = React$ElementRef<C>;

  declare export type ChildrenArray<+T> = $ReadOnlyArray<ChildrenArray<T>> | T;
  declare export var Children: {
    map<T, U>(
      children: ChildrenArray<T>,
      fn: (child: $NonMaybeType<T>, index: number) => U,
      thisArg?: mixed,
    ): Array<$NonMaybeType<U>>,
    forEach<T>(
      children: ChildrenArray<T>,
      fn: (child: T, index: number) => mixed,
      thisArg?: mixed,
    ): void,
    count(children: ChildrenArray<any>): number,
    only<T>(children: ChildrenArray<T>): $NonMaybeType<T>,
    toArray<T>(children: ChildrenArray<T>): Array<$NonMaybeType<T>>,
    ...
  };

  declare export function forwardRef<Config: {...}, Instance>(
    render: (props: Config, ref: React$RefSetter<Instance>) => React$Node,
  ): component(ref: React.RefSetter<Instance>, ...Config);

  declare export function memo<Config: {...}, Instance = mixed>(
    component: component(ref: React.RefSetter<Instance>, ...Config),
    equal?: (Config, Config) => boolean,
  ): component(ref: React.RefSetter<Instance>, ...Config);

  declare export function lazy<Config: {...}, Instance = mixed>(
    component_: () => Promise<
      $ReadOnly<{
        default: component(ref: React.RefSetter<Instance>, ...Config),
        ...
      }>,
    >,
  ): component(ref: React.RefSetter<Instance>, ...Config);

  declare type MaybeCleanUpFn = void | (() => void);

  declare export function useContext<T>(context: React$Context<T>): T;

  declare export function useState<S>(
    initialState: (() => S) | S,
  ): [S, ((S => S) | S) => void];

  declare type Dispatch<A> = (A) => void;

  declare export function useReducer<S, A>(
    reducer: (S, A) => S,
    initialState: S,
  ): [S, Dispatch<A>];

  declare export function useReducer<S, A>(
    reducer: (S, A) => S,
    initialState: S,
    init: void,
  ): [S, Dispatch<A>];

  declare export function useReducer<S, A, I>(
    reducer: (S, A) => S,
    initialArg: I,
    init: (I) => S,
  ): [S, Dispatch<A>];

  declare export function useRef<T>(initialValue: T): {|current: T|};

  declare export function useDebugValue(value: any): void;

  declare export function useEffect(
    create: () => MaybeCleanUpFn,
    inputs?: ?$ReadOnlyArray<mixed>,
  ): void;

  declare export function useLayoutEffect(
    create: () => MaybeCleanUpFn,
    inputs?: ?$ReadOnlyArray<mixed>,
  ): void;

  declare export function useCallback<
    T: (...args: $ReadOnlyArray<empty>) => mixed,
  >(
    callback: T,
    inputs: ?$ReadOnlyArray<mixed>,
  ): T;

  declare export function useMemo<T>(
    create: () => T,
    inputs: ?$ReadOnlyArray<mixed>,
  ): T;

  declare export function useImperativeHandle<T>(
    ref: {current: T | null, ...} | ((inst: T | null) => mixed) | null | void,
    create: () => T,
    inputs: ?$ReadOnlyArray<mixed>,
  ): void;

  declare export function useDeferredValue<T>(value: T): T;

  declare export function useTransition(): [boolean, (() => void) => void];

  declare export function startTransition(() => void): void;

  declare export type Interaction = {
    name: string,
    timestamp: number,
    ...
  };

  declare type ProfilerOnRenderFnType = (
    id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<Interaction>,
  ) => void;

  declare export var Profiler: React$ComponentType<{|
    children?: React$Node,
    id: string,
    onRender: ProfilerOnRenderFnType,
  |}>;

  declare type TimeoutConfig = {|
    timeoutMs: number,
  |};

  declare export default {|
    +DOM: typeof DOM,
    +PropTypes: typeof PropTypes,
    +version: typeof version,
    +checkPropTypes: typeof checkPropTypes,
    +memo: typeof memo,
    +lazy: typeof lazy,
    +createClass: typeof createClass,
    +createContext: typeof createContext,
    +createElement: typeof createElement,
    +cloneElement: typeof cloneElement,
    +createRef: typeof createRef,
    +forwardRef: typeof forwardRef,
    +isValidElement: typeof isValidElement,
    +Component: typeof Component,
    +PureComponent: typeof PureComponent,
    +Fragment: React$FragmentType,
    +Children: typeof Children,
    +ConcurrentMode: typeof ConcurrentMode,
    +StrictMode: typeof StrictMode,
    +Profiler: typeof Profiler,
    +Suspense: typeof Suspense,
    +useContext: typeof useContext,
    +useState: typeof useState,
    +useReducer: typeof useReducer,
    +useRef: typeof useRef,
    +useEffect: typeof useEffect,
    +useLayoutEffect: typeof useLayoutEffect,
    +useCallback: typeof useCallback,
    +useMemo: typeof useMemo,
    +useImperativeHandle: typeof useImperativeHandle,
    +useTransition: typeof useTransition,
    +useDeferredValue: typeof useDeferredValue,
    +startTransition: typeof startTransition,
  |};
}
