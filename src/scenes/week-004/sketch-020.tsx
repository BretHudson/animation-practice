import { makeScene2D, Txt } from '@motion-canvas/2d';
import {
	all,
	chain,
	createRef,
	createSignal,
	easeInQuad,
	easeOutQuad,
	spawn,
	waitFor,
	waitUntil,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { FixedArray } from '~/components/week/week-004/FixedArray';
import { LabelledRay } from '~/components/week/week-004/LabelledRay';
import { Week4Title } from '~/components/week/week-004/Title';
import { useViewport } from '~/hooks/useViewport';
import { positionItemInRow } from '~/util';

import scriptRaw from '~/assets/audio/script-020.txt';
const script = await fetch(scriptRaw).then((res) => res.text());

import labelsRaw from '~/assets/audio/script-020-timestamps.txt';
const timestamps = (await fetch(labelsRaw).then((res) => res.text()))
	.split('\n')
	.map((line) => +line.split('\t')[0]);

const subtitles = script
	.split('\n')
	.map((s) => s.trim())
	.map((s) => (s.endsWith('.') ? s.substring(0, s.length - 1) : s))
	.filter((s) => Boolean(s) && !s.startsWith('##'));

export default makeScene2D(function* (view) {
	const { byOrientation, viewH } = useViewport();

	view.fontFamily('Outfit');

	const arrayY = -50;
	const subtitlesY = 300;

	let start = 0;
	subtitles.slice(0, timestamps.length).forEach((subtitle, i) => {
		spawn(
			chain(waitFor(start), () => {
				subtitleText().text(subtitle);
			}),
		);
		start = timestamps[i] ?? 9999999;
	});

	view.add(<SafeArea />);
	view.add(
		<>
			<Week4Title
				y={-650 * 0.5 - 110}
				title="Arrays"
				subtitle="Time Complexity"
			/>
			<Week4Credits />
		</>,
	);

	const itemSize = byOrientation(140, 140);
	const maxArrLen = 5;

	const arrCount = createSignal(() => 0);

	const container = createRef<FixedArray>();
	view.add(<FixedArray ref={container} y={arrayY} itemSize={140} />);
	arrCount(container().arrCount);

	const label = createSignal(() => `Items: ${Math.round(arrCount())}`);
	const opacity = createSignal(() => {
		return easeInQuad(container().width() / (itemSize * maxArrLen));
	});
	const x = createSignal(() => {
		return (
			positionItemInRow(arrCount() - 0.5, maxArrLen, itemSize, 0) * opacity()
		);
	});

	view.add(
		<LabelledRay
			x={x}
			y={arrayY - itemSize * 0.5}
			opacity={opacity}
			label={label}
			flipped
		/>,
	);

	const subtitleText = createRef<Txt>();
	view.add(
		<Txt
			ref={subtitleText}
			fontFamily="Chewy"
			text={subtitles[0]}
			fill="white"
			stroke="black"
			strokeFirst
			fontSize={64}
			letterSpacing={3}
			lineWidth={10}
			// width={700}
			textAlign={'center'}
			textWrap
			y={subtitlesY}
			opacity={0}
		/>,
	);

	yield* all(
		container().setLength(maxArrLen, 0.7, easeOutQuad),
		subtitleText().opacity(1, 0.3),
	);

	yield* waitUntil('push-single');
	yield* container().push('0');

	yield* waitUntil('push-multiple');
	yield* container().push('2', '3', '4');

	yield* waitUntil('insert');
	yield* container().insertItemAtIndex('1', 1);

	yield* waitUntil('pop');
	yield* container().pop();

	yield* waitUntil('remove');
	yield* container().removeIndex(1);

	yield* waitUntil('fade-away');
	yield* subtitleText().opacity(0, 0.3);
	yield* container().count(0, 0.5, easeInQuad);

	yield* waitFor(1);
});
