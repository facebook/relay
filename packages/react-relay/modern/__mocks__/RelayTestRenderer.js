/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const React = require('React');
const RelayPropTypes = require('../../classic/container/RelayPropTypes');

const invariant = require('invariant');

const {RelayConcreteNode} = require('RelayRuntime');

import type {Variables, Snapshot} from 'RelayRuntime';

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
    if (operation.kind === RelayConcreteNode.BATCH_REQUEST) {
      throw new Error(
        'RelayTestRender: Batch request not yet implemented (T22955102)',
      );
    }
    const operationSelector = createOperationSelector(operation, variables);
    const snapshot = environment.lookup(operationSelector.fragment);

    this.state = {data: snapshot.data};
    environment.subscribe(snapshot, this._onChange);
  }

  getChildContext() {
    return {
      relay: {
        environment:
          this.props.environment || this.props.children.props.environment,
        variables: this.props.variables || this.props.children.props.variables,
      },
    };
  }

  _onChange = (snapshot: Snapshot): void => {
    this.setState({data: snapshot.data});
  };

  render() {
    const childProps = this.props.children.props;
    const newProps = {...childProps, ...this.state.data};
    return React.cloneElement(
      this.props.children,
      newProps,
      // $FlowFixMe: error found when enabling flow for this file.
      this.props.children.children,
    );
  }
}

RelayTestRenderer.childContextTypes = {
  relay: RelayPropTypes.Relay,
};

module.exports = RelayTestRenderer;
