import { Layout, makeScene2D, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	createRef,
	createSignal,
	easeInOutQuad,
	loop,
	makeRef,
	map,
	range,
	sequence,
	tween,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = useViewport();

	const { bg, credits } = useWeek7(); //undefined, '#111f', 10);
	// credits().authorTxt().fill(WGTheme.bubbleBg);
	bg().fill('#131518');

	const fontSize = byOrientation(128, 100);
	const props: TxtProps = {
		fill: 'white',
		fontSize,
	};

	const layout = createRef<Layout>();

	const str = 'Text Hover Effect';

	const oldLetters: Txt[] = [];
	const newLetters: Txt[] = [];

	view.add(
		<Layout ref={layout} layout>
			{str.split('').map((c, i) => {
				const width = c === ' ' ? fontSize / 5 : undefined;
				return (
					<Txt ref={makeRef(oldLetters, i)} width={width} text={c} {...props} />
				);
			})}
		</Layout>,
	);

	const hScale = 1.5;

	oldLetters.forEach((l, i) => {
		const pos = l.absolutePosition();
		const offset = l.height() * hScale;
		l.absolutePosition(pos);
		const oldOpacity = createSignal(() => {
			const pad = l.padding().top + l.padding().bottom;
			return map(1, 0, pad / offset);
		});
		l.opacity(oldOpacity);
		l.scale.y(oldOpacity);
		l.filters.blur(() => (1 - oldOpacity()) * 4);
		const width = l.text() === ' ' ? fontSize / 5 : undefined;
		view.add(
			<Txt
				ref={makeRef(newLetters, i)}
				{...props}
				text={l.text}
				// fontFamily="Outfit"
				width={width}
			/>,
		);
		newLetters[i].absolutePosition(pos);
		const newOpacity = createSignal(() => {
			const pad = newLetters[i].padding().top + newLetters[i].padding().bottom;
			return map(1, 0, pad / offset);
		});
		newLetters[i].opacity(newOpacity);
		newLetters[i].scale.y(newOpacity);
		newLetters[i].filters.blur(() => (1 - newOpacity()) * 4);
	});

	layout().layout(false);

	function* moveLetter(i: number, dur: number) {
		const offset = newLetters[i].height() * hScale;
		oldLetters[i].padding([0, 0, 0, 0]);
		newLetters[i].padding([offset, 0, 0, 0]);
		yield* all(
			oldLetters[i].padding([0, 0, oldLetters[i].height() * hScale, 0], dur),
			newLetters[i].padding([0, 0, 0, 0], dur),
		);
	}

	const dur = 0.5;
	yield* loop(3, function* (loopIndex) {
		yield* waitFor(0.3);
		const tScale = Math.pow(2, loopIndex);
		yield* sequence(
			0.03 * tScale,
			...range(str.length).map((i) => moveLetter(i, dur * tScale)),
		);
		yield* waitFor(0.3);
	});

	return;

	oldLetters.forEach((l) => l.reparent(view));
	newLetters.forEach((l) => layout().add(l));
	layout().layout(true);
	newLetters.forEach((l) => {
		l.save();
	});
	layout().layout(false);
	yield* sequence(
		0.06,
		...newLetters.map((l) => {
			const dur = 0.3;
			return all(
				l.restore(dur),
				tween(dur, (t) => {
					const v = Math.sin(t * Math.PI);
					l.opacity(1 - v * 0.5);
					l.padding.top(v * l.height() * 0.05);
				}),
			);
		}),
	);

	const fadeOut = sequence(0.06, ...newLetters.map((l) => l.opacity(0, 0.3)));

	const fadeIn = sequence(
		0.06,
		...oldLetters.map((l) => {
			l.scale(1);
			l.padding(0);
			return l.opacity(0).opacity(1, 0.3);
		}),
	);

	yield* sequence(0.4, fadeOut, fadeIn);
});
