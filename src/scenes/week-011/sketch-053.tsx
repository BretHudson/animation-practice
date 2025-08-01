import { Camera, Layout, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import { all, Color, createRef, Vector2 } from '@motion-canvas/core';
import { TxtPlus } from '~/components/TxtPlus';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';

const bgColor = new Color('#de2244');

export default makeScene2D(function* (view) {
	const viewW = 1920;
	const viewH = 1080;

	const bigDim = Math.max(viewW, viewH);

	const textColor = WGTheme.bubbleBg;

	const { bg, credits } = useWeek7();
	bg().fill(bgColor);

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);

	const txtPlus = createRef<TxtPlus>();
	const camera = createRef<Camera>();

	view.add(
		<Layout rotation={90}>
			<Camera ref={camera}>
				<Rect x={-bigDim} width={bigDim} height={viewH * 3} fill={textColor} />
				<TxtPlus
					ref={txtPlus}
					text={'Word.'}
					fontSize={viewH / 2}
					fontFamily={'Outfit'}
					fontWeight={900}
					txtProps={{
						fill: textColor,
					}}
				/>
			</Camera>
		</Layout>,
	);

	const transforms = [
		{
			index: 0,
			rotation: 90,
			offset: new Vector2(0, 0),
			zoom: 1.8,
		},
		{
			index: 1,
			rotation: 180,
			offset: new Vector2(0, 68),
			zoom: 3.6,
		},
		{
			index: 2,
			rotation: 360,
			offset: new Vector2(0, 68),
			zoom: 3.6,
		},
		{
			index: 3,
			rotation: 360,
			offset: new Vector2(0, 0),
			zoom: 1.8,
		},
		{
			index: 4,
			rotation: 360 + 90,
			offset: new Vector2(-23, 149),
			zoom: 9,
		},
	];

	txtPlus().letters[0].position([23, 0]);
	txtPlus().letters[1].position([-7, 0]);
	txtPlus().letters[2].position([-7, 0]);
	txtPlus().letters[3].position([-23, 0]);
	txtPlus().letters[4].position([-23, 0]);

	camera().rotation(transforms[0].rotation);
	const pos = txtPlus()
		.letters[transforms[0].index].childAs<Txt>(0)
		.position()
		.add(transforms[0].offset);
	camera().position(pos);
	camera().zoom(transforms[0].zoom);

	for (let i = 1; i < transforms.length; ++i) {
		const { index, offset, zoom, rotation } = transforms[i];
		const pos = txtPlus().letters[index].childAs<Txt>(0).position().add(offset);
		yield* all(
			camera().position(pos, 1),
			camera().zoom(zoom, 1),
			camera().rotation(rotation, 1),
		);
	}

	yield* camera().zoom(20, 1);

	camera().rotation(0);
	camera().position(new Vector2(-bigDim, 0));
	camera().zoom(5);

	for (let i = 0; i < 1; ++i) {
		const { index, offset, zoom, rotation } = transforms[i];
		const pos = txtPlus().letters[index].childAs<Txt>(0).position().add(offset);
		yield* all(
			camera().position(pos, 1),
			camera().zoom(zoom, 1),
			camera().rotation(rotation, 1),
		);
	}
});
