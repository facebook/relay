/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, SourceLocationKey};
use fixture_tests::Fixture;
use graphql_cli::DiagnosticPrinter;
use schema::{
    build_schema_from_flat_buffer, build_schema_with_extensions, serialize_as_flatbuffer,
    SDLSchema, Schema, Type,
};
use std::collections::BTreeMap;

const SCHEMA_SEPARATOR: &str = "%extensions%";

pub fn transform_fixture(fixture: &Fixture<'_>) -> Result<String, String> {
    let parts: Vec<_> = fixture.content.split(SCHEMA_SEPARATOR).collect();
    let result = match parts.as_slice() {
        [base] => build_schema_with_extensions::<_, &str>(&[base], &[]),
        [base, extensions] => {
            // prepend a comment so the correct line + column number is reported for client extension
            // (since we source base and client schemas from one file)
            let nchars_base = base.chars().count() + SCHEMA_SEPARATOR.chars().count();
            assert!(nchars_base > 0);
            let prepended_extension = format!("{}\n{}", "#".repeat(nchars_base - 1), extensions);
            build_schema_with_extensions(
                &[base],
                &[(
                    prepended_extension,
                    SourceLocationKey::standalone(fixture.file_name),
                )],
            )
        }
        _ => panic!("Expected a single extension block"),
    };

    result
        .map(print_schema_and_flat_buffer_schema)
        .map_err(|diagnostics| diagnostics_to_sorted_string(fixture.content, &diagnostics))
}

fn print_schema_and_flat_buffer_schema(schema: SDLSchema) -> String {
    let schema = schema.unwrap_in_memory_impl();
    let bytes = serialize_as_flatbuffer(&schema);
    let fb_schema = build_schema_from_flat_buffer(&bytes).unwrap();
    let mut objects = Vec::new();
    let mut interfaces = Vec::new();
    let mut unions = Vec::new();
    let mut scalars = Vec::new();
    let mut enums = Vec::new();
    let mut input_objects = Vec::new();
    let mut fields = Vec::new();
    let mut directives = Vec::new();

    // Hydrate types
    for (key, _value) in schema.get_type_map().collect::<BTreeMap<_, _>>() {
        let type_ = fb_schema.get_type(*key).unwrap();
        // Hyderate fields
        match type_ {
            Type::Object(id) => {
                let object = fb_schema.object(id);
                for field_id in object.fields.clone() {
                    fields.push(fb_schema.field(field_id));
                }
                objects.push(object);
            }
            Type::Interface(id) => {
                let interface = fb_schema.interface(id);
                for field_id in interface.fields.clone() {
                    fields.push(fb_schema.field(field_id));
                }
                interfaces.push(interface);
            }
            Type::Union(id) => unions.push(fb_schema.union(id)),
            Type::Scalar(id) => scalars.push(fb_schema.scalar(id)),
            Type::Enum(id) => enums.push(fb_schema.enum_(id)),
            Type::InputObject(id) => input_objects.push(fb_schema.input_object(id)),
        };
    }
    // Hydrate directives
    let mut ordered_directives = schema.get_directives().collect::<Vec<_>>();
    ordered_directives.sort_by_key(|directive| directive.name);
    for directive in ordered_directives {
        directives.push(fb_schema.get_directive(directive.name).unwrap());
    }
    let fb_schema_snapshot = format!(
        r#"FB Schema {{
directives: {:#?}
enums: {:#?}
fields: {:#?}
input_objects: {:#?}
interfaces: {:#?}
objects: {:#?}
scalars: {:#?}
unions: {:#?}
}}"#,
        directives, enums, fields, input_objects, interfaces, objects, scalars, unions,
    );
    format!(
        "Text Schema:{}\n\nFlatBuffer Schema:{}",
        schema.snapshot_print(),
        fb_schema_snapshot
    )
}

// NOTE: copied from graphql-test-helpers to avoid cyclic dependency breaking Rust Analyzer
fn diagnostics_to_sorted_string(source: &str, diagnostics: &[Diagnostic]) -> String {
    let printer = DiagnosticPrinter::new(|_| Some(source.to_string()));
    let mut printed = diagnostics
        .iter()
        .map(|diagnostic| printer.diagnostic_to_string(diagnostic))
        .collect::<Vec<_>>();
    printed.sort();
    printed.join("\n\n")
}
