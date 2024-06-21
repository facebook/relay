/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_syntax::FragmentArgumentSyntaxKind;
use graphql_syntax::ParserFeatures;
use relay_config::ProjectConfig;

pub fn get_parser_features(project_config: &ProjectConfig) -> ParserFeatures {
    ParserFeatures {
        fragment_argument_capability: if project_config
            .feature_flags
            .enable_fragment_argument_transform
        {
            FragmentArgumentSyntaxKind::SpreadArgumentsAndFragmentVariableDefinitions
        } else {
            FragmentArgumentSyntaxKind::None
        },
    }
}
