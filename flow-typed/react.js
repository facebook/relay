/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

// TODO: Remove after upgrading the flow version. This was added because we changed
// the types of useTransition, startTranstion, and useDeferredValue used only in test.
declare module react {
  declare export var DOM: any;
  declare export var PropTypes: ReactPropTypes;
  declare export var version: string;

  declare export function checkPropTypes<V>(
    propTypes: any,
    values: V,
    location: string,
    componentName: string,
    getStack: ?() => ?string,
  ): void;

  declare export var createClass: React$CreateClass;
  declare export function createContext<T>(
    defaultValue: T,
    calculateChangedBits: ?(a: T, b: T) => number,
  ): React$Context<T>;
  declare export var createElement: React$CreateElement;
  declare export var cloneElement: React$CloneElement;
  declare export function createFactory<ElementType: React$ElementType>(
    type: ElementType,
  ): React$ElementFactory<ElementType>;
  declare export function createRef<T>(): {|current: null | T|};

  declare export function isValidElement(element: any): boolean;

  declare export var Component: typeof React$Component;
  declare export var PureComponent: typeof React$PureComponent;
  declare export type StatelessFunctionalComponent<P> =
    React$StatelessFunctionalComponent<P>;
  declare export type ComponentType<-P> = React$ComponentType<P>;
  declare export type AbstractComponent<
    -Config,
    +Instance = mixed,
  > = React$AbstractComponent<Config, Instance>;
  declare export type MixedElement = React$MixedElement;
  declare export type ElementType = React$ElementType;
  // eslint-disable-next-line lint/flow-react-element
  declare export type Element<+C> = React$Element<C>;
  declare export var Fragment: React$FragmentType;
  declare export type Key = React$Key;
  declare export type Ref<C> = React$Ref<C>;
  declare export type Node = React$Node;
  declare export type TransportObject = React$TransportObject;
  declare export type TransportValue = React$TransportValue;
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
  declare export type Config<Props, DefaultProps> = React$Config<
    Props,
    DefaultProps,
  >;

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

  declare export function forwardRef<Config, Instance>(
    render: (
      props: Config,
      ref: {current: null | Instance, ...} | ((null | Instance) => mixed),
    ) => React$Node,
  ): React$AbstractComponent<Config, Instance>;

  declare export function memo<Config, Instance = mixed>(
    component: React$AbstractComponent<Config, Instance>,
    equal?: (Config, Config) => boolean,
  ): React$AbstractComponent<Config, Instance>;

  declare export function lazy<Config, Instance = mixed>(
    component: () => Promise<{
      default: React$AbstractComponent<Config, Instance>,
      ...
    }>,
  ): React$AbstractComponent<Config, Instance>;

  declare type MaybeCleanUpFn = void | (() => void);

  declare export function useContext<T>(context: React$Context<T>): T;

  declare export function useState<S>(
    initialState: (() => S) | S,
  ): [S, (((S) => S) | S) => void];

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

  declare export var Profiler: React$AbstractComponent<
    {|
      children?: React$Node,
      id: string,
      onRender: ProfilerOnRenderFnType,
    |},
    void,
  >;

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
    +createFactory: typeof createFactory,
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
