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

import type {GraphQLResponseWithData} from '../network/RelayNetworkTypes';
import type {NormalizationOperation} from '../util/NormalizationNode';
import type {Variables} from '../util/RelayRuntimeTypes';
import type {NormalizationOptions} from './RelayResponseNormalizer';
import type {
  NormalizationSelector,
  NormalizeResponseFunction,
  RelayResponsePayload,
} from './RelayStoreTypes';

const defaultGetDataID = require('./defaultGetDataID');
const {ROOT_ID, ROOT_TYPE} = require('./RelayStoreUtils');
const warning = require('warning');

type Config = Readonly<{
  getDataID?: (fieldValue: {+[string]: unknown}, typeName: string) => unknown,
  normalizeResponse: NormalizeResponseFunction,
  operation: NormalizationOperation,
  treatMissingFieldsAsNull?: boolean,
  variables: Variables,
}>;

/**
 * Per-request normalization engine. Normalizes raw server responses and
 * emits RelayResponsePayload objects (with isPreNormalized: true) that
 * OperationExecutor can commit directly to the store, bypassing the
 * normalization pass it would otherwise perform.
 *
 * Phase 1: Handles initial (non-incremental) responses.
 * Future phases will add @defer/@stream/@module handling.
 */
class NormalizationEngine {
  _normalizeResponse: NormalizeResponseFunction;
  _options: NormalizationOptions;
  _rootSelector: NormalizationSelector;
  _useExecTimeResolvers: boolean;

  constructor(config: Config) {
    this._normalizeResponse = config.normalizeResponse;
    this._rootSelector = {
      dataID: ROOT_ID,
      node: config.operation,
      variables: config.variables,
    };
    this._options = {
      deferDeduplicatedFields: false,
      getDataID: config.getDataID ?? defaultGetDataID,
      log: null,
      path: [],
      treatMissingFieldsAsNull: config.treatMissingFieldsAsNull ?? false,
    };
    this._useExecTimeResolvers =
      config.operation.use_exec_time_resolvers ??
      config.operation.exec_time_resolvers_enabled_provider?.get() === true ??
      false;
  }

  processResponse(response: GraphQLResponseWithData): RelayResponsePayload {
    const payload = this._normalizeResponse(
      response,
      this._rootSelector,
      ROOT_TYPE,
      this._options,
      this._useExecTimeResolvers,
    );

    if (__DEV__) {
      if (
        payload.followupPayloads != null &&
        payload.followupPayloads.length > 0
      ) {
        warning(
          false,
          'NormalizationEngine: dropping followupPayloads (@module/@match). ' +
            'These are not yet supported in network-layer normalization.',
        );
      }
      if (
        payload.incrementalPlaceholders != null &&
        payload.incrementalPlaceholders.length > 0
      ) {
        warning(
          false,
          'NormalizationEngine: dropping incrementalPlaceholders ' +
            '(@defer/@stream). These are not yet supported in ' +
            'network-layer normalization.',
        );
      }
    }

    return {
      ...payload,
      followupPayloads: null,
      incrementalPlaceholders: null,
      isPreNormalized: true,
    };
  }
}

module.exports = NormalizationEngine;
