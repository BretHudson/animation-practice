import {
	Camera,
	Layout,
	makeScene2D,
	Node,
	Rect,
	Txt,
	TxtProps,
} from '@motion-canvas/2d';
import {
	all,
	cancel,
	chain,
	Color,
	createRef,
	createSignal,
	easeInCubic,
	easeInOutQuad,
	easeOutBack,
	sequence,
	useRandom,
	waitFor,
} from '@motion-canvas/core';
import { getViewportData } from '~/util';

import { TxtPlus } from '~/components/TxtPlus';
import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const textColor = new Color(WGTheme.bubbleBg);

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH, portrait } = getViewportData(view);

	const random = useRandom(127);

	const { bg, credits } = useWeek7('Sabrina Gannon', '#111', 5);

	// bg().fill('#f3f6ff');

	credits().sketchTxt().fill(textColor);
	[credits().authorTxt(), credits().coauthorTxt()].forEach((txt) => {
		txt.fill(textColor);
		txt.stroke('#111');
		txt.lineWidth(5);
		txt.strokeFirst(true);
	});

	const fontSize = 192;

	const txtProps: TxtProps = {
		fill: WGTheme.bubbleBg,
		fontSize,
	};

	// h2
	const txtProps2: TxtProps = {
		...txtProps,
		fill: '#aaac',
		fontSize: fontSize * 0.4,
		fontFamily: 'Outfit',
		fontWeight: 600,
	};

	const camera = createRef<Camera>();
	const txtFear = createRef<TxtPlus>();
	const txtRegret = createRef<TxtPlus>();
	const txtMore = createRef<TxtPlus>();
	const txtReject = createRef<TxtPlus>();

	const chunk1 = createRef<Layout>();
	const chunk2 = createRef<Layout>();

	const targetFill = new Color('#ffffffff');
	const regretFill = createSignal(new Color('#ffffff00'));

	const startFill2 = new Color('#66000000');
	const targetFill2 = new Color('#ff0000ff');

	const border = createRef<Rect>();

	view.add(
		<Layout rotation={byOrientation(0, 90)}>
			<Camera ref={camera}>
				<Layout
					x={viewW / 2}
					y={viewH / 2}
					layout
					direction={'column'}
					alignItems={'start'}
				>
					<Layout ref={chunk1} direction={'column'} alignItems={'start'}>
						<TxtPlus ref={txtFear} text="FEAR" txtProps={txtProps2} />
						<TxtPlus
							ref={txtRegret}
							text="REGRET"
							marginTop={-25}
							txtProps={{ ...txtProps, fill: regretFill }}
							fontFamily="Melted Monster"
						/>
					</Layout>
					<Rect width={10} height={90} />
					<Layout ref={chunk2} direction={'column'} alignItems={'start'}>
						<TxtPlus ref={txtMore} text="MORE THAN" txtProps={txtProps2} />
						<Rect
							ref={border}
							padding={[20, 35, 0]}
							margin={[10, -35, 0]}
							radius={30}
							stroke="red"
							lineWidth={8}
							lineDash={[100, 10, 300, 3, 200, 5, 130, 2, 10, 2]}
							lineDashOffset={20}
							end={0}
						>
							<TxtPlus
								ref={txtReject}
								marginTop={-10}
								marginBottom={-10}
								text={'Rejection'.toUpperCase()}
								txtProps={{ ...txtProps }}
								fontFamily="Stamp"
							/>
						</Rect>
					</Layout>
				</Layout>
			</Camera>
		</Layout>,
	);

	camera().x(viewW / 2);
	camera().y(viewH / 2);

	txtFear().margin([0, 25]);
	txtMore().margin([0, 35]);

	chunk2().margin([0, 0, 0, -40]);

	const rejectLetters = txtReject().letters.map((l) => l.childAs<Txt>(0));
	rejectLetters.forEach((l) => l.fill(startFill2));

	const getRelativePos = (camera: Camera, node: Node) => {
		return node instanceof Node
			? node.absolutePosition().transformAsPoint(camera.scene().worldToLocal())
			: node;
	};

	const centerCamera = (camera: Camera, node: Node) => {
		const position = getRelativePos(camera, node);
		camera.position(position);
	};

	// TODO(bret): consolidate this
	centerCamera(camera(), txtFear());
	camera().y(camera().y() - 200);
	camera().zoom(5);

	const white = txtProps.fill;
	// @ts-expect-error - whatever
	txtRegret().shadowColor(new Color(white).alpha(0.7));
	txtRegret()
		.letters.map((l) => l.childAs<Txt>(0))
		.map((l) => {
			l.stroke(white);
			// @ts-expect-error - whatever
			l.shadowColor(new Color(white).alpha(0.7));
		});

	yield* waitFor(0.3);
	yield* camera().centerOn(txtFear(), 1);
	yield* waitFor(0.08);
	if (portrait) yield credits().opacity(0, 0.7);
	yield* waitFor(0.22);
	yield* all(
		camera().zoom(2.5, 1),
		camera().centerOn(chunk1(), 1),
		sequence(
			0.1,
			...txtRegret()
				.letters.map((l) => l.childAs<Txt>(0))
				.map(function* (l) {
					const off = random.nextFloat(15, 40);
					yield l.shadowOffset(byOrientation([0, off], [-off, 0]), 3);
					yield* all(
						l.parent().y(50).y(0, 0.7),
						l.fill(targetFill, 1),
						waitFor(1.7),
					);
				}),
		),
		// regretFill(targetFill, 1),
	);

	yield* all(
		//
		camera().zoom(3.5, 1),
		camera().centerOn(txtMore(), 1),
	);

	const rejectY = getRelativePos(camera(), txtReject()).y;
	const x = camera().x();
	yield* all(camera().y(rejectY, 1), camera().rotation(5, 1), waitFor(0.45));
	const { letters } = txtReject();

	const goToEnd = border().end(0.5, 5, easeInOutQuad);
	yield goToEnd;

	for (let i = 0; i < letters.length; ++i) {
		const letter = letters[i];
		const txt = letter.childAs<Txt>(0);
		const letterX = getRelativePos(camera(), txt).x;
		yield* all(
			camera().x(Math.max(x, letterX), 0.3),
			chunk2().margin([3, 0, 0, -40]).margin([0, 0, 0, -40], 0.1),
			// .zoom(zoom * 1.5)
			// .zoom(zoom, 0.3),
			txt.fill(targetFill2, 0.2),
			txt.scale(2).scale(1, 0.35, easeOutBack),
		);
	}
	yield* waitFor(0.3);

	cancel(goToEnd);
	yield* all(
		// chunk2().margin([0, 0, 0, -40], 0.8),
		camera().reset(0.8),
		camera().x(viewW / 2, 0.8),
		camera().y(viewH / 2, 0.8),
		camera().zoom(1.1, 0.8),
		camera().rotation(5, 0.9),
		border().end(1, 1.3),
	);

	chunk1().offset([-1, 0]);
	yield* waitFor(1);

	border().opacity(() => {
		return easeInCubic(txtReject().opacity());
	});
	const txts = [
		// NOTE(bret): the order here is not top to bottom
		txtReject(),
		txtMore(),
		txtFear(),
		txtRegret(),
	];
	// return;

	const dur = 0.9;

	const xx = byOrientation(viewW / 2.57, viewW / 3.4);
	const yy = byOrientation(viewH / 3.1, viewH / 2.5);
	if (portrait) {
		yield chain(waitFor(0.55), credits().opacity(1, 0.7));
	}
	yield* all(
		camera().x(xx, dur),
		camera().y(yy, dur),
		camera().zoom(10, dur),
		camera().rotation(20, dur),
		sequence(
			0.05,
			...txts.map((txt) => {
				return all(
					...txt.letters
						.map((l) => l.childAs<Txt>(0))
						.map((t) => t.opacity(0, dur)),
				);
			}),
		),
	);
	yield* waitFor(0.5);
});
