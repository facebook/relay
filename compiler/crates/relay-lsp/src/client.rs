/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//! An LSP client implementation, currently used only for testing
#[cfg(test)]
use lsp_server::{Connection, Message, Notification, Request as ServerRequest, RequestId};
#[cfg(test)]
use lsp_types::{
    request::{Initialize, Request},
    InitializeParams, InitializedParams,
};

#[cfg(test)]
pub fn initialize(client: &Connection, params: &InitializeParams, request_id: u64) {
    let request_id = RequestId::from(request_id.to_string());
    let request = ServerRequest {
        id: request_id,
        method: Initialize::METHOD.to_string(),
        params: serde_json::to_value(params).unwrap(),
    };
    let msg = Message::Request(request);
    client.sender.send(msg).unwrap();
    let notification = Message::Notification(Notification {
        method: "initialized".to_string(),
        params: serde_json::to_value(InitializedParams {}).unwrap(),
    });
    client.sender.send(notification).unwrap();
}
