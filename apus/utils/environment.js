const isNode = () => (typeof process !== 'undefined');
// eslint-disable-next-line no-restricted-globals
const isBrowser = () => (typeof window !== 'undefined');

export { isBrowser, isNode };
