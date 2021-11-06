/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use crate::SchemaDocumentation;

pub struct CombinedSchemaDocumentation<
    TPrimary: SchemaDocumentation,
    TSecondary: SchemaDocumentation,
> {
    primary: TPrimary,
    secondary: TSecondary,
}

impl<TPrimary: SchemaDocumentation, TSecondary: SchemaDocumentation> SchemaDocumentation
    for CombinedSchemaDocumentation<TPrimary, TSecondary>
{
    fn get_type_description(&self, type_name: &str) -> Option<&str> {
        self.primary
            .get_type_description(type_name)
            .or_else(|| self.secondary.get_type_description(type_name))
    }

    fn get_field_description(&self, type_name: &str, field_name: &str) -> Option<&str> {
        self.primary
            .get_field_description(type_name, field_name)
            .or_else(|| self.secondary.get_field_description(type_name, field_name))
    }

    fn get_field_argument_description(
        &self,
        type_name: &str,
        field_name: &str,
        argument_name: &str,
    ) -> Option<&str> {
        self.primary
            .get_field_argument_description(type_name, field_name, argument_name)
            .or_else(|| {
                self.secondary
                    .get_field_argument_description(type_name, field_name, argument_name)
            })
    }
}

impl<'a, TPrimary: SchemaDocumentation, TSecondary: SchemaDocumentation>
    CombinedSchemaDocumentation<TPrimary, TSecondary>
{
    pub fn new(primary: TPrimary, secondary: TSecondary) -> Self {
        Self { primary, secondary }
    }
}
