import { ShapeFlages, isSameVnode } from '@vue/shared';
import { getSeq } from './seq';
import { Fragment } from './createVNode';
import { reactive, ReactiveEffect } from "@vue/reactivity";

export function createRenderer(renderOptions) {
	const {
		createElement: hostCreateElement,
		createText: hostCreateText,
		createComment: hostCreateComment,
		insert: hostInsert,
		remove: hostRemove,
		nextSibling: hostNextSibling,
		setElementText: hostSetElementText,
		querySelector: hostQuerySelector,
		createELementText: hostCreateELementText,
		parentNode: hostParentNode,
		patchProp: hostPatchProp,
	} = renderOptions;

	const mountChildren = (children, container) => {
		children.forEach((child) => {
			patch(null, child, container);
		});
	};
	const unmountChildren = (children) => {
		children.forEach((child) => {
			unmount(child);
		});
	};
	const unmount = (vnode) => {
		const { type, shapeFlag, children } = vnode;
		if (type === Fragment) {
			return unmountChildren(children);
		}
		hostRemove(vnode.el);
	};
	const mountElement = (vnode, container, anchor = null) => {
		// 遍历虚拟节点 虚拟节点->真实节点
		const { type, props, children, shapeFlag } = vnode;
		const el = (vnode.el = hostCreateElement(type));
		if (props) {
			// 属性
			for (let key in props) {
				hostPatchProp(el, key, null, props[key]);
			}
		}
		if (children) {
			if (shapeFlag & ShapeFlages.TEXT_CHILDREN) {
				hostSetElementText(el, children);
			} else if (shapeFlag & ShapeFlages.ARRAY_CHILDREN) {
				mountChildren(children, el);
			}
		}
		hostInsert(el, container, anchor);
	};
	const patchProps = (oldProps, newProps, el) => {
		if (oldProps === newProps) return;
		for (let key in newProps) {
			let prevVal = oldProps[key];
			let nextVal = newProps[key];
			if (prevVal !== nextVal) {
				hostPatchProp(el, key, prevVal, nextVal);
			}
		}
		for (let key in oldProps) {
			if (!(key in newProps)) {
				hostPatchProp(el, key, oldProps[key], null);
			}
		}
	};

	const patchKeyChildren = (c1, c2, el) => {
		/**
		 * vue3 采用
		 *    1. 同序列挂载和卸载
		 *    2. 最长递增子序列 计算最小偏移量
		 */
		let i = 0;
		let e1 = c1.length - 1;
		let e2 = c2.length - 1;
		// 从开头开始比较
		while (i <= e1 && i <= e2) {
			let n1 = c1[i];
			let n2 = c2[i];
			if (isSameVnode(n1, n2)) {
				patch(n1, n2, el);
			} else {
				break;
			}
			i++;
		}
		// 从后往前比较
		while (i <= e1 && i <= e2) {
			let n1 = c1[e1];
			let n2 = c2[e2];
			if (isSameVnode(n1, n2)) {
				patch(n1, n2, el);
			} else {
				break;
			}
			e1--;
			e2--;
		}
		// abc, abcde, i=3 e1=2 e2 = 4
		// 新的多老的少

		if (i > e1) {
			// 新的多老的少
			while (i <= e2) {
				const nextPos = e2 + 1;
				const anchor = c2[nextPos]?.el; //获取下一个元素的el
				patch(null, c2[i], el, anchor);
				i++;
			}
		} else if (i > e2) {
			// 老的多新的少 需要卸载
			while (i <= e1) {
				unmount(c1[i]);
				i++;
			}
		}
		let s1 = i;
		let s2 = i;
		const keyToNewIndexMap = new Map();
		const toBePatched = e2 - s2 + 1; //新的儿子有多少个元素需要被patch
		const newIndexToOldIndex = new Array(toBePatched).fill(0);

		for (let i = s2; i <= e2; i++) {
			keyToNewIndexMap.set(c2[i].key, i);
		}
		for (let i = s1; i <= e1; i++) {
			const vnode = c1[i];
			let newIndex = keyToNewIndexMap.get(vnode.key);
			if (newIndex === undefined) {
				//老的里面有新的没有 删除老的
				unmount(vnode);
			} else {
				// 让被patched过的索引用老的节点的索引作为表示防止出现0的情况+1
				newIndexToOldIndex[newIndex - s2] = i + 1;
				//老的虚拟节点 和新的虚拟节点做比对 ，这里只比较自己的属性和儿子  并没有移动
				patch(vnode, c2[newIndex], el);
			}
		}
		const increasingNewIndexSequence = getSeq(newIndexToOldIndex);
		let j = increasingNewIndexSequence.length - 1; // 取出数组的最后一个索引
		console.log(newIndexToOldIndex);

		// 需要计算移动哪些节点  最长递增子序列进行移动
		for (let i = toBePatched - 1; i >= 0; i--) {
			const curIndex = s2 + i;
			const curNode = c2[curIndex];
			const anchor = c2[curIndex + 1]?.el;
			if (newIndexToOldIndex[i] == 0) {
				// 新的节点
				patch(null, curNode, el, anchor);
			} else {
				if (i == increasingNewIndexSequence[j]) {
					// 如果当前这一项和 序列中相等，说明不用做任何操作，直接跳过即可
					j--;
				} else {
					hostInsert(curNode.el, el, anchor);
				}
			}
		}
	};

	// 比较双方儿子节点差异
	const patchChildren = (n1, n2, el) => {
		let c1 = n1.children;
		let c2 = n2.children;
		let prevShapeFlag = n1.shapeFlag;
		let shapeFlag = n2.shapeFlag;
		// 当前是文本  之前就是空 文本 数组
		if (shapeFlag & ShapeFlages.TEXT_CHILDREN) {
			// 新的是文本
			if (prevShapeFlag & ShapeFlages.ARRAY_CHILDREN) {
				// 老的是数组 都移除既可
				unmountChildren(c1);
			}
			// 新的是文本 老的可能是文本 或者空
			if (c1 !== c2) {
				hostSetElementText(el, c2);
			}
		} else {
			// 之前是数组
			if (prevShapeFlag & ShapeFlages.ARRAY_CHILDREN) {
				if (shapeFlag & ShapeFlages.ARRAY_CHILDREN) {
					// 双方都是数组 核心diff算法
					patchKeyChildren(c1, c2, el);
				} else {
					// 为空的情况
					unmountChildren(c1);
				}
			} else {
				// 老的是文本 或者空
				if (prevShapeFlag & ShapeFlages.TEXT_CHILDREN) {
					hostSetElementText(el, '');
				}
				if (shapeFlag & ShapeFlages.ARRAY_CHILDREN) {
					mountChildren(c2, el);
				}
			}
		}
		/**
		 * 老的是空 新的是文本
		 * 老的儿子是文本、新的儿子是文本
		 * 老的是数组、新的是文本
		 * 老的是数组、新的也是数组
		 * 老的是数组、新的没儿子
		 * 老的是文本、新的没儿子
		 * 老的儿子是文本、新的是数组
		 * 来的为空、新的是数组
		 * 新老都没有儿子
		 * 全量diff算法： 从根节点开始比 对比完之后，再去比较下一个节点 直到最终子节点
		 * 递归先序， 深度遍历，（全量比较消耗性能，有些节点不需要diff） vue3 靶向更新方式
		 * patchFlage + blockTree 编译优化  只有写模板的时候，才享受这种优化
		 */
	};
	const patchElement = (n1, n2) => {
		let el = (n2.el = n1.el); //将老的虚拟节点上的dom复用给新的虚拟节点
		const oldProps = n1.props || {};
		const newProps = n2.props || {};

		// 比较前后属性的差异 diff prop
		patchProps(oldProps, newProps, el);
		// 比较子节点的差异
		patchChildren(n1, n2, el);
	};
	const porcessElement = (n1, n2, container, anchor = null) => {
		if (n1 == null) {
			mountElement(n2, container, anchor);
		} else {
			// 元素更新 属性变化， 更新属性
			patchElement(n1, n2);
		}
	};

	const progressText = (n1, n2, el) => {
		// 处理文本类型
		if (n1 == null) {
			hostInsert((n2.el = hostCreateText(n2.children)), el);
		} else {
			const el = (n2.el = n1.el);
			if (n2.children !== n1.children) {
				hostSetElementText(el, n2.children);
			}
		}
	};
	const progressFragment = (n1, n2, el) => {
		// 处理fragment类型
		if (n1 == null) {
			mountChildren(n2.children, el);
		} else {
			patchKeyChildren(n1.children, n2.children, el);
		}
	};
	const mountComponent = (n2, el, anchor) => {
		//组件的数据和渲染函数
		const { data = () => ({}), render } = n2.type;
		const state = reactive(data());

		const componentUpdateFn = () => {
			// 组件要渲染的 虚拟节点是render函数的返回值
			// 组件有自己的虚拟节点，返回的虚拟节点是subTree
			const subTree = render.call(state, state);
			console.log(subTree);
			
		};
		const effect = new ReactiveEffect(componentUpdateFn, null);
		effect.run();
	};
	const updateComponent = (n1, n2, el, anchor) => {};
	const processComponent = (n1, n2, el, anchor) => {
		if (n1 == null) {
			mountComponent(n2, el, anchor);
		} else {
			// 组件更新
			updateComponent(n1, n2, el, anchor);
		}
	};
	const patch = (n1, n2, container, anchor = null) => {
		// 初次渲染 n1 为null
		//更新节点
		if (n1 && !isSameVnode(n1, n2)) {
			unmount(n1);
			n1 = null;
		}
		const { type, shapeFlag } = n2;
		switch (type) {
			case Text:
				progressText(n1, n2, container);
				break;
			case Fragment:
				progressFragment(n1, n2, container);
				break;

			default:
				if (shapeFlag & ShapeFlages.ELEMENT) {
					//元素处理
					porcessElement(n1, n2, container, anchor);
				} else if (shapeFlag & ShapeFlages.STATEFUL_COMPONENT) {
					//组件处理
					processComponent(n1, n2, container, anchor);
				}
				break;
		}
	};

	const render = (vnode, container) => {
		/**
		 * 虚拟节点的创建--->最终生成真实dom
		 * 1. 卸载 render(null,app)
		 * 2. 更新 之前渲染过（产生虚拟节点），现在再渲染 ，再次产生虚拟节点 需要diff
		 * 3. 初次挂载
		 */
		if (vnode == null) {
			//卸载逻辑
			container._vnode && unmount(container._vnode);
		} else {
			patch(container._vnode || null, vnode, container);
		}
		container._vnode = vnode;
	};

	return {
		render,
	};
}
