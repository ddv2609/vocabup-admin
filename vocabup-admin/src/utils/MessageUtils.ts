export type NestedMessages = {
  [key: string]: string | NestedMessages;
};

const flattenMessages = (
  nestedMessages: NestedMessages,
  prefix: string = ""
) => {
  return Object.keys(nestedMessages).reduce(
    (messages: { [key: string]: string }, key) => {
      const value = nestedMessages[key];
      const prefixedKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === "object") {
        Object.assign(
          messages,
          flattenMessages(value as NestedMessages, prefixedKey || "")
        );
      } else {
        messages[prefixedKey] = value;
      }

      return messages;
    },
    {}
  );
};

export default {
  flattenMessages,
};
