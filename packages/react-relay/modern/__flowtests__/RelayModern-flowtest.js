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

const React = require('React');

const nullthrows = require('nullthrows');

const {createFragmentContainer, graphql} = require('../ReactRelayPublic');

import type {
  RelayModernFlowtest_user,
  RelayModernFlowtest_user$ref,
} from './RelayModernFlowtest_user.graphql';
import type {
  RelayModernFlowtest_users,
  RelayModernFlowtest_users$ref,
} from './RelayModernFlowtest_users.graphql';

class SingularTest extends React.Component<{
  string: string,
  onClick: () => void,
  user: RelayModernFlowtest_user,
  nullableUser: ?RelayModernFlowtest_user,
  optionalUser?: RelayModernFlowtest_user,
}> {
  render(): React.Node {
    (nullthrows(this.props.user.name): string);
    // $FlowExpectedError
    this.props.nullableUser.name;
    // $FlowExpectedError
    this.props.optionalUser.name;
    (nullthrows(nullthrows(this.props.nullableUser).name): string);
    (nullthrows(nullthrows(this.props.optionalUser).name): string);
    return null;
  }
}
SingularTest = createFragmentContainer(SingularTest, {
  user: graphql`
    fragment RelayModernFlowtest_user on User {
      name
    }
  `,
});

class PluralTest extends React.Component<{
  users: RelayModernFlowtest_users,
  nullableUsers: ?RelayModernFlowtest_users,
  optionalUsers?: RelayModernFlowtest_users,
}> {
  render(): React.Node {
    const names = this.props.users.map(user => user.name).filter(Boolean);
    (names: Array<string>);
    // $FlowExpectedError
    (names: Array<number>);
    return null;
  }
}
PluralTest = createFragmentContainer(PluralTest, {
  users: graphql`
    fragment RelayModernFlowtest_users on User @relay(plural: true) {
      name
    }
  `,
});

declare var aUserRef: {
  +__fragments: RelayModernFlowtest_user$ref,
};

declare var oneOfUsersRef: {
  +__fragments: RelayModernFlowtest_users$ref,
};

declare var usersRef: $ReadOnlyArray<{
  +__fragments: RelayModernFlowtest_users$ref,
}>;

declare var nonUserRef: {
  +__fragments: {thing: true},
};

function cb(): void {}

// $FlowExpectedError - can't pass null for user
<SingularTest onClick={cb} string="x" user={null} nullableUser={null} />;
// $FlowExpectedError - user is required
<SingularTest onClick={cb} string="x" nullableUser={null} />;
// $FlowExpectedError - can't pass non-user ref for user
<SingularTest onClick={cb} string="x" user={nonUserRef} nullableUser={null} />;
// $FlowExpectedError - `cb` prop is not a function
<SingularTest onClick={'cb'} string="x" user={aUserRef} nullableUser={null} />;
// $FlowExpectedError - `string` prop is not a string
<SingularTest onClick={cb} string={1} user={aUserRef} nullableUser={null} />;

<SingularTest onClick={cb} string="x" user={aUserRef} nullableUser={null} />;
<SingularTest
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={aUserRef}
/>;
<SingularTest
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={null}
  optionalUser={aUserRef}
/>;

// $FlowExpectedError - optional, not nullable!
<SingularTest
  string="x"
  user={aUserRef}
  nullableUser={null}
  optionalUser={null}
/>;

declare var aComplexUserRef: {
  __fragments: {thing1: true} & RelayModernFlowtest_user$ref & {
      thing2: true,
    },
};
<SingularTest
  string="x"
  onClick={cb}
  user={aComplexUserRef}
  nullableUser={aComplexUserRef}
  optionalUser={aComplexUserRef}
/>;

// $FlowExpectedError - can't pass null for user
<PluralTest users={null} nullableUsers={null} />;
// $FlowExpectedError - users is required
<PluralTest nullableUsers={null} />;
// $FlowExpectedError - can't pass non-user refs for user
<PluralTest users={[nonUserRef]} nullableUsers={null} />;

<PluralTest users={usersRef} nullableUsers={null} />;

<PluralTest
  users={([oneOfUsersRef]: Array<typeof oneOfUsersRef>)}
  nullableUsers={null}
/>;
<PluralTest users={[oneOfUsersRef]} nullableUsers={null} />;

<PluralTest users={usersRef} nullableUsers={[oneOfUsersRef]} />;
<PluralTest users={usersRef} nullableUsers={null} optionalUsers={usersRef} />;
// $FlowExpectedError - optional, not nullable!
<PluralTest users={usersRef} nullableUsers={null} optionalUsers={null} />;

class AnyTest extends React.Component<{
  anything: any,
}> {}
AnyTest = createFragmentContainer(AnyTest, {});

<AnyTest anything={42} />;
