export default function ({Plugin, types: t}) {
  return new Plugin('babel-relay-playground', {
    visitor: {
      CallExpression(node) {
        var callee = this.get('callee');
        if (
          callee.matchesPattern('React.render') ||
          callee.matchesPattern('ReactDOM.render')
        ) {
          // We found a ReactDOM.render(...) type call.
          // Pluck the ReactElement from the call, and export it instead.
          return t.exportDefaultDeclaration(node.arguments[0]);
        }
      },
    },
  });
}
