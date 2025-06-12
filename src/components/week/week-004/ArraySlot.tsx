import {
	initial,
	nodeName,
	Rect,
	RectProps,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	DEFAULT,
	easeInOutCubic,
	easeInQuad,
	map,
	Reference,
	SignalValue,
	SimpleSignal,
	TimingFunction,
	tween,
	Vector2,
} from '@motion-canvas/core';

export interface ArraySlotProps extends RectProps {
	itemSize: SignalValue<number>;
	startSmall?: boolean;
}

export const emptyStr = '[empty]';
@nodeName('ArraySlot')
export class ArraySlot extends Rect {
	@signal()
	public declare readonly itemSize: SimpleSignal<number, this>;

	txt: Reference<Txt>;

	@initial(1)
	@signal()
	public declare readonly opacityScale: SimpleSignal<number, this>;

	constructor(props: ArraySlotProps) {
		super(props);

		if (!props.startSmall) this.size(this.itemSize);

		this.justifyContent('center');
		this.alignItems('center');

		const t = createSignal(() => this.height() / this.itemSize());

		const opacity = createSignal(() => {
			return this.opacityScale() * (props.startSmall ? map(0, 1, t()) : 1);
		});
		this.opacity(opacity);

		const scale = props.startSmall
			? createSignal(() => map(0.25, 1, easeInQuad(t())))
			: 1;

		this.removeChildren();

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

	*scaleTo(size: number, dur = 0.5, timingFunction?: TimingFunction) {
		yield* all(
			this.itemSize(size, dur, timingFunction),
			this.size(size, dur, timingFunction),
		);
	}

	_text(str: string = this.txt().text()) {
		if (str !== '' && Number.isNaN(parseInt(str)) && str !== emptyStr) {
			str = `'${str}'`.replaceAll("''", "'");
		}
		const targetOpacity = str !== emptyStr ? 1 : 0.5;
		return {
			str,
			targetOpacity,
		};
	}

	*overlapArraySlot(other: ArraySlot, offset = Vector2.zero, dur = 0.7) {
		const start = this.absolutePosition();
		const target = other.absolutePosition().add(offset);
		yield* tween(dur, (value) => {
			const t = easeInOutCubic(value);
			this.absolutePosition(Vector2.arcLerp(start, target, t));
		});
	}

	growIn(dur = 0.5) {
		return this.size(0).size(this.itemSize(), dur);
	}

	shrinkOut(dur = 0.5) {
		return this.size(0, dur);
	}

	fadeOut(dur = 0.5) {
		return this.opacityScale(0, dur);
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
