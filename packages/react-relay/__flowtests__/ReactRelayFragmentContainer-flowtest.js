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

const {
  createContainer: createFragmentContainer,
} = require('../ReactRelayFragmentContainer');
const React = require('react');
const {graphql} = require('relay-runtime');

/**
 * Verifies that normal prop type checking, as well as the methods proxying Relay does, is
 * type-checked correctly on Relay components.
 */

const FooComponent = ({requiredProp}: {requiredProp: string, ...}) => (
  <div>{requiredProp}</div>
);

// Note that we must reassign to a new identifier to make sure flow doesn't propogate types without
// the relay type definition doing the work.
const Foo = createFragmentContainer(FooComponent, {
  viewer: graphql`
    fragment ReactRelayFragmentContainerFlowtest_viewer on Viewer {
      actor {
        id
      }
    }
  `,
});

class BarComponent extends React.Component<{
  optionalProp?: {foo: number, ...},
  defaultProp: string,
  requiredProp: string,
  ...
}> {
  static defaultProps = {
    defaultProp: 'default',
  };
  getNum(): number {
    return 42;
  }
  render(): React.Element<'div'> {
    const reqLen = this.props.requiredProp.length;
    const optionalProp = this.props.optionalProp;

    /** $FlowExpectedError: `optionalProp` might be null **/
    const optionalFoo = this.props.optionalProp.foo;

    /** $FlowExpectedError: there is no prop `missingProp` **/
    const missing = this.props.missingProp;

    const defLen = this.props.defaultProp.length; // always a valid string, so no error
    return (
      <div>{reqLen && optionalProp && optionalFoo && missing && defLen}</div>
    );
  }
}
const Bar = createFragmentContainer(BarComponent, {
  viewer2: graphql`
    fragment ReactRelayFragmentContainerFlowtest_viewer2 on Viewer {
      actor {
        id
      }
    }
  `,
});

module.exports = {
  checkMissingPropOnFunctionalComponent(): React.Node {
    /** $FlowExpectedError: Foo missing `requiredProp` **/
    return <Foo />;
  },
  checkMinimalPropsOnFunctionalComponent(): React.Node {
    // Fine, no expected errors
    return <Foo requiredProp="foo" />;
  },
  checkMissingPropOnClassComponent(): React.Node {
    /** $FlowExpectedError: Bar missing `requiredProp` **/
    return <Bar />;
  },
  checkMinimalPropsOnClassComponent(): React.Node {
    // All is well
    return <Bar requiredProp="foo" />;
  },
  checkWrongPropType(): React.Node {
    /** $FlowExpectedError: Bar wrong `requiredProp` type, should be string **/
    return <Bar requiredProp={17} />;
  },
  checkWrongOptionalType(): React.Node {
    /** $FlowExpectedError: Bar wrong `optionalProp` type, should be `{foo: string}` **/
    return <Bar optionalProp="wrongType" requiredProp="foo" />;
  },
  checkNullOptionalType(): React.Node {
    /** $FlowExpectedError: Bar `optionalProp` must be omitted or truthy, not null **/
    return <Bar optionalProp={null} requiredProp="foo" />;
  },
  checkWrongDefaultPropType(): React.Node {
    /** $FlowExpectedError: Bar wrong `defaultProp` type, should be string **/
    return <Bar defaultProp={false} requiredProp="foo" />;
  },
  checkAllPossibleProps(): React.Node {
    // All is well
    return (
      <Bar defaultProp="bar" optionalProp={{foo: 42}} requiredProp="foo" />
    );
  },
  checkMinimalPropSpread(): React.Node {
    // All is well
    const props = {requiredProp: 'foo'};
    return <Bar {...props} />;
  },
  checkMissingPropSpread(): React.Node {
    const props = {defaultProp: 'foo'};
    /** $FlowExpectedError: Bar missing `requiredProp` with spread **/
    return <Bar {...props} />;
  },
  checkStaticsAndMethodsProxying(): React.Node {
    class ProxyChecker extends React.PureComponent<{||}> {
      _barRef: ?BarComponent;
      getString(): string {
        const ok = this._barRef ? this._barRef.getNum() : 'default'; // legit

        /** $FlowExpectedError: Bar does not have `missingMethod` **/
        const bad = this._barRef ? this._barRef.missingMethod() : 'default';

        /** $FlowExpectedError: Bar `getNum` gives number, but `getString` assumes string  **/
        return bad ? 'not good' : ok;
      }
      render(): React.Element<typeof Bar> {
        return (
          <Bar
            componentRef={ref => {
              this._barRef = (ref: empty);
            }}
            requiredProp="bar"
          />
        );
      }
    }
    return <ProxyChecker />;
  },
};
