import { nodeName, Rect, RectProps, Txt } from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	DEFAULT,
	easeInQuad,
	map,
	Reference,
} from '@motion-canvas/core';

export interface ArraySlotProps extends RectProps {
	itemSize: number;
	startSmall?: boolean;
}

export const emptyStr = '[empty]';
@nodeName('ArraySlot')
export class ArraySlot extends Rect {
	txt: Reference<Txt>;

	constructor(props: ArraySlotProps) {
		super(props);

		const { itemSize } = props;

		if (!props.startSmall) this.size(itemSize);

		this.justifyContent('center');
		this.alignItems('center');

		const t = createSignal(() => this.height() / itemSize);

		const opacity = props.startSmall ? createSignal(() => map(0, 1, t())) : 1;
		this.opacity(opacity);

		const scale = props.startSmall
			? createSignal(() => map(0.25, 1, easeInQuad(t())))
			: 1;

		const txt = createRef<Txt>();
		const fontSize = createSignal(() => {
			return txt().text() === emptyStr ? 32 : 48;
		});
		this.add(
			<Txt
				ref={txt}
				fontFamily={'monospace'}
				textAlign={'center'}
				text={emptyStr}
				fill="lightgray"
				scale={scale}
				fontSize={fontSize}
				opacity={0.5}
			/>,
		);
		this.txt = txt;
	}

	_text(str: string = this.txt().text()) {
		if (Number.isNaN(parseInt(str)) && str !== emptyStr) {
			str = `'${str}'`.replaceAll("''", "'");
		}
		const targetOpacity = str !== emptyStr ? 1 : 0.5;
		return {
			str,
			targetOpacity,
		};
	}

	setText(str: string) {
		const { str: _str, targetOpacity } = this._text(str);
		this.txt().text(_str);
		this.txt().opacity(targetOpacity);
	}

	*updateText(str: string, fill = '#fe7') {
		const { str: _str, targetOpacity } = this._text(str);
		yield* all(this.txt().opacity(0, 0.3), this.fill('#ffffff66', 0.4));
		this.txt().text(_str);
		this.txt().fill(fill);
		yield* all(
			this.txt().opacity(fill === '#fe7' ? 1 : targetOpacity, 0.3),
			this.fill(DEFAULT, 0.4),
		);
	}
}
