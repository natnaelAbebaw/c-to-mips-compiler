export const TokenizerM = function (string) {
  const Alltokens = [];
  let stringMod = "";
  let brk = "";
  let strings = "";
  let allTokens = [];

  // replace the ;-colon with :-colon in the loop condtional
  // inorder to fix the problem on spliting by the statement by ;-colon
  if (
    string.includes("for") ||
    string.includes("if") ||
    string.includes("while")
  ) {
    for (let char of string) {
      if (char === "(" || char === "{") {
        brk += char;
      }
      if (char === ")" || char === "}") {
        brk = "";
      }

      if (char === ";" && (brk === "(" || brk === "{")) {
        stringMod += ":";
        continue;
      }
      stringMod += char;
    }
    strings = stringMod.split(";");
  } else {
    strings = string.split(";");
  }

  //remove the item in the array formed by the last ;-colon on the string;
  if (strings[strings.length - 1].trim().length === 0) {
    strings.pop();
  }

  const stringLiteral = function (string, index) {
    let str = "";
    index++;
    while (
      string[index] !== '"' ||
      (string[index] !== "'" && index < string.length)
    ) {
      str += string[index];
      index++;
    }
    return { str, index };
  };

  const numberLiteral = function (string, index) {
    let number = "";
    let numbers = /[0-9.]/;
    while (numbers.test(string[index]) && index < string.length) {
      number += string[index];
      index++;
    }
    return { number, index };
  };
  const variableDeclaration = function (string, index) {
    let variable = "";
    let words = /^[A-Za-z_]+$/;
    while (words.test(string[index]) && index < string.length) {
      variable += string[index];
      index++;
    }
    variable = variable.replace("_", " ");
    return { variable, index };
  };

  function TokenizeDeclarations(string) {
    const str = string.trim();
    let tokens = [];
    let newstring = "";
    if (
      string.startsWith("int") ||
      string.startsWith("string") ||
      string.startsWith("float")
    ) {
      newstring = str.trim().replace(" ", "_");
    } else {
      newstring = str;
    }
    let current = 0;
    while (current < newstring.length) {
      if (newstring[current] === '"' || newstring[current] === "'") {
        const { str, index } = stringLiteral(newstring, current);
        tokens.push({
          type: "string",
          value: str,
        });
        current = index + 1;
      }

      let numbers = /[0-9.]/;
      if (newstring[current] && numbers.test(newstring[current])) {
        const { number, index } = numberLiteral(newstring, current);
        tokens.push({
          type: "number",
          value: number,
        });
        current = index;
      }

      let words = /^[A-Za-z_]+$/;
      if (newstring[current] && words.test(newstring[current])) {
        const { variable, index } = variableDeclaration(newstring, current);
        tokens.push({
          type: "variable",
          value: variable,
        });
        current = index;
      }

      let space = /\s/;
      if (newstring[current] && space.test(newstring[current])) {
        current++;
        // continue;
      }

      const operators = ["-", "+", "*", "/", "(", ")"];
      if (newstring[current] && operators.includes(newstring[current])) {
        let operator = string[current];
        current++;
        tokens.push({
          type: "operator",
          value: operator,
        });
      }

      const comparsions = ["<", ">"];
      let comparionSymbol = "";
      if (
        newstring[current] &&
        comparsions.includes(newstring[current]) &&
        newstring[current + 1] !== "="
      ) {
        comparionSymbol = newstring[current];
        current++;
        tokens.push({
          type: "comparsion",
          value: comparionSymbol,
        });
      }

      if (
        newstring[current] &&
        ["<", ">", "!"].includes(newstring[current]) &&
        newstring[current + 1] === "="
      ) {
        comparionSymbol = newstring[current] + newstring[current + 1];
        current += 2;
        tokens.push({
          type: "comparsion",
          value: comparionSymbol,
        });
      }

      if (newstring[current] === "=" && newstring[current + 1] === "=") {
        current += 2;
        tokens.push({
          type: "comparsion",
          value: "==",
        });
      }

      if (newstring[current] === "=" && newstring[current + 1] !== "=") {
        current++;
        tokens.push({
          type: "operator",
          value: "=",
        });
      }
    }
    return tokens;
  }

  function TokenizeStatement(string) {
    // split the loop statement by ();
    let Parentheses = /[()]/;
    let tokens = [];

    let newstr = string.split(Parentheses);
    let [statementType, statementConditions, statementDeclarations] = newstr;

    const statementExpression = {
      type: "statementExpression",
      name: statementType.trim(),
    };
    tokens.push(statementExpression);
    const statementConditionsArr = statementConditions.trim().split(":");
    if (
      statementType.trim() === "if" ||
      statementType.trim() === "while" ||
      statementType.trim() === "system.out.println"
    ) {
      const statementConditionsObj = {
        type: "statementConditions",
        body: TokenizeDeclarations(statementConditionsArr.join("")),
      };
      tokens.push(statementConditionsObj);
      console.log(tokens);
    }

    const increment = statementConditionsArr.splice(-1);
    if (statementType.trim() === "for") {
      if (increment.join("").endsWith("++")) {
        const newDeclaration = `${increment
          .join("")
          .trim()
          .slice(0, 1)} = ${increment.join("").trim().slice(0, 1)} + 1`;
        statementConditionsArr.push(newDeclaration);
      }
      if (increment.join("").endsWith("--")) {
        const newDeclaration = `${increment
          .join("")
          .trim()
          .slice(0, 1)} = ${increment.join("").trim().slice(0, 1)} - 1`;
        statementConditionsArr.push(newDeclaration);
      }
      if (increment.join("").includes("+=")) {
        const newDeclaration = `${increment
          .join("")
          .trim()
          .slice(0, 1)} = ${increment.join("").trim().slice(0, 1)} + ${increment
          .join("")
          .trim()
          .slice(-1)}`;
        statementConditionsArr.push(newDeclaration);
      }

      if (increment.join("").includes("-=")) {
        const newDeclaration = `${increment
          .join("")
          .trim()
          .slice(0, 1)} = ${increment.join("").trim().slice(0, 1)} - ${increment
          .join("")
          .trim()
          .slice(-1)}`;
        statementConditionsArr.push(newDeclaration);
      }
      const statementConditionsObj = {
        type: "statementConditions",
        body: statementConditionsArr.map((dec) => TokenizeDeclarations(dec)),
      };
      tokens.push(statementConditionsObj);
    }
    statementDeclarations = statementDeclarations.trim().slice(1, -1).trim();
    statementDeclarations = statementDeclarations.endsWith(":")
      ? statementDeclarations.slice(0, -1)
      : statementDeclarations;
    const statementDeclarationsArr = statementDeclarations.split(":");
    const statementDeclarationsObj = {
      type: "statementDeclarations",
      body: statementDeclarationsArr.map((dec) =>
        TokenizeDeclarations(dec.trim())
      ),
    };
    tokens.push(statementDeclarationsObj);

    return tokens;
  }

  strings.forEach((string) => {
    if (
      string.trim().startsWith("for") ||
      string.trim().startsWith("if") ||
      string.trim().startsWith("while") ||
      string.trim().startsWith("system.out.println")
    ) {
      allTokens.push(TokenizeStatement(string.trim()));
    } else {
      allTokens.push(TokenizeDeclarations(string.trim()));
    }
  });
  return allTokens;
};
