import { nodeOps } from './nodeOps';
import { patchProp } from './propPatch';

import { createRenderer as renderer } from '@vue/runtime-core';

const renderOptions = Object.assign(nodeOps, { patchProp });

// 用户自己创建渲染器
export function createRenderer(renderOptions) {
	return renderer(renderOptions);
}
// vue内置渲染器，自动传入domApi
export function render(vnode, container) {
	const renderer = createRenderer(renderOptions);
	renderer.render(vnode, container);
}

export * from '@vue/runtime-core';
