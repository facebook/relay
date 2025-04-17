/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::ops::ControlFlow;

use lsp_types::notification::Notification;

use crate::lsp_runtime_error::LSPRuntimeError;
use crate::lsp_runtime_error::LSPRuntimeResult;

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
    /// the method of TNotification. Returns a ControlFlow which will be Break if the handler
    /// was called, or Continue otherwise.
    /// Thus, multiple calls to `on_notification_sync(...)?` can be chained. Doing so will
    /// cause LSPNotificationDispatch to execute the first matching handler, if any.
    pub fn on_notification_sync<TNotification: Notification>(
        self,
        handler: fn(&TState, TNotification::Params) -> LSPRuntimeResult<()>,
    ) -> ControlFlow<Option<LSPRuntimeError>, Self> {
        if self.notification.method == TNotification::METHOD {
            let params = extract_notification_params::<TNotification>(self.notification);
            // TODO propagate these errors
            let response = handler(self.state, params);

            return ControlFlow::Break(response.err());
        }

        ControlFlow::Continue(self)
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
    use std::ops::ControlFlow;
    use std::sync::atomic::AtomicI32;
    use std::sync::atomic::Ordering;

    use lsp_types::LogMessageParams;
    use lsp_types::MessageType;
    use lsp_types::notification::LogMessage;
    use lsp_types::notification::Notification;
    use lsp_types::notification::TelemetryEvent;

    use super::LSPNotificationDispatch;
    use crate::lsp_runtime_error::LSPRuntimeResult;

    #[test]
    fn calls_first_matching_notification_handler() {
        let state: AtomicI32 = AtomicI32::new(0);
        let dispatch = LSPNotificationDispatch::new(
            lsp_server::Notification {
                method: "window/logMessage".to_string(),
                params: serde_json::to_value(LogMessageParams {
                    typ: MessageType::ERROR,
                    message: "Use Relay!".to_string(),
                })
                .unwrap(),
            },
            &state,
        );
        let dispatch = || {
            dispatch
                .on_notification_sync::<TelemetryEvent>(telemetry_handler)?
                .on_notification_sync::<LogMessage>(log_message_handler)?;
            ControlFlow::Continue(())
        };

        let result = dispatch();
        assert!(result.is_break());
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
