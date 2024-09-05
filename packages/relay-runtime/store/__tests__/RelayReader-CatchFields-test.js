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

      expect(errorResponseFields).toEqual(null);
    });

    it('if preeceeding scalar sibling has error, catch to RESULT should not catch that error', () => {
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
          firstName: 'Elizabeth',
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
        query RelayReaderCatchFieldsTestSiblingErrorQuery {
          me {
            lastName # this field is in an error state and should not be caught
            firstName @catch(to: RESULT)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields} = read(source, operation.fragment);
      expect(data).toEqual({
        me: {
          lastName: null,
          firstName: {
            ok: true,
            value: 'Elizabeth',
          },
        },
      });

      expect(errorResponseFields).toEqual([
        {
          path: 'me.lastName',
          error: {
            message: 'There was an error!',
            path: ['me', 'lastName'],
          },
          owner: 'RelayReaderCatchFieldsTestSiblingErrorQuery',
        },
      ]);
    });

    it('if preceeding scalar sibling has a logged missing required field, an THROW required field inside a subsequent @catch should not delete that log', () => {
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
          firstName: null,
        },
      });

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery {
          alsoMe: me {
            lastName @required(action: LOG)
          }
          me @catch(to: RESULT) {
            # Despite being more destructive, the THOW here should not overwrite
            # the LOG, since it gets caught.
            firstName @required(action: THROW)
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields, missingRequiredFields} = read(
        source,
        operation.fragment,
      );
      expect(data).toEqual({
        alsoMe: null,
        me: {
          ok: false,
          errors: [
            {
              message:
                "Relay: Missing @required value at path 'me.firstName' in 'RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery'.",
            },
          ],
        },
      });

      expect(errorResponseFields).toEqual(null);
      expect(missingRequiredFields).toEqual({
        action: 'LOG',
        fields: [
          {
            path: 'alsoMe.lastName',
            owner: 'RelayReaderCatchFieldsTestSiblingLogRequiredErrorQuery',
          },
        ],
      });
    });

    it('@catch(to: NULL) catching a @required(action: THROW) returns null', () => {
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
          firstName: null,
        },
      });

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTestRequiredCatchToNullErrorQuery {
          me @catch(to: NULL) {
            firstName @required(action: THROW)
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

      expect(errorResponseFields).toEqual(null);
      expect(missingRequiredFields).toEqual(null);
    });

    it('@catch(to: NULL) catching missing data returns null', () => {
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
          // firstName is not defined here
        },
      });

      const FooQuery = graphql`
        query RelayReaderCatchFieldsTestCatchMissingToNullErrorQuery {
          me @catch(to: NULL) {
            firstName
          }
        }
      `;
      const operation = createOperationDescriptor(FooQuery, {id: '1'});
      const {data, errorResponseFields, missingRequiredFields, isMissingData} =
        read(source, operation.fragment);

      // TODO: This should really be: {me: null}
      expect(data).toEqual({
        me: {
          firstName: undefined,
        },
      });

      // We still need to ensure that we will suspend if there is a request in flight.
      expect(isMissingData).toEqual(true);

      expect(errorResponseFields).toEqual(null);
      expect(missingRequiredFields).toEqual(null);
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

      expect(errorResponseFields).toEqual(null);
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
        me: {
          errors: [
            {
              message:
                "Relay: Missing @required value at path 'me.lastName' in 'RelayReaderCatchFieldsTest02Query'.",
            },
          ],
          ok: false,
        },
      });

      expect(missingRequiredFields).toBeNull();
      expect(errorResponseFields).toEqual(null);
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
