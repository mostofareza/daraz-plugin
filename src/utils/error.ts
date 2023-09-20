export class ErrorParser {
  static parseAlreadyExistsErrorMessage(
    message: string
  ): { key: string; value: string }[] {
    const result: { key: string; value: string }[] = [];

    // Match key-value pairs in the message
    const regex = /Key\s*\(([^)]+)\)=\(([^)]+)\)/g;
    let match;

    while ((match = regex.exec(message))) {
      const [, keys, values] = match;
      const keyArray = keys.split(", ");
      const valueArray = values.split(", ");

      for (let i = 0; i < keyArray.length; i++) {
        const key = keyArray[i].trim();
        const value = valueArray[i].trim();
        result.push({ key, value: value });
      }
    }

    return result;
  }
}
