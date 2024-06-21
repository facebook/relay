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

const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');
const RelayReaderCatchFieldsTest0Query = require('./__mocks__/RelayReaderCatchFieldsTest0Query.graphql.js');
const RelayReaderCatchFieldsTest1Query = require('./__mocks__/RelayReaderCatchFieldsTest1Query.graphql.js');
const RelayReaderCatchFieldsTest2Query = require('./__mocks__/RelayReaderCatchFieldsTest2Query.graphql.js');

describe('RelayReader @catch', () => {
  describe('when catch is enabled', () => {
    beforeAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = true;
    });

    const wasFieldErrorHandlingEnabled =
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING;
    const wasCatchEnabled =
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE;
    it('if scalar has @catch(to: NULL) - scalar value should be null, and nothing should throw or catch', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest0Query {
      //     me {
      //       lastName @catch(to: NULL)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest0Query,
        {id: '1'},
      );
      const {data} = read(source, operation.fragment);
      expect(data).toEqual({me: {lastName: null}});
    });

    it('if scalar has catch to RESULT - scalar value should provide the error', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
          __errors: {
            lastName: [
              {
                message: 'There was an error!',
                path: ['me', 'lastName'],
              },
            ],
          },
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest1Query {
      //     me {
      //       lastName @catch(to: RESULT)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest1Query,
        {id: '1'},
      );
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          lastName: {
            ok: false,
            errors: [
              {
                message: 'There was an error!',
                path: ['me', 'lastName'],
              },
            ],
          },
        },
      });

      expect(errorResponseFields).toEqual([
        {
          path: 'me.lastName',
          to: 'RESULT',
          error: {
            message: 'There was an error!',
            path: ['me', 'lastName'],
          },
          owner: 'RelayReaderCatchFieldsTest1Query',
        },
      ]);
    });

    it('if scalar has catch to RESULT with nested required', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest1Query {
      //     me @catch {
      //       lastName @required(action: THROW)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest2Query,
        {id: '1'},
      );
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        me: null,
      });

      expect(missingRequiredFields).toBeNull();
      expect(errorResponseFields).toEqual([
        {
          owner: 'RelayReaderCatchFieldsTest2Query',
          path: 'me.lastName',
          error: {
            message:
              "Relay: Missing @required value at path 'me.lastName' in 'RelayReaderCatchFieldsTest2Query'.",
          },
          to: 'RESULT',
        },
      ]);
    });
    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING =
        wasFieldErrorHandlingEnabled;

      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE =
        wasCatchEnabled;
    });
  });
  describe('when catch is disabled', () => {
    beforeAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING = true;
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = false;
    });

    const wasFieldErrorHandlingEnabled =
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING;
    const wasCatchEnabled =
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE;
    it('if scalar has @catch(to: NULL) - scalar value should be null, and nothing should throw or catch', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest0Query {
      //     me {
      //       lastName @catch(to: NULL)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest0Query,
        {id: '1'},
      );
      const {data} = read(source, operation.fragment);
      expect(data).toEqual({me: {lastName: null}});
    });

    it('if scalar has @catch(to: RESULT) - scalar value should provide the value as a CatchField object', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
          __errors: {
            lastName: [
              {
                message: 'There was an error!',
                path: ['me', 'lastName'],
              },
            ],
          },
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest1Query {
      //     me {
      //       lastName @catch(to: RESULT)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest1Query,
        {id: '1'},
      );
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          lastName: null,
        },
      });

      expect(errorResponseFields).toEqual([
        {
          path: 'me.lastName',
          error: {
            message: 'There was an error!',
            path: ['me', 'lastName'],
          },
          owner: 'RelayReaderCatchFieldsTest1Query',
        },
      ]);
    });

    it('if scalar has catch to RESULT with nested required', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest1Query {
      //     me @catch {
      //       lastName @required(action: THROW)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest2Query,
        {id: '1'},
      );
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        me: null,
      });
      expect(missingRequiredFields).toEqual({
        action: 'THROW',
        field: {owner: 'RelayReaderCatchFieldsTest2Query', path: 'me.lastName'},
      });
      expect(errorResponseFields).toBeNull();
    });

    it('if scalar has catch to RESULT with nested required THROW - do nothing', () => {
      const source = RelayRecordSource.create({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          me: {__ref: '1'},
        },
        '1': {
          __id: '1',
          id: '1',
          __typename: 'User',
          lastName: null,
        },
      });

      // Mocking the query below with RelayReaderCatchFieldsTest0Query
      // const FooQuery = graphql`
      //   query RelayReaderCatchFieldsTest1Query {
      //     me @catch {
      //       lastName @required(action: THROW)
      //     }
      //   }
      // `;
      const operation = createOperationDescriptor(
        RelayReaderCatchFieldsTest2Query,
        {id: '1'},
      );
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        me: null,
      });

      expect(missingRequiredFields).toEqual({
        action: 'THROW',
        field: {owner: 'RelayReaderCatchFieldsTest2Query', path: 'me.lastName'},
      });
      expect(errorResponseFields).toBeNull();
    });
    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING =
        wasFieldErrorHandlingEnabled;

      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE =
        wasCatchEnabled;
    });
  });
});
// RelayReaderCatchFieldsTest3Query
