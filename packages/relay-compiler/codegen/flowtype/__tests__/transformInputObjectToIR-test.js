/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @fullSyntaxTransform
 * @format
 */

'use strict';

jest.autoMockOff();

const transformInputObjectToIR = require('transformInputObjectToIR');

let GraphQLInputObjectType;
let GraphQLInt;
let GraphQLList;
let GraphQLNonNull;
let GraphQLString;

describe('printFlowTypes', () => {
  beforeEach(() => {
    jest.resetModules();
    ({
      GraphQLInputObjectType,
      GraphQLInt,
      GraphQLList,
      GraphQLNonNull,
      GraphQLString,
    } = require('graphql'));
  });

  it('transforms scalars', () => {
    const InputType = {
      name: 'InputType',
      type: new GraphQLInputObjectType({
        name: 'Input',
        fields: {
          id: {type: GraphQLInt},
          body: {type: GraphQLString},
        },
      }),
    };

    expect(transformInputObjectToIR(InputType)).toMatchSnapshot();
  });

  it('transforms non-null', () => {
    const InputType = {
      name: 'InputType',
      type: new GraphQLInputObjectType({
        name: 'Input',
        fields: {
          id: {type: new GraphQLNonNull(GraphQLInt)},
          body: {type: GraphQLString},
        },
      }),
    };

    expect(transformInputObjectToIR(InputType)).toMatchSnapshot();
  });

  it('transforms lists', () => {
    const InputType = {
      name: 'InputType',
      type: new GraphQLInputObjectType({
        name: 'Input',
        fields: {
          id: {type: new GraphQLList(GraphQLInt)},
          body: {type: GraphQLString},
        },
      }),
    };

    expect(transformInputObjectToIR(InputType)).toMatchSnapshot();
  });

  it('transforms fields', () => {
    const SubFieldType = new GraphQLInputObjectType({
      name: 'SubField',
      fields: {
        id: {type: GraphQLInt},
        name: {type: GraphQLString},
      },
    });

    const InputType = {
      name: 'InputType',
      type: new GraphQLInputObjectType({
        name: 'Input',
        fields: {
          id: {
            type: SubFieldType,
          },
          body: {type: GraphQLString},
        },
      }),
    };

    expect(transformInputObjectToIR(InputType)).toMatchSnapshot();
  });
});
