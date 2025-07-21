import {
	initial,
	makeScene2D,
	nodeName,
	Polygon,
	PolygonProps,
	Shape,
	ShapeProps,
	signal,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	clamp,
	Color,
	createEaseInOutBack,
	createRef,
	createSignal,
	easeInCubic,
	easeInOutBack,
	easeInOutCubic,
	easeInOutExpo,
	easeInOutQuad,
	easeInOutSine,
	easeInQuad,
	easeInQuint,
	easeOutBack,
	easeOutCubic,
	linear,
	loop,
	makeRef,
	map,
	remap,
	sequence,
	SignalGenerator,
	SimpleSignal,
	ThreadGenerator,
	TimingFunction,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

interface HexagonProps extends PolygonProps {
	q: number;
	r: number;
	s: number;
}

const sqrt3 = Math.sqrt(3);
const qBasis = new Vector2(sqrt3, 0);
const rBasis = new Vector2(sqrt3 / 2, 3 / 2);

@nodeName('Hexagon')
export class Hexagon extends Polygon {
	@signal()
	public declare readonly q: SimpleSignal<number, this>;
	@signal()
	public declare readonly r: SimpleSignal<number, this>;
	@initial(0)
	@signal()
	public declare readonly posRotation: SimpleSignal<number, this>;

	public get s() {
		return -this.q() - this.r();
	}

	public get depth() {
		return Math.max(Math.abs(this.q()), Math.abs(this.r()), Math.abs(this.s));
	}

	constructor(props: HexagonProps) {
		super(props);
		const { q, r, s } = props;
		if (q + r + s !== 0) {
			throw new Error(`Invalid coordinates (${[q, r, s].join(', ')})`);
		}

		// this.position(() => {
		// 	return qBasis
		// 		.scale(this.q())
		// 		.add(rBasis.scale(this.r()))
		// 		.scale(this.size.x());
		// });
		const radius = this.size.x() / 2 + this.lineWidth();
		// this.x(() => {
		// 	return (sqrt3 * this.q() + (sqrt3 / 2) * this.r()) * radius;
		// });
		this.position(() => {
			const q = qBasis.rotate(this.posRotation()).scale(this.q());
			const r = rBasis.rotate(this.posRotation()).scale(this.r());
			return q.add(r).scale(radius);
		});
	}
}

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();

	const { bg, credits } = useWeek7(undefined, '#111f', 10);
	bg().fill('#fff6ea');
	credits().zIndex(1000);

	const size = 240;
	const strokeBlack = '#0002';
	const strokeRed = '#f002';
	const strokeBlue = '#00f2';
	const strokeGreen = '#0932';

	const _r = 5;
	const _q = 5;
	const hexagons: Hexagon[] = [];
	let i = 0;
	for (let r = -_r; r <= _r; ++r) {
		for (let q = -_q - Math.floor(r / 2); q <= _q + -Math.floor(r / 2); ++q) {
			view.add(
				<Hexagon
					ref={makeRef(hexagons, i++)}
					size={size}
					fill={'#fff9ef'}
					q={q}
					r={r}
					s={-q - r}
					stroke={strokeBlack}
					lineWidth={15}
				/>,
			);
		}
	}

	function* animate(
		groupBy: Partial<Record<number, Hexagon[]>>,
		dur: number,
		foo: (hex: Hexagon) => ThreadGenerator,
	) {
		const groups = Object.values(groupBy);
		yield* sequence(
			dur,
			...groups.map((group) => {
				return all(...group.map(foo));
			}),
		);
	}

	const depths = hexagons.map(({ depth }) => depth);
	const qs = hexagons.map(({ q }) => q());
	const rs = hexagons.map(({ r }) => r());
	const ss = hexagons.map(({ s }) => s);

	const funcs = [Math.min, Math.max] as const;
	const rDepth = funcs.map((f) => f(...depths)) as [number, number];
	const rangeQ = funcs.map((f) => f(...qs)) as [number, number];
	const rangeR = funcs.map((f) => f(...rs)) as [number, number];
	const rangeS = funcs.map((f) => f(...ss)) as [number, number];

	// const depthSequence = createSignal(minDepth - 1);
	// hexagons.forEach((hex) => {
	// 	hex.fill(() => {
	// 		const { depth } = hex;
	// 		const t = Math.max(1 - Math.abs(depth - depthSequence()), 0);
	// 		return Color.lerp('white', 'red', t);
	// 	});
	// });
	// yield* depthSequence(maxDepth, 3);

	function* anim(
		range: [number, number],
		dur: number,
		window: number,
		func: (hex: Hexagon) => number,
		callback: (
			hex: Hexagon,
			window: number,
			v: SimpleSignal<number, void>,
		) => void,
		timingFunction = easeInOutCubic,
	) {
		const [min, max] = range;
		const ripple = createSignal(min - window);
		hexagons.forEach((hex) => {
			const v = createSignal(() => func(hex) - ripple());
			callback(hex, window, v);
		});
		yield* ripple(max + window, dur, timingFunction);
	}

	// yield* anim(minQ, maxQ, ({ q }) => q());
	// yield* anim(minS, maxS, ({ s }) => s);
	// yield* anim(rangeQ, 2, ({ q }) => q(), easeOutBack);
	yield* waitFor(0.3);
	const customEaseInOutBack = createEaseInOutBack(1.70158 * 2, 1.525 * 2);
	yield* sequence(
		2.5,
		anim(
			[rDepth[0], rDepth[1] - 2],
			3,
			4.5,
			({ depth }) => depth,
			(hex, window, _v) => {
				hex.scale(() => {
					const v = (window / 1 - Math.abs(_v())) / (window / 1) / 3;
					const t = clamp(0, 1, v);
					return map(1, 0.8, t);
				});
				hex.rotation(() => {
					const v = (window - _v()) / window;
					const t = clamp(0, 1, v);
					return map(0, 30, customEaseInOutBack(t));
				});
				hex.posRotation(() => {
					const v = (window - _v()) / window - 0.3;
					const t = clamp(0, 1, v);
					return map(0, 30, easeOutBack(t));
				});
				hex.stroke(() => {
					const v = (window - _v()) / window;
					const t = clamp(0, 1, v);
					return Color.lerp(strokeBlack, strokeRed, t, 'hsl');
				});
			},
			easeInOutSine,
		),
		anim(
			[rDepth[0], rDepth[1] - 2],
			3,
			4.5,
			({ depth }) => depth,
			(hex, window, _v) => {
				hex.scale(() => {
					const v = (window / 1 - Math.abs(_v())) / (window / 1) / 3;
					const t = clamp(0, 1, v);
					return map(1, 0.8, t);
				});
				hex.rotation(() => {
					const v = (window - _v()) / window;
					const t = clamp(0, 1, v);
					return map(30, 0, customEaseInOutBack(t));
				});
				hex.posRotation(() => {
					const v = (window - _v()) / window - 0.3;
					const t = clamp(0, 1, v);
					return map(30, 0, easeOutBack(t));
				});
				hex.stroke(() => {
					const v = (window - _v()) / window;
					const t = clamp(0, 1, v);
					return Color.lerp(strokeBlack, strokeRed, 1 - t, 'hsl');
				});
			},
			easeInOutSine,
		),
		sequence(
			3.7,
			anim(
				rangeQ,
				4.5,
				4.5,
				({ q }) => q(),
				(hex, window, _v) => {
					hex.scale(() => {
						const v = (window / 1 - Math.abs(_v())) / (window / 1) / 3;
						const t = clamp(0, 1, v);
						return map(1, 0.8, t);
					});
					hex.rotation(() => {
						const v = ((window * 0.5 - _v()) / window) * 0.5;
						const t = clamp(0, 1, v);
						return map(0, 60, easeInOutBack(t));
					});
					hex.stroke(() => {
						const v = (window - _v()) / window - 1;
						const t = clamp(0, 1, v);
						return Color.lerp(strokeBlack, strokeBlue, t, 'hsl');
					});
					// hex.posRotation(() => {
					// 	const v = (window - _v()) / window - 0.3;
					// 	const t = clamp(0, 1, v);
					// 	return map(30, 0, easeOutBack(t));
					// });
				},
				easeInOutSine,
			),

			anim(
				rangeR,
				4.5,
				4.5,
				({ r }) => r(),
				(hex, window, _v) => {
					hex.scale(() => {
						const v = (window / 1 - Math.abs(_v())) / (window / 1) / 3;
						const t = clamp(0, 1, v);
						return map(1, 0.8, t);
					});
					hex.rotation(() => {
						const v = ((window * 0.5 - _v()) / window) * 0.5;
						const t = clamp(0, 1, v);
						return map(0, 60, easeInOutBack(t));
					});
					hex.stroke(() => {
						const v = (window - _v()) / window - 1;
						const t = clamp(0, 1, v);
						return Color.lerp(strokeBlue, strokeGreen, t, 'hsl');
					});
					// hex.posRotation(() => {
					// 	const v = (window - _v()) / window - 0.3;
					// 	const t = clamp(0, 1, v);
					// 	return map(30, 0, easeOutBack(t));
					// });
				},
				easeInOutSine,
			),

			anim(
				rangeS,
				4.5,
				4.5,
				({ s }) => remap(rangeS[0], rangeS[1], rangeS[1], rangeS[0], s),
				(hex, window, _v) => {
					hex.scale(() => {
						const v = (window / 1 - Math.abs(_v())) / (window / 1) / 3;
						const t = clamp(0, 1, v);
						return map(1, 0.8, t);
					});
					hex.rotation(() => {
						const v = ((window * 0.5 - _v()) / window) * 0.5;
						const t = clamp(0, 1, v);
						return map(0, 60, easeInOutBack(t));
					});
					hex.stroke(() => {
						const v = (window - _v()) / window - 0.8;
						const t = clamp(0, 1, v);

						return Color.lerp(strokeGreen, strokeBlack, t, 'hsl');
					});
					// hex.posRotation(() => {
					// 	const v = (window - _v()) / window - 0.3;
					// 	const t = clamp(0, 1, v);
					// 	return map(30, 0, easeOutBack(t));
					// });
				},
				easeInOutSine,
			),
		),
	);
	yield* waitFor(0.3);
	return;

	const byDepth = Object.groupBy(hexagons, ({ depth }) => depth);
	let rot = 30;
	yield* animate(byDepth, 0.15, (hex: Hexagon) => {
		return hex.fill('red', 0.5);
		// return hex.rotation(rot, 1);
	});
	rot += 30;

	const byR = Object.groupBy(hexagons, ({ r }) => r() + 999);
	yield* animate(byR, 0.15, (hex: Hexagon) => {
		return hex.fill('yellow', 0.5);
		// return hex.rotation(rot, 1);
	});
	rot += 30;

	const byQ = Object.groupBy(hexagons, ({ q }) => q() + 999);
	yield* animate(byQ, 0.15, (hex: Hexagon) => {
		return hex.fill('purple', 0.5);
		// return hex.rotation(rot, 1);
	});
	rot += 30;

	const byS = Object.groupBy(hexagons, ({ s }) => -(s - 999));
	yield* animate(byS, 0.15, (hex: Hexagon) => {
		return hex.fill('green', 0.5);
		// return hex.rotation(rot, 1);
	});
	rot += 30;
});
