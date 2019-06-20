/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('./ReactRelayContext');

const areEqual = require('areEqual');

import type {
  GraphQLTaggedNode,
  IEnvironment,
  Snapshot,
  Variables,
} from 'relay-runtime';

type Props = {
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  // $FlowFixMe
  render: ({props: ?Object}) => React.Node,
  variables: Variables,
};

type Disposables = {|
  disposeRetain: () => void,
  disposeSubscribe: () => void,
|};

type State = {
  disposables: Disposables,
  onNotify: Snapshot => void,
  prevEnvironment: IEnvironment,
  prevQuery: GraphQLTaggedNode,
  prevVariables: Variables,
  // $FlowFixMe
  props: ?Object,
};

function subscribeAndDeriveState(
  environment: IEnvironment,
  query: GraphQLTaggedNode,
  variables: Variables,
  onNotify: Snapshot => void,
  prevDisposables?: Disposables,
): State {
  cleanup(prevDisposables);
  const {getRequest, createOperationDescriptor} = environment.unstable_internal;
  const request = getRequest(query);
  const operation = createOperationDescriptor(request, variables);
  const snapshot = environment.lookup(operation.fragment, operation);
  environment.check(operation.root);
  const disposables = {
    disposeRetain: environment.retain(operation.root).dispose,
    disposeSubscribe: environment.subscribe(snapshot, onNotify).dispose,
  };
  return {
    props: snapshot.data,
    prevEnvironment: environment,
    prevQuery: query,
    prevVariables: variables,
    onNotify,
    disposables,
  };
}

function cleanup(disposables: ?Disposables): void {
  if (disposables) {
    disposables.disposeRetain();
    disposables.disposeSubscribe();
  }
}

class ReactRelayLocalQueryRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {environment, query, variables} = props;
    this.state = subscribeAndDeriveState(
      environment,
      query,
      variables,
      this._onNotify,
    );
  }

  componentWillUnmount(): void {
    cleanup(this.state.disposables);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return (
      nextProps.render !== this.props.render ||
      nextState.props !== this.state.props
    );
  }

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State,
  ): State | null {
    if (
      nextProps.query === prevState.prevQuery &&
      nextProps.environment === prevState.prevEnvironment &&
      areEqual(nextProps.variables, prevState.prevVariables)
    ) {
      return null;
    }
    return subscribeAndDeriveState(
      nextProps.environment,
      nextProps.query,
      nextProps.variables,
      prevState.onNotify,
      prevState.disposables,
    );
  }

  _onNotify = (snapshot: Snapshot): void => {
    this.setState({
      props: snapshot.data,
    });
  };

  render(): React.Node {
    const {environment, render} = this.props;
    const {props} = this.state;
    const relayContext = {
      environment,
      variables: {},
    };
    return (
      <ReactRelayContext.Provider value={relayContext}>
        {render({props})}
      </ReactRelayContext.Provider>
    );
  }
}

module.exports = ReactRelayLocalQueryRenderer;
