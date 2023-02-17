export function patchStyle(el, preVal, nextVal) {
	const style = el.style;
	if (nextVal) {
		// 如果新的值存在
		for (const key in nextVal) {
			style[key] = nextVal[key];
		}
	}
	if (preVal) {
		for (const key in preVal) {
			if (nextVal[key] !== null) {
				style[key] = nextVal[key];
			}
		}
	}
}
