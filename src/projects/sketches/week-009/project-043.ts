import { makeProject } from '@motion-canvas/core';

import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import '~/week9.css';
import scene from '~/scenes/week-009/sketch-043?scene';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts jsx',
	}),
);

export default makeProject({
	scenes: [scene],
	experimentalFeatures: true,
});
