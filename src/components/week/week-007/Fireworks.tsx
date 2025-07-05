import {
	blur,
	Circle,
	colorSignal,
	Gradient,
	initial,
	Layout,
	LayoutProps,
	Node,
	nodeName,
	NodeProps,
	QuadBezier,
	signal,
	Spline,
} from '@motion-canvas/2d';
import {
	all,
	Color,
	createRef,
	createSignal,
	delay,
	easeInCubic,
	easeOutCubic,
	makeRef,
	PossibleColor,
	Random,
	range,
	sequence,
	SignalValue,
	SimpleSignal,
	Vector2,
	waitFor,
} from '@motion-canvas/core';

interface StreakProps extends LayoutProps {
	angle: SignalValue<number>;
	length: SignalValue<number>;
	color: SignalValue<PossibleColor>;
	random: Random;
}

@nodeName('Streak')
export class Streak extends Layout {
	@signal()
	public declare readonly angle: SimpleSignal<number, this>;
	@signal()
	public declare readonly length: SimpleSignal<number, this>;
	@colorSignal()
	public declare readonly color: SimpleSignal<PossibleColor, this>;

	public spline = createRef<Spline>();
	public circle = createRef<Circle>();

	@initial(1)
	@signal()
	public declare readonly durScale: SimpleSignal<number, this>;

	private gradient = new Gradient({
		type: 'linear',
		from: 0,
	});

	constructor(props: StreakProps) {
		super(props);

		const { random } = props;

		const offset = 0.035;
		this.durScale(1 + random.nextFloat(-offset, offset));

		const dir = createSignal(() => {
			const a = this.angle() * 2 * Math.PI;
			const x = Math.cos(a);
			const y = Math.sin(a);
			return new Vector2(x, y);
		});
		const points = createSignal(() => {
			const p0 = Vector2.zero;
			const p1 = dir().scale(this.length()).addY(5);
			const p2 = p1.scale(1.5).addY(15);
			const p3 = p1.scale(1.6).addY(30);
			return [p0, p1, p2, p3];
		});

		const color = new Color(this.color());
		const stops = createSignal(() => [
			{
				color: color.darken(1).alpha(0),
				offset: this.spline().start(),
			},
			{
				color,
				offset: this.spline().end(),
			},
		]);

		this.gradient.from(points().at(-1).scale(0.3));
		this.gradient.to(points().at(-1));
		this.gradient.stops(stops);

		// grad.stops(

		const size = 10;
		this.add(
			<Spline
				ref={this.spline}
				points={points}
				stroke={this.gradient}
				lineWidth={size}
				start={0}
				lineCap={'round'}
				endOffset={size * 2}
			/>,
		);
		const pos = createSignal(() => {
			return this.spline().getPointAtPercentage(this.spline().end()).position;
		});
		this.add(
			<Circle
				ref={this.circle}
				position={pos}
				fill="white"
				size={size * 1.3}
				zIndex={100}
			/>,
		);

		this.zIndex(
			createSignal(() => {
				const s = this.spline();
				const { position } = s.getPointAtPercentage(s.end());
				return -position.y;
			}),
		);
	}

	*burst() {
		const spline = this.spline();
		const circle = this.circle();
		spline.end(0);

		const tS = this.durScale();

		const size = circle.size();
		const lineWidth = spline.lineWidth();

		const endT = 1 * tS;
		const lineT = 0.5;
		const sizeT = 0.4;
		const gravityT = 1.7 * tS;

		const burstOut = all(
			spline.end(1, endT, easeOutCubic),
			spline.lineWidth(1).lineWidth(lineWidth, lineT, easeOutCubic),
			circle.size(0).size(size, sizeT, easeOutCubic),
			// circle.opacity(0.2).opacity(1, 0.3),
		);
		const gravity = spline.endOffset(0, gravityT, easeInCubic);

		// spline.start(0.6, 0.5 * tS, easeOutCubic),

		const fadeAway = all(
			circle.opacity(0, 0.5),
			all(spline.start(0.8, 0.5), spline.opacity(0, 0.5)),
		);

		const beforeFade = Math.max(endT, lineT, sizeT, gravityT);

		yield* sequence(beforeFade - 0.1, all(burstOut, gravity), fadeAway);
	}
}

