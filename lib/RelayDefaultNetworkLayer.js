'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var Promise = require('fbjs/lib/Promise');

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
 * 
 */

'use strict';

var fetch = require('fbjs/lib/fetch');
var fetchWithRetries = require('fbjs/lib/fetchWithRetries');

var RelayDefaultNetworkLayer = (function () {
  // InitWithRetries

  function RelayDefaultNetworkLayer(uri, init) {
    _classCallCheck(this, RelayDefaultNetworkLayer);

    this._uri = uri;
    this._init = _extends({}, init);

    // Bind instance methods to facilitate reuse when creating custom network
    // layers.
    var self = this;
    self.sendMutation = this.sendMutation.bind(this);
    self.sendQueries = this.sendQueries.bind(this);
    self.supports = this.supports.bind(this);
  }

  /**
   * Rejects HTTP responses with a status code that is not >= 200 and < 300.
   * This is done to follow the internal behavior of `fetchWithRetries`.
   */

  RelayDefaultNetworkLayer.prototype.sendMutation = function sendMutation(request) {
    return this._sendMutation(request).then(function (result) {
      return result.json();
    }).then(function (payload) {
      if (payload.hasOwnProperty('errors')) {
        var error = new Error('Server request for mutation `' + request.getDebugName() + '` ' + 'failed for the following reasons:\n\n' + formatRequestErrors(request, payload.errors));
        error.source = payload;
        request.reject(error);
      } else {
        request.resolve({ response: payload.data });
      }
    })['catch'](function (error) {
      return request.reject(error);
    });
  };

  RelayDefaultNetworkLayer.prototype.sendQueries = function sendQueries(requests) {
    var _this = this;

    return Promise.all(requests.map(function (request) {
      return _this._sendQuery(request).then(function (result) {
        return result.json();
      }).then(function (payload) {
        if (payload.hasOwnProperty('errors')) {
          var error = new Error('Server request for query `' + request.getDebugName() + '` ' + 'failed for the following reasons:\n\n' + formatRequestErrors(request, payload.errors));
          error.source = payload;
          request.reject(error);
        } else if (!payload.hasOwnProperty('data')) {
          request.reject(new Error('Server response was missing for query `' + request.getDebugName() + '`.'));
        } else {
          request.resolve({ response: payload.data });
        }
      })['catch'](function (error) {
        return request.reject(error);
      });
    }));
  };

  RelayDefaultNetworkLayer.prototype.supports = function supports() {
    // Does not support the only defined option, "defer".
    return false;
  };

  /**
   * Sends a POST request with optional files.
   */

  RelayDefaultNetworkLayer.prototype._sendMutation = function _sendMutation(request) {
    var init;
    var files = request.getFiles();
    if (files) {
      if (!global.FormData) {
        throw new Error('Uploading files without `FormData` not supported.');
      }
      var formData = new FormData();
      formData.append('query', request.getQueryString());
      formData.append('variables', JSON.stringify(request.getVariables()));
      for (var filename in files) {
        if (files.hasOwnProperty(filename)) {
          formData.append(filename, files[filename]);
        }
      }
      init = _extends({}, this._init, {
        body: formData,
        method: 'POST'
      });
    } else {
      init = _extends({}, this._init, {
        body: JSON.stringify({
          query: request.getQueryString(),
          variables: request.getVariables()
        }),
        headers: _extends({}, this._init.headers, {
          'Accept': '*/*',
          'Content-Type': 'application/json'
        }),
        method: 'POST'
      });
    }
    return fetch(this._uri, init).then(throwOnServerError);
  };

  /**
   * Sends a POST request and retries if the request fails or times out.
   */

  RelayDefaultNetworkLayer.prototype._sendQuery = function _sendQuery(request) {
    return fetchWithRetries(this._uri, _extends({}, this._init, {
      body: JSON.stringify({
        query: request.getQueryString(),
        variables: request.getVariables()
      }),
      headers: _extends({}, this._init.headers, {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      }),
      method: 'POST'
    }));
  };

  return RelayDefaultNetworkLayer;
})();

function throwOnServerError(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    throw response;
  }
}

/**
 * Formats an error response from GraphQL server request.
 */
function formatRequestErrors(request, errors) {
  var CONTEXT_BEFORE = 20;
  var CONTEXT_LENGTH = 60;

  var queryLines = request.getQueryString().split('\n');
  return errors.map(function (_ref, ii) {
    var locations = _ref.locations;
    var message = _ref.message;

    var prefix = ii + 1 + '. ';
    var indent = ' '.repeat(prefix.length);

    //custom errors thrown in graphql-server may not have locations
    var locationMessage = locations ? '\n' + locations.map(function (_ref2) {
      var column = _ref2.column;
      var line = _ref2.line;

      var queryLine = queryLines[line - 1];
      var offset = Math.min(column - 1, CONTEXT_BEFORE);
      return [queryLine.substr(column - 1 - offset, CONTEXT_LENGTH), ' '.repeat(offset) + '^^^'].map(function (messageLine) {
        return indent + messageLine;
      }).join('\n');
    }).join('\n') : '';

    return prefix + message + locationMessage;
  }).join('\n');
}

module.exports = RelayDefaultNetworkLayer;