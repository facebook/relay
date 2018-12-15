/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

const React = require('React');
const ReactRelayContext = require('../ReactRelayContext');

const invariant = require('invariant');

import type {Variables, Snapshot} from 'relay-runtime';

type Props = {
  environment: $FlowFixMe,
  query: $FlowFixMe,
  variables: Variables,
  children: React.Element<$FlowFixMe>,
};

class RelayTestRenderer extends React.Component<Props, $FlowFixMe> {
  constructor(props: Props) {
    super(props);

    invariant(
      React.Children.count(this.props.children) === 1,
      'Expected only a single child to be passed to `RelayTestContainer`',
    );

    invariant(
      React.isValidElement(this.props.children),
      'Expected child of `RelayTestContainer` to be a React element',
    );

    const {query, environment, variables} = props;

    const {createOperationSelector, getRequest} = environment.unstable_internal;

    const operation = getRequest((query: $FlowFixMe));
    const operationSelector = createOperationSelector(operation, variables);
    const snapshot = environment.lookup(operationSelector.fragment);

    this.state = {data: snapshot.data};
    environment.subscribe(snapshot, this._onChange);
  }

  _onChange = (snapshot: Snapshot): void => {
    this.setState({data: snapshot.data});
  };

  render() {
    const childProps = this.props.children.props;
    const newProps = {...childProps, ...this.state.data};
    return (
      <ReactRelayContext.Provider
        value={{
          environment:
            this.props.environment || this.props.children.props.environment,
          variables:
            this.props.variables || this.props.children.props.variables,
        }}>
        {React.cloneElement(
          this.props.children,
          newProps,
          // $FlowFixMe: error found when enabling flow for this file.
          this.props.children.children,
        )}
      </ReactRelayContext.Provider>
    );
  }
}

module.exports = RelayTestRenderer;
