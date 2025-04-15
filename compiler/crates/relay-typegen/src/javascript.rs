/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::fmt::Result as FmtResult;
use std::fmt::Write;

use crate::writer::AST;
use crate::writer::Writer;

#[derive(Default)]
pub struct JavaScriptPrinter {
    result: String,
}

impl Write for JavaScriptPrinter {
    fn write_str(&mut self, s: &str) -> FmtResult {
        self.result.write_str(s)
    }
}

impl Writer for JavaScriptPrinter {
    fn into_string(self: Box<Self>) -> String {
        self.result
    }

    fn write(&mut self, _ast: &AST) -> FmtResult {
        Ok(())
    }

    fn get_runtime_fragment_import(&self) -> &'static str {
        ""
    }

    fn write_type_assertion(&mut self, _name: &str, _value: &AST) -> FmtResult {
        Ok(())
    }

    fn write_export_type(&mut self, _name: &str, _value: &AST) -> FmtResult {
        Ok(())
    }

    fn write_import_module_default(&mut self, _name: &str, _from: &str) -> FmtResult {
        Ok(())
    }

    fn write_import_module_named(
        &mut self,
        _name: &str,
        _alias: Option<&str>,
        _from: &str,
    ) -> FmtResult {
        Ok(())
    }

    fn write_import_type(&mut self, _types: &[&str], _from: &str) -> FmtResult {
        Ok(())
    }

    fn write_import_fragment_type(&mut self, _types: &[&str], _from: &str) -> FmtResult {
        Ok(())
    }

    fn write_export_fragment_type(&mut self, _name: &str) -> FmtResult {
        Ok(())
    }

    fn write_export_fragment_types(
        &mut self,
        _fragment_type_name_1: &str,
        _fragment_type_name_2: &str,
    ) -> FmtResult {
        Ok(())
    }

    fn write_any_type_definition(&mut self, _name: &str) -> FmtResult {
        Ok(())
    }
}
