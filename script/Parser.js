export const Parser = function (allTokens) {
  const operators = ["=", "-", "+", "*", "/", ">", "!=", "<", "<=", ">=", "=="];

  function walk(tokens) {
    if (tokens.length === 1) {
      if (tokens[0].type === "number") {
        return {
          type: "NumberLiteral",
          value: tokens[0].value,
        };
      }
      if (tokens[0].type === "string") {
        return {
          type: "StringLiteral",
          value: tokens[0].value,
        };
      }
      if (tokens[0].type === "variable") {
        return {
          type: "VariableDeclaration",
          value: tokens[0].value,
        };
      }
    }
    let node = {};
    let current = 0;

    while (current < tokens.length) {
      if (operators.includes(tokens[current].value)) {
        const index = current;
        const leftTokens = tokens.slice(0, index);
        const rightTokens = tokens.slice(index + 1);
        node = {
          type: "CallExpression",
          value: tokens[current].value,
          left: walk(leftTokens),
          right: walk(rightTokens),
        };
        break;
      }
      if (["for", "if", "while"].includes(tokens[current].name)) {
        const leftTokens = tokens[current + 1];
        const rightTokens = tokens[current + 2];
        console.log(leftTokens, rightTokens);
        node = {
          type: `${
            tokens[current].name === "if" || tokens[current].name === "while"
              ? "ifStatement"
              : "loopStatement"
          }`,
          name: tokens[current].name,
          left: {
            type: "statementConditions",
            body:
              tokens[current].name === "if" || tokens[current].name === "while"
                ? [walk(leftTokens.body)]
                : leftTokens.body.map((tokens) => walk(tokens)),
          },
          right: {
            type: "statementDeclarations",
            body: rightTokens.body.map((tokens) => walk(tokens)),
          },
        };
        break;
      }

      current++;
    }
    return node;
  }
  const body = [];
  allTokens.forEach((tokens) => {
    body.push(walk(tokens));
  });
  const Program = {
    type: "program",
    body: body,
  };

  return Program;
};
