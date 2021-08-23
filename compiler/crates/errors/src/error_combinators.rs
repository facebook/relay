/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use common::sync::*;
// use rayon::prelude::*;

// Helpers for unwrapping multiple Results to aggregate all success values or all error values.

pub fn try2<T1, T2, E>(t1: Result<T1, Vec<E>>, t2: Result<T2, Vec<E>>) -> Result<(T1, T2), Vec<E>> {
    match (t1, t2) {
        (Ok(t1), Ok(t2)) => Ok((t1, t2)),
        (Ok(_), Err(errors)) => Err(errors),
        (Err(errors), Ok(_)) => Err(errors),
        (Err(mut errors1), Err(errors2)) => {
            errors1.extend(errors2);
            Err(errors1)
        }
    }
}

pub fn try3<T1, T2, T3, E>(
    t1: Result<T1, Vec<E>>,
    t2: Result<T2, Vec<E>>,
    t3: Result<T3, Vec<E>>,
) -> Result<(T1, T2, T3), Vec<E>> {
    let mut errors = Vec::new();
    let t1 = match t1 {
        Ok(t1) => Some(t1),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    let t2 = match t2 {
        Ok(t2) => Some(t2),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    let t3 = match t3 {
        Ok(t3) => Some(t3),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok((t1.unwrap(), t2.unwrap(), t3.unwrap()))
    }
}

pub fn try4<T1, T2, T3, T4, E>(
    t1: Result<T1, Vec<E>>,
    t2: Result<T2, Vec<E>>,
    t3: Result<T3, Vec<E>>,
    t4: Result<T4, Vec<E>>,
) -> Result<(T1, T2, T3, T4), Vec<E>> {
    let mut errors = Vec::new();
    let t1 = match t1 {
        Ok(t1) => Some(t1),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    let t2 = match t2 {
        Ok(t2) => Some(t2),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    let t3 = match t3 {
        Ok(t3) => Some(t3),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    let t4 = match t4 {
        Ok(t4) => Some(t4),
        Err(e) => {
            errors.extend(e);
            None
        }
    };
    if !errors.is_empty() {
        Err(errors)
    } else {
        Ok((t1.unwrap(), t2.unwrap(), t3.unwrap(), t4.unwrap()))
    }
}

/// Given an iterable of Result values, returns all the success values if all items are
/// `Ok` or all the error values if one or more items were `Err`.
pub fn try_all<T, E, I>(items: I) -> Result<Vec<T>, Vec<E>>
where
    I: IntoIterator<Item = Result<T, Vec<E>>>,
{
    try_map(items, |x| x)
}

/// Transforms the items of a list with a fallible transform function, returning either
/// all the transformed values if all items succeeded or a list of all errors if one or
/// more items could not be tansformed.
pub fn try_map<T, E, U, I, F>(items: I, mut f: F) -> Result<Vec<T>, Vec<E>>
where
    I: IntoIterator<Item = U>,
    F: FnMut(U) -> Result<T, Vec<E>>,
{
    let iter = items.into_iter();
    let mut errors = Vec::new();
    let mut values = Vec::with_capacity(iter.size_hint().1.unwrap_or_default());
    for item in iter {
        match f(item) {
            Ok(item_value) => values.push(item_value),
            Err(item_errors) => errors.extend(item_errors),
        }
    }
    if errors.is_empty() {
        Ok(values)
    } else {
        Err(errors)
    }
}

/// Similar to `try_map` but performs the transform in parallel.
pub fn par_try_map<T: Sync + Send, E: Sync + Send, U: Sync + Send, I, F: Sync + Send>(
    items: I,
    f: F,
) -> Result<Vec<T>, Vec<E>>
where
    I: IntoParallelIterator<Item = U> + IntoIterator<Item = U>,
    F: Fn(U) -> Result<T, Vec<E>>,
{
    let results: Vec<Result<T, Vec<E>>> = par_iter(items).map(f).collect();
    let mut errors = Vec::new();
    let mut values = Vec::with_capacity(results.len());
    for result in results {
        match result {
            Ok(item_value) => values.push(item_value),
            Err(item_errors) => errors.extend(item_errors),
        }
    }
    if errors.is_empty() {
        Ok(values)
    } else {
        Err(errors)
    }
}

#[macro_export]
macro_rules! validate {
    ($($args:expr),*) => {{
        let mut errors = Vec::new();
        $(
            match $args {
                Ok(_) => {},
                Err(e) => {
                    errors.extend(e);
                }
            }
        )*
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }}
}

pub fn validate_map<T, E, U, I, F>(items: I, f: F) -> Result<(), Vec<E>>
where
    I: IntoIterator<Item = U>,
    F: FnMut(U) -> Result<T, Vec<E>>,
{
    try_map(items, f)?;
    Ok(())
}
