/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{ProjectName, ProjectSet, SourceSet};

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum FileGroup {
    Generated {
        project_name: ProjectName,
    },
    Schema {
        project_set: ProjectSet,
    },
    Extension {
        project_set: ProjectSet,
    },
    Source {
        source_set: SourceSet,
    },
    /// Files, that are located in the generated directory, but not created
    /// by relay compiler (utility files: .gitkeep, README, etc.) and should
    /// be ignored
    Ignore,
}
