import { makeProject } from '@motion-canvas/core';
import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import scene from '~/scenes/week-006/sketch-026?scene';
import '~/global.css';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts',
	}),
);

export default makeProject({
	scenes: [scene],
});
