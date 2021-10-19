/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use lsp_types::notification::Notification;

use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};

pub struct LSPNotificationDispatch<'state, TState> {
    notification: lsp_server::Notification,
    state: &'state TState,
}

impl<'state, TState> LSPNotificationDispatch<'state, TState> {
    pub fn new(notification: lsp_server::Notification, state: &'state TState) -> Self {
        LSPNotificationDispatch {
            notification,
            state,
        }
    }

    /// Calls handler if the LSPNotificationDispatch's notification's method matches
    /// the method of TNotification. Returns a Result which will be Ok if the handler
    /// was not called, or Err if the handler was called.
    /// Thus, multiple calls to `on_notification_sync(...)?` can be chained. Doing so will
    /// cause LSPNotificationDispatch to execute the first matching handler, if any.
    pub fn on_notification_sync<TNotification: Notification>(
        self,
        handler: fn(&TState, TNotification::Params) -> LSPRuntimeResult<()>,
    ) -> Result<Self, Option<LSPRuntimeError>> {
        if self.notification.method == TNotification::METHOD {
            let params = extract_notification_params::<TNotification>(self.notification);
            // TODO propagate these errors
            let response = handler(self.state, params);

            return Err(response.err());
        }

        Ok(self)
    }

    pub fn notification(self) -> lsp_server::Notification {
        self.notification
    }
}

fn extract_notification_params<N>(notification: lsp_server::Notification) -> N::Params
where
    N: Notification,
{
    notification
        .extract(N::METHOD)
        .expect("extract_notification_params: could not extract notification param")
}

#[cfg(test)]
mod test {
    use lsp_types::{
        notification::{LogMessage, Notification, TelemetryEvent},
        LogMessageParams, MessageType,
    };
    use std::sync::atomic::{AtomicI32, Ordering};

    use crate::lsp_runtime_error::{LSPRuntimeError, LSPRuntimeResult};

    use super::LSPNotificationDispatch;

    #[test]
    fn calls_first_matching_notification_handler() {
        let state: AtomicI32 = AtomicI32::new(0);
        let dispatch = LSPNotificationDispatch::new(
            lsp_server::Notification {
                method: "window/logMessage".to_string(),
                params: serde_json::to_value(LogMessageParams {
                    typ: MessageType::Error,
                    message: "Use Relay!".to_string(),
                })
                .unwrap(),
            },
            &state,
        );
        let dispatch = || -> Result<(), Option<LSPRuntimeError>> {
            dispatch
                .on_notification_sync::<TelemetryEvent>(telemetry_handler)?
                .on_notification_sync::<LogMessage>(log_message_handler)?;
            Ok(())
        };
        let result = dispatch();
        assert!(result.is_err());
        assert_eq!(state.load(Ordering::Relaxed), 2);
    }

    fn telemetry_handler(
        state: &AtomicI32,
        _params: <TelemetryEvent as Notification>::Params,
    ) -> LSPRuntimeResult<()> {
        state.store(1, Ordering::Relaxed);

        Ok(())
    }

    fn log_message_handler(
        state: &AtomicI32,
        _params: <LogMessage as Notification>::Params,
    ) -> LSPRuntimeResult<()> {
        state.store(2, Ordering::Relaxed);

        Ok(())
    }
}
