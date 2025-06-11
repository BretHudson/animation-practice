import { makeProject } from '@motion-canvas/core';
import scene from '~/scenes/week-004/sketch-017?scene';
import '~/global.css';

import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts',
	}),
);

export default makeProject({
	scenes: [scene],
});
