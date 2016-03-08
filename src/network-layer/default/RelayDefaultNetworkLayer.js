/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDefaultNetworkLayer
 * @typechecks
 * @flow
 */

'use strict';

import type RelayMutationRequest from 'RelayMutationRequest';
import type RelayQueryRequest from 'RelayQueryRequest';

const fetch = require('fetch');
const fetchWithRetries = require('fetchWithRetries');
import type {InitWithRetries} from 'fetchWithRetries';

type GraphQLError = {
  message: string;
  locations: Array<GraphQLErrorLocation>;
};
type GraphQLErrorLocation = {
  column: number;
  line: number;
};

class RelayDefaultNetworkLayer {
  _uri: string;
  _init: $FlowIssue; // InitWithRetries

  constructor(uri: string, init?: ?InitWithRetries) {
    this._uri = uri;
    this._init = {...init};

    // Facilitate reuse when creating custom network layers.
    (this: any).sendMutation = this.sendMutation.bind(this);
    (this: any).sendQueries = this.sendQueries.bind(this);
    (this: any).supports = this.supports.bind(this);
  }

  sendMutation(request: RelayMutationRequest): ?Promise {
    return this._sendMutation(request).then(
      result => result.json()
    ).then(payload => {
      if (payload.hasOwnProperty('errors')) {
        const error = new Error(
          'Server request for mutation `' + request.getDebugName() + '` ' +
          'failed for the following reasons:\n\n' +
          formatRequestErrors(request, payload.errors)
        );
        (error: any).source = payload;
        request.reject(error);
      } else {
        request.resolve({response: payload.data});
      }
    }).catch(
      error => request.reject(error)
    );
  }

  sendQueries(requests: Array<RelayQueryRequest>): ?Promise {
    return Promise.all(requests.map(request => (
      this._sendQuery(request).then(
        result => result.json()
      ).then(payload => {
        if (payload.hasOwnProperty('errors')) {
          const error = new Error(
            'Server request for query `' + request.getDebugName() + '` ' +
            'failed for the following reasons:\n\n' +
            formatRequestErrors(request, payload.errors)
          );
          (error: any).source = payload;
          request.reject(error);
        } else if (!payload.hasOwnProperty('data')) {
          request.reject(new Error(
            'Server response was missing for query `' + request.getDebugName() +
            '`.'
          ));
        } else {
          request.resolve({response: payload.data});
        }
      }).catch(
        error => request.reject(error)
      )
    )));
  }

  supports(...options: Array<string>): boolean {
    // Does not support the only defined option, "defer".
    return false;
  }

  /**
   * Sends a POST request with optional files.
   */
  _sendMutation(request: RelayMutationRequest): Promise {
    let init;
    const files = request.getFiles();
    if (files) {
      if (!global.FormData) {
        throw new Error('Uploading files without `FormData` not supported.');
      }
      const formData = new FormData();
      formData.append('query', request.getQueryString());
      formData.append('variables', JSON.stringify(request.getVariables()));
      for (const filename in files) {
        if (files.hasOwnProperty(filename)) {
          formData.append(filename, files[filename]);
        }
      }
      init = {
        ...this._init,
        body: formData,
        method: 'POST',
      };
    } else {
      init = {
        ...this._init,
        body: JSON.stringify({
          query: request.getQueryString(),
          variables: request.getVariables(),
        }),
        headers: {
          ...this._init.headers,
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      };
    }
    return fetch(this._uri, init).then(throwOnServerError);
  }

  /**
   * Sends a POST request and retries if the request fails or times out.
   */
  _sendQuery(request: RelayQueryRequest): Promise {
    return fetchWithRetries(this._uri, {
      ...this._init,
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables(),
      }),
      headers: {
        ...this._init.headers,
        'Accept': '*/*',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  }
}

/**
 * Rejects HTTP responses with a status code that is not >= 200 and < 300.
 * This is done to follow the internal behavior of `fetchWithRetries`.
 */
function throwOnServerError(response: any): any  {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw response;
  }
}

/**
 * Formats an error response from GraphQL server request.
 */
function formatRequestErrors(
  request: RelayMutationRequest | RelayQueryRequest,
  errors: Array<GraphQLError>
): string {
  const CONTEXT_BEFORE = 20;
  const CONTEXT_LENGTH = 60;

  const queryLines = request.getQueryString().split('\n');
  return errors.map(({locations, message}, ii) => {
    const prefix = (ii + 1) + '. ';
    const indent = ' '.repeat(prefix.length);

    //custom errors thrown in graphql-server may not have locations
    const locationMessage = locations ?
      ('\n' + locations.map(({column, line}) => {
        const queryLine = queryLines[line - 1];
        const offset = Math.min(column - 1, CONTEXT_BEFORE);
        return [
          queryLine.substr(column - 1 - offset, CONTEXT_LENGTH),
          ' '.repeat(offset) + '^^^',
        ].map(messageLine => indent + messageLine).join('\n');
      }).join('\n')) :
      '';

    return prefix + message + locationMessage;

  }).join('\n');
}

module.exports = RelayDefaultNetworkLayer;
