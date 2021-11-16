/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::{Diagnostic, Location, SourceLocationKey, Span};
use graphql_cli::DiagnosticPrinter;

const EXAMPLE: &str = "fragment Example on User {
  photo(size: 40) {
    url
  }
}";

fn main() {
    let printer = DiagnosticPrinter::new(|_| Some(EXAMPLE.to_string()));

    let span_photo = Span::new(29, 34);
    let span_type = Span::new(20, 24);

    let source_location = SourceLocationKey::standalone("path/to/example.graphql");
    let location_field = Location::new(source_location, span_photo);
    let location_type = Location::new(source_location, span_type);

    let mut res = String::new();
    let diagnostic = Diagnostic::error("Field `photo` is not defined type `User`", location_field)
        .annotate("type defined here", location_type);
    printer.write_diagnostic(&mut res, &diagnostic).unwrap();
    print!("{}", res);
}
