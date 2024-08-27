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
const {graphql} = require('../../query/GraphQLTag');
const RelayFeatureFlags = require('../../util/RelayFeatureFlags');
const {
  createOperationDescriptor,
} = require('../RelayModernOperationDescriptor');
const {read} = require('../RelayReader');
const RelayRecordSource = require('../RelayRecordSource');

describe('RelayReader @catch', () => {
  describe('when catch is enabled', () => {
    beforeAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = true;
    });

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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest00Query {
          me {
            lastName @catch(to: NULL)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest01Query {
          me {
            lastName @catch(to: RESULT)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
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
          owner: 'RelayReaderCatchFieldsTest01Query',
        },
      ]);
    });

    it('if scalar has catch to RESULT - but no error, response should reflect', () => {
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
          lastName: 'Big Bird',
        },
      });

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest09Query {
          me {
            lastName @catch(to: RESULT)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          lastName: {
            ok: true,
            value: 'Big Bird',
          },
        },
      });

      expect(errorResponseFields).toBeNull();
    });

    it('if linked has catch to RESULT - but no error, response should reflect', () => {
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
          lastName: 'Big Bird',
        },
      });

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest010Query {
          me @catch {
            lastName
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          ok: true,
          value: {
            lastName: 'Big Bird',
          },
        },
      });

      expect(errorResponseFields).toBeNull();
    });

    it('if linked has catch to RESULT - with error, response should reflect', () => {
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest07Query {
          me @catch {
            lastName
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          ok: false,
          errors: [
            {
              message: 'There was an error!',
              path: ['me', 'lastName'],
            },
          ],
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
          owner: 'RelayReaderCatchFieldsTest07Query',
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest02Query {
          me @catch {
            lastName @required(action: THROW)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
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
          owner: 'RelayReaderCatchFieldsTest02Query',
          path: 'me.lastName',
          error: {
            message:
              "Relay: Missing @required value at path 'me.lastName' in 'RelayReaderCatchFieldsTest02Query'.",
          },
          to: 'RESULT',
        },
      ]);
    });
    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE =
        wasCatchEnabled;
    });
  });
  describe('when catch is disabled', () => {
    beforeAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE = false;
    });

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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest03Query {
          me {
            lastName @catch(to: NULL)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data} = read(source, operation.fragment);
      expect(data).toEqual({me: {lastName: null}});
    });

    it('if scalar has @catch(to: RESULT) - scalar value should still return null because catch is disabled', () => {
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest04Query {
          me {
            lastName @catch(to: RESULT)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
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
          owner: 'RelayReaderCatchFieldsTest04Query',
        },
      ]);
    });

    it('if linked has @catch(to: RESULT) - linked value should still return null because catch is disabled', () => {
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest08Query {
          me @catch {
            lastName
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
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
          owner: 'RelayReaderCatchFieldsTest08Query',
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest05Query {
          me @catch {
            lastName @required(action: THROW)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        me: null,
      });
      expect(missingRequiredFields).toEqual({
        action: 'THROW',
        field: {
          owner: 'RelayReaderCatchFieldsTest05Query',
          path: 'me.lastName',
        },
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

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTest06Query {
          me @catch {
            lastName @required(action: THROW)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        me: null,
      });

      expect(missingRequiredFields).toEqual({
        action: 'THROW',
        field: {
          owner: 'RelayReaderCatchFieldsTest06Query',
          path: 'me.lastName',
        },
      });
      expect(errorResponseFields).toBeNull();
    });
    afterAll(() => {
      RelayFeatureFlags.ENABLE_FIELD_ERROR_HANDLING_CATCH_DIRECTIVE =
        wasCatchEnabled;
    });
  });
});
