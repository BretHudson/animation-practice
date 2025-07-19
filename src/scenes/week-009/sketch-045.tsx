import { makeScene2D, Txt, TxtProps } from '@motion-canvas/2d';
import {
	all,
	createRef,
	loop,
	SignalGenerator,
	waitFor,
} from '@motion-canvas/core';

import { useViewport } from '~/hooks/useViewport';
import { useWeek7 } from '~/hooks/useWeek7';

export default makeScene2D(function* (view) {
	const { byOrientation } = useViewport();

	const { bg } = useWeek7(undefined, '#111f', 10);
	bg().fill('#131518');
	bg().fill('#ffd');

	const fontSize = byOrientation(256, 128);
	const props = {
		fontFamily: 'Outfit',
		fontSize,
		fill: '#322',
		stroke: '#322',
		shadowColor: '#522',
		shadowBlur: 2,
	} satisfies TxtProps;

	const txt = createRef<Txt>();
	view.add(<Txt ref={txt} text="pac-man" {...props} />);

	const animDur = 1;
	const waitDur = 1;
	const backDur = 1;

	txt().stroke(txt().fill);

	function* animate(fuck: SignalGenerator<any, any>) {
		yield* fuck.wait(waitDur).back(backDur);
	}

	yield* loop(2, function* () {
		yield* waitFor(waitDur * 0.5);
		yield* all(
			animate(bg().fill('#ffff00', animDur)),
			animate(txt().fill('red', animDur)),
			animate(txt().letterSpacing(55, animDur)),
			animate(txt().lineWidth(0).lineWidth(44, animDur)),
			animate(
				txt()
					.position(0)
					.position([-10 + 55 * 0.75, -10], animDur),
			),
			animate(txt().shadowOffset([20, 20], animDur)),
		);
		yield* waitFor(waitDur * 0.5);
	});
});
