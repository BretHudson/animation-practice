import { Layout, makeScene2D, Rect, Txt } from '@motion-canvas/2d';
import {
	all,
	createRef,
	easeOutCubic,
	useLogger,
	waitFor,
} from '@motion-canvas/core';
import { windingNumberComposition } from '~/compositions/011/WindingNumber';
import { getViewportData } from '~/util';
import { WGTheme } from '~/util/themes';

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fill(WGTheme.darkBlue);
	const padding = 100;

	const logger = useLogger();

	logger.warn(view.topRight().toString());

	view.fontFamily('Outfit');

	const { animateInner, animateOuter, fadeOut, layout } =
		windingNumberComposition();

	const main = createRef<Rect>();

	const initY = byOrientation(45, 70);
	const rectRadius = 20;
	const rectW = Math.max(920, view.width() - padding - 500 - 200);
	const rectH = 650; // view.height() - padding - 150 - 180;
	view.add(
		<Rect
			ref={main}
			y={initY}
			fill={WGTheme.darkBlue}
			width={rectW}
			height={rectH}
			radius={20}
		>
			{layout}
		</Rect>,
	);

	let yPos = 0;
	const computePosAndSize = (fontSize: number) => {
		const res = {
			y: yPos,
			width: view.width,
			textAlign: 'center',
			fontSize,
		} as const;
		yPos += fontSize * 1.2;
		return res;
	};

	view.add(
		<>
			<Layout
				direction="column"
				gap={0}
				offset={[0, 0]}
				width={view.width}
				height={view.height}
				textAlign="center"
				justifyContent={'center'}
				alignContent={'center'}
				alignItems={'start'}
				y={-rectH * 0.5 - 110}
				// top={[0, 100]}
				zIndex={100}
				lineHeight={16}
			>
				<Txt
					text={`Winding Number`}
					fill={'#eef'}
					fontWeight={700}
					{...computePosAndSize(72)}
				/>
				<Layout
					{...computePosAndSize(byOrientation(60, 50))}
					layout
					alignItems="center"
					justifyContent="center"
				>
					<Txt text="Recreation of " fill={'#eef'} fontWeight={250} />
					<Txt text="Freya Holmér" fill={'#eef'} fontWeight={450} />
					<Txt text="'s animation" fill={'#eef'} fontWeight={250} />
				</Layout>
			</Layout>
			<Rect
				layout
				// fill={WGTheme.bubbleBg}
				// radius={20}
				padding={[28, 50]}
				gap={24}
				bottom={[0, view.height() * 0.5 - byOrientation(60, 170)]}
				// shadowColor="#00000033"
				// shadowOffset={[0, 8]}
				// shadowBlur={4}
			>
				<Txt
					text={`Sketch #011`.toUpperCase()}
					fill={WGTheme.bubbleBg}
					fontWeight={250}
				/>
				<Txt text={`•`} fill={WGTheme.bubbleBg} fontWeight={350} />
				<Txt
					text={`Bret Hudson`.toUpperCase()}
					fill={WGTheme.bubbleBg}
					fontWeight={250}
				/>
			</Rect>
		</>,
	);

	const growDur = 0.7;
	if (false) {
		yield* all(
			main().y(0, growDur, easeOutCubic),
			main().radius(0, growDur),
			main().width(view.width, growDur, easeOutCubic),
			main().height(view.height, growDur, easeOutCubic),
		);
	}

	yield* waitFor(0.3);
	yield* animateInner();
	yield* animateOuter();
	yield* fadeOut();
	yield* waitFor(0.3);

	if (false) {
		yield* all(
			main().y(initY, growDur, easeOutCubic),
			main().radius(rectRadius, growDur),
			main().width(rectW, growDur, easeOutCubic),
			main().height(rectH, growDur, easeOutCubic),
		);
	}
});
