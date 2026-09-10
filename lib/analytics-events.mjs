export function behaviorEvent(name, locale, value, context) {
  return {
    name,
    properties: {
      locale,
      value,
      ...(context === undefined ? {} : { context }),
    },
  };
}
