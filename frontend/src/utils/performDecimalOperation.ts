import Decimal from "decimal.js";

export const performDecimalOperation = (
  num1Str: string | number,
  operation: string | number,
  num2Str: string | number,
) => {
  try {
    const num1 = new Decimal(num1Str);
    const num2 = new Decimal(num2Str);
    let result;

    switch (operation) {
      case "+":
        result = num1.plus(num2);
        break;
      case "-":
        result = num1.minus(num2);
        break;
      case "*":
        result = num1.times(num2);
        break;
      case "/":
        if (num2.isZero()) {
          throw new Error("Division by zero is not allowed.");
        }
        result = num1.div(num2);
        break;
      default:
        throw new Error("Invalid operation. Please use '+', '-', '*', or '/'.");
    }
    return result.toFixed(2);
  } catch (error) {
    return `Error: ${error}`;
  }
};
