import { makeProject } from '@motion-canvas/core';

import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import '~/week7.css';
import scene from '~/scenes/week-007/sketch-034?scene';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts jsx',
	}),
);

export default makeProject({
	scenes: [scene],
});
