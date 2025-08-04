import { Img, Layout, makeScene2D, Node } from '@motion-canvas/2d';
import { Color, createRef, makeRef, range, waitFor } from '@motion-canvas/core';
import { getViewportData } from '~/util';

import { useWeek7 } from '~/hooks/useWeek7';
import { WGTheme } from '~/util/themes';
import voronoiGlsl from '../../shaders/shader-056.glsl';

const textColor = new Color(WGTheme.bubbleBg);

export default makeScene2D(function* (view) {
	const { byOrientation, viewW, viewH } = getViewportData(view);

	const { bg, credits } = useWeek7(undefined, '#111', 5);

	bg().fill('#181820');
	bg().fill('rgba(102, 46, 123, 1)');

	credits().sketchTxt().fill(textColor);
	credits().authorTxt().fill(textColor);
	credits().authorTxt().stroke('#111');
	credits().authorTxt().lineWidth(5);
	credits().authorTxt().strokeFirst(true);

	const layout = createRef<Layout>();
	const node: Node[] = [];
	const rect: Node[] = [];

	const dim = [viewW, viewH].join('/');
	const images = [
		`https://picsum.photos/seed/picsum/${dim}`,
		`https://picsum.photos/id/198/${dim}`,
		`https://picsum.photos/id/204/${dim}`,
		`https://picsum.photos/id/196/${dim}`,
		`https://picsum.photos/id/202/${dim}`,
		`https://picsum.photos/id/193/${dim}`,
		`https://picsum.photos/id/190/${dim}`,
	];
	const maxIndex = images.length;

	view.add(
		<Layout ref={layout}>
			{range(maxIndex).map((i) => (
				<Node ref={makeRef(node, i)} cache>
					<Img
						ref={makeRef(rect, i)}
						src={images[i % images.length]}
						size={[viewW, viewH]}
					/>
				</Node>
			))}
		</Layout>,
	);

	const dur = 3;
	for (let index = 0; index < maxIndex; ++index) {
		rect[index].shaders({
			fragment: voronoiGlsl,
			uniforms: {
				axis: byOrientation(0, 1),
				index,
				maxIndex,
				dur,
				zoom: byOrientation(3.17, 1.8),
			},
		});
	}

	//

	yield* waitFor(dur * 4);
});
