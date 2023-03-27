export const Traverser = function (ast, visitor) {
  function traverseChild(node) {
    if (node.type === "program" || node.type === "statementDeclarations") {
      node.body.forEach((statement) => {
        traverseNode(statement, node);
      });
      //   traverseNode(node.body, node);
    }
    if (node.type === "printStatement") {
      traverseNode(node.left, node);
    }
    if (
      node.type === "CallExpression" ||
      node.type === "ifStatement" ||
      node.type === "loopStatement"
    ) {
      traverseNode(node.left, node);
      traverseNode(node.right, node);
    }
  }

  function traverseNode(child, parent) {
    const methods = visitor[child.type];
    if (methods && methods.enter) {
      methods.enter(child, parent);
    }
    switch (child.type) {
      case "program":
        traverseChild(child);
        break;
      case "CallExpression":
        traverseChild(child);
        break;
      case "ifStatement":
        traverseChild(child);
        break;
      case "loopStatement":
        traverseChild(child);
        break;
      case "printStatement":
        traverseChild(child);
        break;
      case "statementConditions":
        traverseChild(child);
        break;
      case "statementDeclarations":
        traverseChild(child);
        break;

      case "VariableDeclaration":
      case "NumberLiteral":
      case "StringLiteral":
        break;
    }

    if (methods && methods.exit) {
      methods.exit(child, parent);
    }
  }

  traverseNode(ast, null);
};