export interface FireworksProps extends NodeProps {
	random: Random;
	delay: number;
	layers: Layer[];
	angle: number;
	distance: number;
	layerScale?: number;
}

export interface Layer {
	length: number;
	count: number;
	color: PossibleColor;
}

type GetProps<T extends abstract new (...args: any) => any> =
	ConstructorParameters<T>[0];

export interface RocketProps extends GetProps<typeof Layout> {
	angle: number;
	distance: number;
}

const targetEnd = 0.53;
export class Rocket extends Layout {
	private end = createSignal(0);
	private quad = createRef<QuadBezier>();

	public magnitude: number;

	constructor(props: RocketProps) {
		super(props);

		const { angle, distance } = props;
		this.magnitude = distance;

		const a = ((angle - 90) / 180) * Math.PI;
		const xx = Math.cos(a) * distance;
		const yy = Math.sin(a) * distance;

		const p0 = new Vector2(0, 0);
		const p1 = new Vector2(xx * 0.5, yy);
		const p2 = new Vector2(xx, 0);

		const gradient = new Gradient({
			type: 'linear',
			fromY: 0,
			toY: yy * 0.5,
			stops: [
				//
				{ offset: 0, color: '#ff000000' },
				{ offset: 1, color: 'white' },
			],
		});

		const stops = createSignal(() => {
			const start = Math.min(1, this.quad().end() * 0.3 + this.smokeT());
			const end = Math.max(start, this.quad().end() * 1.8);
			if (start === 1) return [];
			return [
				//
				{ offset: start, color: '#aa000000' },
				{ offset: end, color: 'white' },
			];
		});
		gradient.stops(stops);

		this.add(
			<>
				<QuadBezier
					ref={this.quad}
					opacity={0}
					p0={p0}
					p1={p1}
					p2={p2}
					stroke={gradient}
					lineWidth={10}
					end={this.end}
					lineCap={'round'}
				/>
				{/* <Rect width={20} height={100} fill="white" /> */}
			</>,
		);
	}

	private smokeT = createSignal(0);
	*launch(dur: number) {
		this.quad().opacity(1);
		yield* all(
			this.end(targetEnd, dur, easeOutCubic),
			delay(dur - 1, this.smokeT(1, dur, easeOutCubic)),
		);
		this.quad().remove();
	}

	getEndPos() {
		const { position } = this.quad().getPointAtPercentage(targetEnd);
		return position.addY(-10);
	}
}

@nodeName('fireworks')
export class Fireworks extends Node {
	private streaks: Streak[] = [];
	private rocket = createRef<Rocket>();
	private burstRef = createRef<Layout>();

	public delay: number;

	constructor(props: FireworksProps) {
		super(props);

		const { random, layers, angle, distance, delay, layerScale = 1 } = props;
		this.delay = delay + random.nextFloat(-0.1, 0.1);

		// this.add(<Circle size={100} fill="white" />);

		const getLength = (s: number) => s * random.nextFloat(1, 1.125);

		this.add(<Rocket ref={this.rocket} angle={angle} distance={distance} />);

		this.add(<Layout ref={this.burstRef} />);
		const burst = this.burstRef();
		burst.filters([blur(2)]);
		this.add(burst);

		// grad.
		let streakIndex = 0;
		layers.forEach((layer, di) => {
			const { length, count, color } = layer;
			const aOffset = di * 0.5;
			burst.add(
				<Layout zIndex={di}>
					{...range(count).map((i) => {
						const a = (i + aOffset) / count;
						const l = getLength(length) * layerScale;
						return (
							<Streak
								ref={makeRef(this.streaks, streakIndex++)}
								angle={a}
								length={l}
								random={random}
								color={color}
								opacity={0}
							/>
						);
					})}
				</Layout>,
			);
		});
	}

	*launch() {
		yield* waitFor(this.delay);
		this.burstRef().position(this.rocket().getEndPos());
		const dur = this.rocket().magnitude / 500;
		const offset = 0.3;
		yield* sequence(dur - offset, this.rocket().launch(dur), this.burst());
	}

	*burst() {
		yield* all(
			...this.streaks.map(function* (s) {
				s.opacity(1);
				yield* s.burst();
			}),
		);
		yield* waitFor(0.2);
	}
}
