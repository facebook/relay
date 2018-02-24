/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import persistQuery from '../persistQuery';

const writeRelayGeneratedFile = require('../writeRelayGeneratedFile');

describe('writeRelayGeneratedFile', () => {
  describe('persisted queries', () => {
    let codeGenDir;
    const formatModule = () => 'mockFormatModuleOuput';
    const flowTypes = '';
    const platform = null;
    const sourceHash = 'test-hash';
    const extension = 'js';

    beforeEach(() => {
      codeGenDir = {
        read: () => 'oldContent',
        writeFile: jest.fn(),
        markUnchanged: jest.fn(),
        markUpdated: jest.fn(),
      };
    });

    test('should persist concrete request', async () => {

      const node = {
        kind: 'Request',
        operationKind: 'query',
        name: 'summaryBar_refetch_Query',
        text: 'query product_refetch_Query { viewer { product } }',
      };
      const expectedDocumentId = await persistQuery(node.text);

      const generatedNode = await writeRelayGeneratedFile(
        codeGenDir,
        node,
        formatModule,
        flowTypes,
        persistQuery,
        platform,
        sourceHash,
        extension
      );

      expect(codeGenDir.markUnchanged).not.toBeCalled();
      expect(codeGenDir.markUpdated).not.toBeCalled();
      expect(generatedNode.id).toEqual(expectedDocumentId);
      expect(generatedNode.text).toBeNull();
      expect(codeGenDir.writeFile.mock.calls.length).toEqual(2);
      expect(codeGenDir.writeFile.mock.calls[0][0]).toBe('summaryBar_refetch_Query.graphql.js');
      expect(codeGenDir.writeFile.mock.calls[0][1]).toBe('mockFormatModuleOuput');
      expect(codeGenDir.writeFile).lastCalledWith('summaryBar_refetch_Query.queryMap.json', `{
  \"${expectedDocumentId}\": \"${node.text}\"
}`);
    });

    test('should not persist fragment', async () => {
      const node = {
        kind: 'Fragment',
        name: 'summaryBar_refetch_Query',
      };

      const generatedNode = await writeRelayGeneratedFile(
        codeGenDir,
        node,
        formatModule,
        flowTypes,
        persistQuery,
        platform,
        sourceHash,
        extension
      );

      expect(codeGenDir.markUnchanged).not.toBeCalled();
      expect(codeGenDir.markUpdated).not.toBeCalled();
      expect(generatedNode.id).toBeUndefined();
      expect(generatedNode.text).toBeUndefined();
      expect(codeGenDir.writeFile.mock.calls.length).toEqual(1);
      expect(codeGenDir.writeFile).lastCalledWith('summaryBar_refetch_Query.graphql.js', 'mockFormatModuleOuput');
    });

    test('should mark queryMap.json as unchanged if hash is unchanged', async () => {
      jest.doMock('crypto', () => ({createHash: () => ({update: () => '', digest: () => null})}));

      const node = {
        kind: 'Request',
        operationKind: 'query',
        name: 'summaryBar_refetch_Query',
        text: 'query product_refetch_Query { viewer { product } }',
      };

      await writeRelayGeneratedFile(
        codeGenDir,
        node,
        formatModule,
        flowTypes,
        persistQuery,
        platform,
        sourceHash,
        extension
      );

      expect(codeGenDir.markUnchanged.mock.calls.length).toEqual(2);
      expect(codeGenDir.markUpdated).not.toBeCalled();
      expect(codeGenDir.markUnchanged.mock.calls[0][0]).toBe('summaryBar_refetch_Query.graphql.js');
      expect(codeGenDir.markUnchanged).lastCalledWith('summaryBar_refetch_Query.queryMap.json');
    });

    test('should mark queryMap.json as updated when only validating', async () => {
      jest.unmock('crypto');
      codeGenDir.onlyValidate = true;

      const node = {
        kind: 'Request',
        operationKind: 'query',
        name: 'summaryBar_refetch_Query',
        text: 'query product_refetch_Query { viewer { product } }',
      };

      await writeRelayGeneratedFile(
        codeGenDir,
        node,
        formatModule,
        flowTypes,
        persistQuery,
        platform,
        sourceHash,
        extension
      );

      expect(codeGenDir.markUnchanged).not.toBeCalled();
      expect(codeGenDir.markUpdated.mock.calls.length).toEqual(2);
      expect(codeGenDir.markUpdated.mock.calls[0][0]).toBe('summaryBar_refetch_Query.graphql.js');
      expect(codeGenDir.markUpdated).lastCalledWith('summaryBar_refetch_Query.queryMap.json');
    });
  });
});