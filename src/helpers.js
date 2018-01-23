let idCounter = 0;

export const noop = () => {};

// eslint-disable-next-line no-plusplus
export const uuid = () => ++idCounter;
