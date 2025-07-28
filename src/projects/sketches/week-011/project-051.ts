import { makeProject } from '@motion-canvas/core';

import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import '~/week9.css';
import scene from '~/scenes/week-011/sketch-051?scene';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts jsx',
	}),
);

export default makeProject({
	scenes: [scene],
	experimentalFeatures: true,
});
