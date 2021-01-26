/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::compiler_state::{ProjectName, ProjectSet, SourceSet};

#[derive(Debug, PartialEq, Eq, Hash)]
pub enum FileGroup {
    Generated { project_name: ProjectName },
    Schema { project_set: ProjectSet },
    Extension { project_set: ProjectSet },
    Source { source_set: SourceSet },
}
