/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::artifact_content::ArtifactContent;
use super::Artifact;
use crate::{config::PersistConfig, errors::BuildProjectError};
use persist_query::persist;

pub async fn persist_operations(
    artifacts: &mut [Artifact<'_>],
    persist_config: &PersistConfig,
) -> Result<(), BuildProjectError> {
    for artifact in artifacts {
        // TODO(T66884025) this should try to read the existing persist id from the
        // artifact on disk if the hash matches.
        if let ArtifactContent::Operation { text, id, .. } = &mut artifact.content {
            let persisted_id = persist(&text, &persist_config.url, &persist_config.params)
                .await
                .map_err(BuildProjectError::PersistError)?;
            *id = Some(persisted_id);
        }
    }
    Ok(())
}
