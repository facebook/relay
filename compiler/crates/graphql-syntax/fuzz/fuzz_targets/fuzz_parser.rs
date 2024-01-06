#![no_main]

extern crate libfuzzer_sys;

use std::hint::black_box;

use arbitrary::Arbitrary;
use common::SourceLocationKey;
use graphql_syntax::parse_document_with_features;
use graphql_syntax::ParserFeatures;
use libfuzzer_sys::fuzz_target;

#[derive(Debug, Arbitrary)]
struct Ctx<'a> {
    source: &'a str,
    features: ParserFeatures,
}

fuzz_target!(|ctx: Ctx| {
    match parse_document_with_features(ctx.source, SourceLocationKey::Generated, ctx.features) {
        Ok(document) => {
            _ = black_box(format!("{document:?}"));
        }
        Err(e) => {
            _ = black_box(format!("{e:?}"));
        }
    }
});
