/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 */

'use strict';

const React = require('React');
const ReactRelayFragmentContainer = require('ReactRelayFragmentContainer');

const {graphql} = require('RelayCompat');

/**
 * Verifies that normal prop type checking, as well as the methods proxying Relay does, is
 * type-checked correctly on Relay components.
 */

const FooComponent = ({requiredProp}: {requiredProp: string}) => <div>{requiredProp}</div>;

// Note that we must reassign to a new identifier to make sure flow doesn't propogate types without
// the relay type definition doing the work.
const Foo = ReactRelayFragmentContainer.createContainer(FooComponent, {
  viewer: graphql` fragment ReactRelayFragmentContainer-flowtest_Foo_viewer on Viewer { actor { id } } `,
});

class BarComponent extends React.Component {
  props: {
    optionalProp?: {foo: number},
    defaultProp: string,
    requiredProp: string,
  };
  static defaultProps = {
    defaultProp: 'default',
  };
  getNum(): number {
    return 42;
  }
  render() {
    const reqLen = this.props.requiredProp.length;
    const optionalProp = this.props.optionalProp;

    /** $FlowExpectedError: `optionalProp` might be null **/
    const optionalFoo = this.props.optionalProp.foo;

    /** $FlowExpectedError: there is no prop `missingProp` **/
    const missing = this.props.missingProp;

    const defLen = this.props.defaultProp.length; // always a valid string, so no error
    return <div>{reqLen && optionalProp && optionalFoo && missing && defLen}</div>;
  }
}
const Bar = ReactRelayFragmentContainer.createContainer(BarComponent, {
  viewer: graphql` fragment ReactRelayFragmentContainer-flowtest_Bar_viewer on Viewer { actor { id } } `,
});

module.exports = {
  checkMissingPropOnFunctionalComponent() {
    /** $FlowExpectedError: Foo missing `requiredProp` **/
    return <Foo />;
  },
  checkMinimalPropsOnFunctionalComponent() {
    // Fine, no expected errors
    return <Foo requiredProp="foo" />;
  },
  checkMissingPropOnClassComponent() {
    /** $FlowExpectedError: Bar missing `requiredProp` **/
    return <Bar />;
  },
  checkMinimalPropsOnClassComponent() {
    // All is well
    return <Bar requiredProp="foo" />;
  },
  checkWrongPropType() {
    /** $FlowExpectedError: Bar wrong `requiredProp` type, should be string **/
    return <Bar requiredProp={17} />;
  },
  checkWrongOptionalType() {
    /** $FlowExpectedError: Bar wrong `optionalProp` type, should be `{foo: string}` **/
    return <Bar optionalProp="wrongType" requiredProp="foo" />;
  },
  checkNullOptionalType() {
    /** $FlowExpectedError: Bar `optionalProp` must be omitted or truthy, not null **/
    return <Bar optionalProp={null} requiredProp="foo" />;
  },
  checkWrongDefaultPropType() {
    /** $FlowExpectedError: Bar wrong `defaultProp` type, should be string **/
    return <Bar defaultProp={false} requiredProp="foo" />;
  },
  checkAllPossibleProps() {
    // All is well
    return <Bar defaultProp="bar" optionalProp={{foo: 42}} requiredProp="foo" />;
  },
  checkMinimalPropSpread() {
    // All is well
    const props = {requiredProp: 'foo'};
    return <Bar {...props} />;
  },
  checkMissingPropSpread() {
    const props = {defaultProp: 'foo'};
    /** $FlowExpectedError: Bar missing `requiredProp` with spread **/
    return <Bar {...props} />;
  },
  checkStaticsAndMethodsProxying() {
    class ProxyChecker extends React.PureComponent {
      _barRef: ?Bar;
      getString(): string {
        const ok = this._barRef ? this._barRef.getNum() : 'default'; // legit

        /** $FlowExpectedError: Bar does not have `missingMethod` **/
        const bad = this._barRef ? this._barRef.missingMethod() : 'default';

        /** $FlowExpectedError: Bar `getNum` gives number, but `getString` assumes string  **/
        return bad ? 'not good' : ok;
      }
      render() {
        return (
          <Bar
            ref={ref => {this._barRef = ref;}}
            requiredProp="bar"
          />
        );
      }
    }
    return <ProxyChecker />;
  },
};
