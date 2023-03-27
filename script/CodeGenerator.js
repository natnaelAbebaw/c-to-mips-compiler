import { Traverser } from "./Traverser1.js";
export const codeGenerator = function (node) {
  let data = ".data\n";
  let text = ".text\n";

  const visitors = {
    program: {
      enter(child, parent) {},
    },
    printStatement: {
      enter(child, parent) {},
      exit(child, parent) {
        if (child.mipsText) {
          text += child.mipsText;
        }
      },
    },
    ifStatement: {
      enter(child, parent) {},
      exit(child, parent) {
        text += child.mipsText;
      },
    },
    loopStatement: {
      enter(child, parent) {},
      exit(child, parent) {
        text += child.mipsText;
      },
    },
    statementConditions: {
      exit(child, parent) {
        if (child.mipsText) {
          text += child.mipsText;
        }
      },
    },
    statementDeclarations: {},
    CallExpression: {
      exit(child, parent) {
        if (child.mipsText) {
          text += child.mipsText + "\n";
        }
      },
    },
    VariableDeclaration: {
      enter(child, parent) {
        if (child.mipsText) {
          text += child.mipsText + "\n";
        }
        if (child.mipsData) {
          data += child.mipsData + "\n";
        }
      },
    },
    StringLiteral: {
      enter(child, parent) {
        if (child.mipsText) {
          text += child.mipsText + "\n";
        }
        if (child.mipsData) {
          data += child.mipsData + "\n";
        }
      },
    },
    NumberLiteral: {
      enter(child, parent) {
        if (child.mipsText) {
          text += child.mipsText + "\n";
        }
        if (child.mipsData) {
          console.log(child.mipsData);
          data += child.mipsData + "\n";
        }
      },
    },
  };

  Traverser(node, visitors);

  const mipsCode = data + "\n" + text;

  return mipsCode;
};
