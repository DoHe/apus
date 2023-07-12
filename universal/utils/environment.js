const isNode = () => (typeof process !== 'undefined' && process.versions && process.versions.node);
// eslint-disable-next-line no-restricted-globals
const isBrowser = () => ((typeof window !== 'undefined' || typeof self !== 'undefined'));

export { isBrowser, isNode };
