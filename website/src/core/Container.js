/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

/* eslint-disable lint/no-value-import */
import classNames from 'classnames';
import * as React from 'react';
/* eslint-enable lint/no-value-import */

const Container = (props) => {
  const containerClasses = classNames('container', props.className, {
    darkBackground: props.background === 'dark',
    highlightBackground: props.background === 'highlight',
    lightBackground: props.background === 'light',
    paddingAll: props.padding.indexOf('all') >= 0,
    paddingBottom: props.padding.indexOf('bottom') >= 0,
    paddingLeft: props.padding.indexOf('left') >= 0,
    paddingRight: props.padding.indexOf('right') >= 0,
    paddingTop: props.padding.indexOf('top') >= 0,
  });
  let wrappedChildren;

  if (props.wrapper) {
    wrappedChildren = <div className="wrapper">{props.children}</div>;
  } else {
    wrappedChildren = props.children;
  }
  return (
    <div className={containerClasses} id={props.id}>
      {wrappedChildren}
    </div>
  );
};

// eslint-disable-next-line lint/react-no-defaultProps
Container.defaultProps = {
  background: null,
  padding: [],
  wrapper: true,
};

export default Container;
