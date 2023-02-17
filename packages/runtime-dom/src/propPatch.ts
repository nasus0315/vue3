import { nodeOps } from './nodeOps';

import { patchClass } from './modules/class';
import { patchStyle } from './modules/style';
import { patchEvent } from './modules/event';
import { patchAttr } from './modules/attr';

export function patchProp(el, key, preVal, nextVal) {
	if (key === 'class') {
		patchClass(el, nextVal);
	} else if (key === 'style') {
		patchStyle(el, preVal, nextVal);
	} else if (/^on[^a-z]/.test(key)) {
		patchEvent(el, key, nextVal);
	} else {
		patchAttr(el, key, nextVal);
	}
}
