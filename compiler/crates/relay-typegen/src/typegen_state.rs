/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::{writer::Writer, LOCAL_3D_PAYLOAD, RELAY_RUNTIME};
use std::fmt::Result as FmtResult;

/// A struct that is mutated as we iterate through an operation/fragment and
/// contains information about whether and how to write import types.
#[derive(Default)]
pub(crate) struct RuntimeImports {
    pub(crate) local_3d_payload_type_should_be_imported: bool,
    pub(crate) generic_fragment_type_should_be_imported: bool,
}

impl RuntimeImports {
    pub(crate) fn write_runtime_imports(&self, writer: &mut Box<dyn Writer>) -> FmtResult {
        match self {
            RuntimeImports {
                local_3d_payload_type_should_be_imported: true,
                generic_fragment_type_should_be_imported: true,
            } => writer.write_import_type(
                &[writer.get_runtime_fragment_import(), LOCAL_3D_PAYLOAD],
                RELAY_RUNTIME,
            ),
            RuntimeImports {
                local_3d_payload_type_should_be_imported: true,
                generic_fragment_type_should_be_imported: false,
            } => writer.write_import_type(&[LOCAL_3D_PAYLOAD], RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload_type_should_be_imported: false,
                generic_fragment_type_should_be_imported: true,
            } => writer.write_import_type(&[writer.get_runtime_fragment_import()], RELAY_RUNTIME),
            RuntimeImports {
                local_3d_payload_type_should_be_imported: false,
                generic_fragment_type_should_be_imported: false,
            } => Ok(()),
        }
    }
}
