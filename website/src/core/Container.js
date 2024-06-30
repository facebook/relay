/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

import classNames from 'classnames';
import * as React from 'react';

export default function Container({
  background,
  children,
  className,
  id,
  padding = [],
  wrapper = true,
}) {
  const containerClasses = classNames('container', className, {
    darkBackground: background === 'dark',
    highlightBackground: background === 'highlight',
    lightBackground: background === 'light',
    paddingAll: padding.indexOf('all') >= 0,
    paddingBottom: padding.indexOf('bottom') >= 0,
    paddingLeft: padding.indexOf('left') >= 0,
    paddingRight: padding.indexOf('right') >= 0,
    paddingTop: padding.indexOf('top') >= 0,
  });
  let wrappedChildren;

  if (wrapper) {
    wrappedChildren = <div className="wrapper">{children}</div>;
  } else {
    wrappedChildren = children;
  }
  return (
    <div className={containerClasses} id={id}>
      {wrappedChildren}
    </div>
  );
}
