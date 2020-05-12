/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::collections::HashSet;
use std::path::PathBuf;

use crate::lsp::publish_diagnostic;
use crate::lsp::{Connection, PublishDiagnosticsParams, Url};

pub struct ServerState {
    urls_with_active_diagnostics: HashSet<Url>,
    pub root_dir: PathBuf,
}

impl ServerState {
    pub fn new(root_dir: PathBuf) -> Self {
        ServerState {
            urls_with_active_diagnostics: HashSet::default(),
            root_dir,
        }
    }

    pub fn register_url_with_diagnostics(&mut self, url: Url) {
        self.urls_with_active_diagnostics.insert(url);
    }

    pub fn clear_diagnostics(&mut self, connection: &Connection) {
        for url in self.urls_with_active_diagnostics.drain() {
            let params = PublishDiagnosticsParams {
                diagnostics: vec![],
                uri: url,
                version: None,
            };
            publish_diagnostic(params, &connection).unwrap();
        }
    }
}
