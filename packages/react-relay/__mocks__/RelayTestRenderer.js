/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Snapshot, Variables} from 'relay-runtime';

const ReactRelayContext = require('../ReactRelayContext');
const invariant = require('invariant');
const React = require('react');
const {createOperationDescriptor, getRequest} = require('relay-runtime');

type Props = {
  environment: $FlowFixMe,
  query: $FlowFixMe,
  variables: Variables,
  children: React.Element<$FlowFixMe>,
  ...
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

    const operation = getRequest((query: $FlowFixMe));
    const operationDescriptor = createOperationDescriptor(operation, variables);
    const snapshot = environment.lookup(
      operationDescriptor.fragment,
      operationDescriptor,
    );

    this.state = {data: snapshot.data};
    environment.subscribe(snapshot, this._onChange);
  }

  _onChange = (snapshot: Snapshot): void => {
    this.setState({data: snapshot.data});
  };

  render(): React.Element<typeof ReactRelayContext.Provider> {
    const childProps = this.props.children.props;
    const newProps = {...childProps, ...this.state.data};
    return (
      <ReactRelayContext.Provider
        value={{
          environment:
            this.props.environment || this.props.children.props.environment,
        }}>
        {React.cloneElement(
          this.props.children,
          newProps,
          // $FlowFixMe[prop-missing] : error found when enabling flow for this file.
          this.props.children.children,
        )}
      </ReactRelayContext.Provider>
    );
  }
}

module.exports = RelayTestRenderer;
