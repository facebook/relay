/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use super::*;

#[test]
fn test_string_intern() {
    let key: StringKey = "test".intern(); // str (reference)
    let key2: StringKey = "test".to_owned().intern(); // String (owned)
    assert_eq!(key2, key);
    assert_eq!(key.lookup(), "test");

    let key3: StringKey = "testx".to_owned().intern();
    assert_ne!(key3, key);
    assert_ne!(key3, key2);
    assert_eq!(key3.lookup(), "testx");
}

#[test]
fn test_bytes_intern() {
    let key: BytesKey = b"test".intern();
    let str_id: StringKey = "test".intern();
    let key2: BytesKey = str_id.as_bytes();
    assert_eq!(key2, key);
    assert_eq!(key.lookup(), b"test");

    let key3: BytesKey = b"testx".intern();
    assert_ne!(key3, key);
    assert_ne!(key3, key2);
    assert_eq!(key3.lookup(), b"testx");
}

#[test]
fn test_custom_intern() {
    #[derive(Clone, Eq, PartialEq, Hash, Ord, PartialOrd, Debug)]
    pub struct User {
        name: String,
    }

    make_intern!(User as UserKey);

    let key: UserKey = User {
        name: "Joe".to_owned(),
    }
    .intern();
    let key2: UserKey = User {
        name: "Joe".to_owned(),
    }
    .intern();
    assert_eq!(key2, key);
    assert_eq!(
        key.lookup(),
        &User {
            name: "Joe".to_owned()
        }
    );

    let key3: UserKey = User {
        name: "Jan".to_owned(),
    }
    .intern();
    assert_ne!(key3, key);
    assert_ne!(key3, key2);
    assert_eq!(
        key3.lookup(),
        &User {
            name: "Jan".to_owned()
        }
    );
}
