/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashMap;
use std::path::PathBuf;

use crate::lsp::publish_diagnostic;
use crate::lsp::{Connection, Diagnostic, PublishDiagnosticsParams, Url};

pub struct ServerState {
    active_diagnostics: HashMap<Url, Vec<Diagnostic>>,
    pub root_dir: PathBuf,
}

impl ServerState {
    pub fn new(root_dir: PathBuf) -> Self {
        ServerState {
            active_diagnostics: Default::default(),
            root_dir,
        }
    }

    pub fn add_diagnostic(&mut self, url: Url, diagnostic: Diagnostic) {
        self.active_diagnostics
            .entry(url)
            .or_default()
            .push(diagnostic);
    }

    pub fn clear_diagnostics(&mut self) {
        for diagnostics in self.active_diagnostics.values_mut() {
            diagnostics.clear();
        }
    }

    pub fn commit_diagnostics(&mut self, connection: &Connection) {
        for (url, diagnostics) in &self.active_diagnostics {
            let params = PublishDiagnosticsParams {
                diagnostics: diagnostics.clone(),
                uri: url.clone(),
                version: None,
            };
            publish_diagnostic(params, &connection).ok();
        }
    }
}
