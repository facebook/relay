/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {MutableRecordSource} from '../RelayStoreTypes';
import type {GraphQLTaggedNode, PayloadData, Variables} from 'relay-runtime';

const defaultGetDataID = require('../defaultGetDataID');
const {
  handleGraphModeResponse,
} = require('../RelayExperimentalGraphResponseHandler');
const {
  normalizeResponse,
} = require('../RelayExperimentalGraphResponseTransform');
const {createNormalizationSelector} = require('../RelayModernSelector');
const RelayRecordSource = require('../RelayRecordSource');
const {ROOT_ID} = require('../RelayStoreUtils');
const {graphql} = require('relay-runtime');
const {getRequest} = require('relay-runtime/query/GraphQLTag');

const defaultOptions = {
  getDataID: defaultGetDataID,
  treatMissingFieldsAsNull: false,
  deferDeduplicatedFields: false,
  log: null,
};

function applyTransform(
  query: GraphQLTaggedNode,
  response: PayloadData,
  variables: Variables,
): MutableRecordSource {
  const selector = createNormalizationSelector(
    getRequest(query).operation,
    ROOT_ID,
    variables,
  );
  const graphModeResponse = normalizeResponse(
    response,
    selector,
    defaultOptions,
  );

  const recordSource = new RelayRecordSource();

  return handleGraphModeResponse(recordSource, graphModeResponse);
}

test('Basic', () => {
  const query = graphql`
    query RelayExperimentalGraphResponseHandlerTestQuery {
      me {
        name
      }
    }
  `;
  const response = {
    me: {
      __typename: 'User',
      name: 'Alice',
      id: '100',
    },
  };

  const actual = applyTransform(query, response, {});
  expect(actual).toMatchInlineSnapshot(`
    Object {
      "100": Object {
        "__id": "100",
        "__typename": "User",
        "id": "100",
        "name": "Alice",
      },
      "client:root": Object {
        "__id": "client:root",
        "__typename": "__Root",
        "me": Object {
          "__ref": "100",
        },
      },
    }
  `);
});

test('Null Linked Field', () => {
  const query = graphql`
    query RelayExperimentalGraphResponseHandlerTestNullLinkedQuery {
      fetch__User(id: "100") {
        name
      }
    }
  `;
  const response = {
    fetch__User: null,
  };

  const actual = applyTransform(query, response, {});

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "client:root": Object {
        "__id": "client:root",
        "__typename": "__Root",
        "fetch__User(id:\\"100\\")": null,
      },
    }
  `);
});

test('Plural Linked Fields', () => {
  const query = graphql`
    query RelayExperimentalGraphResponseHandlerTestPluralLinkedQuery {
      me {
        allPhones {
          isVerified
        }
      }
    }
  `;
  const response = {
    me: {
      id: '100',
      __typename: 'User',
      allPhones: [
        {
          __typename: 'Phone',
          isVerified: true,
        },
        {
          __typename: 'Phone',
          isVerified: false,
        },
      ],
    },
  };

  const actual = applyTransform(query, response, {});

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "100": Object {
        "__id": "100",
        "__typename": "User",
        "allPhones": Object {
          "__refs": Array [
            "client:100:allPhones:0",
            "client:100:allPhones:1",
          ],
        },
        "id": "100",
      },
      "client:100:allPhones:0": Object {
        "__id": "client:100:allPhones:0",
        "__typename": "Phone",
        "isVerified": true,
      },
      "client:100:allPhones:1": Object {
        "__id": "client:100:allPhones:1",
        "__typename": "Phone",
        "isVerified": false,
      },
      "client:root": Object {
        "__id": "client:root",
        "__typename": "__Root",
        "me": Object {
          "__ref": "100",
        },
      },
    }
  `);
});

test('Plural Scalar Fields', () => {
  const query = graphql`
    query RelayExperimentalGraphResponseHandlerTestPluralScalarQuery {
      me {
        emailAddresses
      }
    }
  `;
  const response = {
    me: {
      id: '100',
      __typename: 'User',
      emailAddreses: ['me@example.com', 'me+spam@example.com'],
    },
  };

  const actual = applyTransform(query, response, {});

  expect(actual).toMatchInlineSnapshot(`
    Object {
      "100": Object {
        "__id": "100",
        "__typename": "User",
        "emailAddresses": undefined,
        "id": "100",
      },
      "client:root": Object {
        "__id": "client:root",
        "__typename": "__Root",
        "me": Object {
          "__ref": "100",
        },
      },
    }
  `);
});
