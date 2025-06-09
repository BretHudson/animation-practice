import {
	Node,
	initial,
	Layout,
	signal,
	Shape,
	CanvasStyleSignal,
	PossibleCanvasStyle,
	Rect,
	Curve,
} from '@motion-canvas/2d';
import {
	all,
	chain,
	Color,
	cos,
	easeInCubic,
	easeInOutCirc,
	easeInOutCubic,
	easeInOutQuad,
	easeInQuad,
	easeInQuart,
	easeInQuint,
	easeOutCubic,
	easeOutQuad,
	easeOutQuart,
	easeOutQuint,
	linear,
	loop,
	map,
	sequence,
	Signal,
	SignalGenerator,
	SignalValue,
	SimpleSignal,
	sin,
	ThreadGenerator,
	TimingFunction,
	tween,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import {
	easeFullCosineRotation,
	easeFullSineRotation,
	tweenLoop,
} from '~/util';

export interface Effect {
	func: Function;
	value: any;
	dur?: number;
}

export class Effects<T extends Node> {
	node: AnimLayout<T>;
	effects: Effect[];
	constructor(node: AnimLayout<T>) {
		this.node = node;
		this.effects = [];
	}

	fadeIn(dur?: number) {
		this.effects.push({
			func: this.node.opacity,
			value: 1,
			dur,
		});
		return this;
	}

	fadeOut(dur?: number) {
		this.effects.push({
			func: this.node.opacity,
			value: 0,
			dur,
		});
		return this;
	}

	slideUp(dur?: number) {
		this.node.y(30);
		this.effects.push({
			func: this.node.y,
			value: 0,
			dur,
		});
		return this;
	}

	slideDown(dur?: number) {
		this.node.y(0);
		this.effects.push({
			func: this.node.y,
			value: 30,
			dur,
		});
		return this;
	}

	*all(baseDur = 0.3) {
		yield* all(
			...this.effects.map(({ func, value, dur = baseDur }) => {
				return func(value, dur);
			}),
		);
	}
}

export class AnimLayout<T extends Node> extends Layout {
	@initial(0.3)
	@signal()
	public declare readonly dur: SimpleSignal<number, this>;

	@initial(30)
	@signal()
	public declare readonly yOffset: SimpleSignal<number, this>;

	private queue: ThreadGenerator[] = [];

	public get node() {
		return this.childAs<T>(0);
	}

	public get outlineNode() {
		return this.childAs<Curve>(1);
	}

	// TODO(bret): add dur here
	*all() {
		const queue = this.queue.splice(0, this.queue.length);
		yield* all(...queue);
		this.opacity;
	}

	// TODO(bret): add another argument to immediately return the effect instead of pushing it??

	addEffect(effect: (typeof this.queue)[number]): this {
		this.queue.push(effect);
		return this;
	}

	fadeOut(dur = 0.3): this {
		return this.addEffect(this.opacity(0, dur));
	}

	// emphasis effects
	_pulse<
		T extends SimpleSignal<any, this> | CanvasStyleSignal<this>,
		U = T extends SimpleSignal<infer R, this>
			? R
			: T extends CanvasStyleSignal<T>
			? PossibleCanvasStyle
			: never,
	>(
		func: T,
		to: U,
		iterations = 3,
		dur = 1,
		timingFunction: TimingFunction = linear,
	): this {
		const initialValue = func();
		const effect = tweenLoop(
			dur * 2,
			iterations,
			(v) => {
				const t = easeFullCosineRotation(v);
				if (typeof to === 'number') {
					func(map(to, initialValue, t));
				} else if (to instanceof Color) {
					func(Color.lerp(to, initialValue, t));
				} else if (to instanceof Vector2) {
					func(Vector2.lerp(to, initialValue, t));
				} else {
					console.error('not supported', to);
				}
			},
			timingFunction,
		);
		return this.addEffect(effect);
	}

	pulse(
		to = 0,
		iterations = 3,
		dur = 1,
		timingFunction: TimingFunction = linear,
	): this {
		return this._pulse(this.opacity, to, iterations, dur, timingFunction);
	}

	colorPulse(
		to = new Color('#fff'),
		iterations = 3,
		dur = 1,
		timingFunction: TimingFunction = linear,
	): this {
		return this._pulse(
			// TODO(bret): Fix this later
			// @ts-expect-error
			(this.node as unknown as Shape).fill,
			to,
			iterations,
			dur,
			timingFunction,
		);
	}

	teeter(
		angle = 15,
		iterations = 3,
		dur = 1,
		timingFunction: TimingFunction = easeInOutCubic,
	): this {
		const start = this.rotation();
		const effect = tweenLoop(
			dur,
			iterations,
			(v) => {
				const t = Math.sin(v * 2 * Math.PI);
				this.rotation(start + angle * t);
			},
			timingFunction,
		);

		return this.addEffect(effect);
	}

	outline(dur = 1): this {
		const shape = this.node as unknown as Curve;
		const dist = shape.percentageToDistance(1);
		shape.lineDash([0, dist]);

		shape.lineDashOffset(0);
		shape.lineWidth(10);
		const third = dur / 3;

		// TODO(bret): hook this up with a timing function
		const effect = chain(
			shape.lineDash([dist, dist], third),
			waitFor(third),
			shape.lineDashOffset(-dist, third),
		);
		return this.addEffect(effect);
	}

	spin(
		dur = 1,
		iterations = 3,
		timingFunction: TimingFunction = easeInOutCubic,
	): this {
		const effect = tweenLoop(
			dur,
			iterations,
			(v) => {
				this.rotation(map(0, 360, v));
			},
			timingFunction,
		);
		return this.addEffect(effect);
	}

	effectScale(
		to: number,
		dur = 1,
		iterations = 1,
		timingFunction: TimingFunction = easeInOutCubic,
	): this {
		// this.node.fill('red');
		return this._pulse(
			this.scale,
			new Vector2(to),
			iterations,
			dur,
			timingFunction,
		);
	}

	effectGrow(
		to = 1.25,
		dur = 0.5,
		iterations = 1,
		timingFunction: TimingFunction = easeInOutCubic,
	): this {
		return this.effectScale(to, dur, iterations, timingFunction);
	}

	effectShrink(
		to = 1 / 1.25,
		dur = 0.5,
		iterations = 1,
		timingFunction: TimingFunction = easeInOutCubic,
	): this {
		return this.effectScale(to, dur, iterations, timingFunction);
	}

	effectWiggle(
		offset = 20,
		iterations = 2,
		dur = 0.6,
		timingFunction: TimingFunction = easeInOutQuad,
	): this {
		const start = this.x();
		const effect = tweenLoop(
			dur,
			iterations,
			(v) => {
				const t = Math.sin(v * 2 * Math.PI);
				this.x(start + offset * t);
			},
			timingFunction,
		);

		return this.addEffect(effect);
	}

	effectAlarmClock(
		offset = 0.5,
		iterations = 2,
		dur = 0.7,
		timingFunction: TimingFunction = easeInOutCubic,
	) {
		const startY = this.y();
		const shape = this.node as unknown as Shape;
		const yOffset = shape.height() * offset;
		// return this.addEffect();

		// pulled from teeter
		const start = this.rotation();
		const teeterEffect = tweenLoop(
			dur,
			iterations,
			(v) => {
				const t = Math.sin(v * 2 * Math.PI);
				this.rotation(start + 15 * t);
			},
			timingFunction,
		);

		const effect = sequence(
			0.1,
			this.y(startY - yOffset, 0.4, easeOutQuint),
			sequence(
				//
				dur - 0.15,
				teeterEffect,
				this.y(startY, 0.4, easeInQuint),
			),
		);

		return this.addEffect(effect);
	}

	/** @deprecated */
	_effectFadeIn(dur?: number) {
		return new Effects(this).fadeIn(dur);
	}
	/** @deprecated */
	_effectSlideUp(dur?: number) {
		return new Effects(this).slideUp(dur);
	}
	/** @deprecated */
	_effectFadeOut(dur?: number) {
		return new Effects(this).fadeOut(dur);
	}
	/** @deprecated */
	_effectSlideDown(dur?: number) {
		return new Effects(this).slideDown(dur);
	}
}
