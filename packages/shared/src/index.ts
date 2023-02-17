export const isObject = (value) => {
	return value !== null && typeof value === 'object';
};
export const isFunction = (value) => {
	return typeof value === 'function';
};
export const isString = (value) => {
	return typeof value === 'string';
};
export function isSameVnode(n1, n2) {
	return n1.type === n2.type && n1.key === n2.key;
}
export * from './shapeFlag';
