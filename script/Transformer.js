import { Traverser } from "./Traverser.js";
const tempRegisters = [
  "$s9",
  "$s8",
  "$s7",
  "$s6",
  "$s5",
  "$s4",
  "$s3",
  "$s2",
  "$s1",
  "$s0",
  "$t9",
  "$t8",
  "$t7",
  "$t6",
  "$t5",
  "$t4",
  "$t3",
  "$t2",
  "$t1",
  "$t0",
];
const usedTempRegisters = [];

function assignRegister() {
  let temp;
  if (tempRegisters.length === 0) {
    tempRegisters = [...usedTempRegisters];
    let usedTempRegisters = [];
  }

  temp = tempRegisters.pop();
  usedTempRegisters.push(temp);
  return temp;
}
const typeChecker = function (child) {
  if (child.left.dataTypes !== child.right.dataTypes) {
    throw new SyntaxError(
      `Unexpected dataType:${child.right.dataTypes} , expected :${child.left.dataTypes}`
    );
  }
};

const symbolTable = [];

export const Transform = function (ast) {
  const visitors = {
    program: {
      enter(child, parent) {},
    },
    printStatement: {
      enter(child, parent) {},
      exit(child, parent) {
        if (child.left.dataTypes === "string") {
          child.mipsText = `li $v0, 4\nla $a0, ${child.left.registor}\nsyscall`;
        }
      },
    },
    ifStatement: {
      enter(child, parent) {
        if (child.name === "if") {
          child.mipsText = "\nli $v0, 10\nsyscall\n";
        }
        if (child.name === "while") {
          child.mipsText = "j while\nexit:\nli $v0, 10\nsyscall\n";
        }
      },
    },
    loopStatement: {
      enter(child, parent) {},
      exit(child, parent) {
        if (child.name === "for") {
          child.mipsText =
            child.left.body[2].right.right.mipsText +
            "\n" +
            child.left.body[2].right.mipsText +
            "\n" +
            child.left.body[2].mipsText +
            "\n" +
            "j for \nexit:\nli $v0, 10\nsyscall\n";
        }
      },
    },
    statementConditions: {
      enter(child, parent) {
        child.name = parent.name;
      },
      exit(child, parent) {
        if (parent.name === "for") {
          child.mipsText =
            child.body[0].mipsText +
            "\n" +
            child.body[1].right.mipsText +
            "\n" +
            child.body[1].mipsText +
            "\n";
        }

        if (parent.name === "if") {
          const x = child.body[0].right.mipsText
            ? child.body[0].right.mipsText
            : "";
          child.mipsText =
            x + "\n" + child.body[0].mipsText + "\n" + "" + "\n" + "do:" + "\n";
        }

        if (parent.name === "while") {
          const x = child.body[0].right.mipsText
            ? child.body[0].right.mipsText
            : "";
          child.mipsText = x + "\n" + child.body[0].mipsText + "\n" + "" + "\n";
        }
      },
    },
    statementDeclarations: {
      enter(child, parent) {},
    },
    CallExpression: {
      exit(child, parent) {
        const registor1 = child.left.registor;
        const registor2 = child.right.registor;
        const temp = assignRegister();
        child.dataTypes = child.left.dataTypes;
        // console.log(child.dataTypes);
        function Arithmetic(child, operator) {
          child.mipsText = `${operator} ${child.registor} ,${registor1} ,${registor2}`;
        }
        function comparsion(child, exitCode, doCode) {
          if (parent.name === "for") {
            child.mipsText = `for: \n${exitCode} ${registor1} ,${registor2}, exit`;
          }
          if (parent.name === "if") {
            child.mipsText = `if: \n${doCode} ${registor1} ,${registor2} ,do`;
          }
          if (parent.name === "while") {
            child.mipsText = `while: \n${exitCode} ${registor1} ,${registor2}, exit`;
          }
        }
        child.registor = `${temp}`;
        if (child.value === "+") {
          typeChecker(child);
          Arithmetic(child, "add");
        }
        if (child.value === "=") {
          typeChecker(child);
          const mips = `move ${registor1}, ${registor2}`;
          child.mipsText = mips;
          if (
            parent.type === "statementConditions" &&
            !Number.isNaN(Number(child.right.value))
          ) {
            child.mipsText = `li ${registor1}, ${child.right.value}`;
          }
        }

        if (child.value === "-") {
          typeChecker(child);
          Arithmetic(child, "sub");
        }
        if (child.value === "*") {
          typeChecker(child);
          Arithmetic(child, "mul");
        }
        if (child.value === "/") {
          typeChecker(child);
          Arithmetic(child, "div");
        }
        if (child.value === "<") {
          comparsion(child, "beq", "blt");
        }
        if (child.value === ">") {
          comparsion(child, "beq", "bgt");
        }
        if (child.value === "<=") {
          comparsion(child, "bgt", "ble");
        }
        if (child.value === ">=") {
          comparsion(child, "blt", "bge");
        }
        if (child.value === "==") {
          comparsion(child, "_", "beq");
        }
        if (child.value === "!=") {
          comparsion(child, "_", "bne");
        }
      },
    },
    NumberLiteral: {
      enter(child, parent) {
        const temp = assignRegister();
        child.registor = `${temp}`;
        const mips = `li ${child.registor}, ${child.value}`;
        child.mipsText = mips;
        if (child.value.includes(".")) {
          child.dataTypes = "float";
        } else {
          child.dataTypes = "int";
        }
      },
    },
    VariableDeclaration: {
      enter(child, parent) {
        let variable = "";
        let varDataType = "";
        let dataType = "";
        if (child.value.includes(" ")) {
          const arr = child.value.split(" ");
          [varDataType, variable] = arr;
          if (varDataType === "string") {
            dataType = ".asciiz";
            child.dataTypes = "string";
          }

          if (varDataType === "int") {
            dataType = ".word";
            child.dataTypes = "int";
          }
          if (varDataType === "float") {
            dataType = ".float";
            child.dataTypes = "float";
          }
        }

        if (!child.value.includes(" ")) {
          variable = child.value;
        }

        const onSymbolTabel = symbolTable.some((obj) => obj.name === variable);

        if (!onSymbolTabel) {
          const temp = assignRegister();
          child.registor = `${temp}`;
          const obj = {
            name: variable,
            registor: child.registor,
            dataType: varDataType,
          };
          symbolTable.push(obj);
        }

        if (onSymbolTabel) {
          const obj = symbolTable.find((obj) => obj.name === variable);
          child.registor = obj.registor;
          varDataType = obj.dataType;
          child.dataTypes = varDataType;
          console.log(varDataType, "see");
        }
        child.varName = `${variable}`;
      },
    },
    StringLiteral: {
      enter(child, parent) {
        const temp = assignRegister();
        child.registor = `${temp}`;
        child.label = `str${temp.slice(1)}`;
        child.dataTypes = "string";
        child.mipsData = `${child.label}: .asciiz "${child.value}"`;
        child.mipsText = `la ${child.registor}, ${child.label}`;
      },
    },
  };

  Traverser(ast, visitors);

  return ast;
};
