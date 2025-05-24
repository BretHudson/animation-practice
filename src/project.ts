import { FullSceneDescription, makeProject } from '@motion-canvas/core';

import './global.css';

const sketchCount = 5;
const sketches = await Promise.all<FullSceneDescription>(
	Array.from({ length: sketchCount }, async (_, i) => {
		const key = `${i + 1}`.padStart(3, '0');
		return (await import(`./scenes/sketch-${key}?scene`)).default;
	}),
);

export default makeProject({
	scenes: sketches.reverse().slice(0, 1),
});
