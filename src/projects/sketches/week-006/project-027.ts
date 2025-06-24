import { makeProject } from '@motion-canvas/core';
import { Code, LezerHighlighter } from '@motion-canvas/2d';
import { parser } from '@lezer/javascript';

import sceneA from '~/scenes/week-006/sketch-027/027-a?scene';
import sceneB from '~/scenes/week-006/sketch-027/027-b?scene';
import sceneC from '~/scenes/week-006/sketch-027/027-c?scene';
import '~/global.css';

Code.defaultHighlighter = new LezerHighlighter(
	parser.configure({
		dialect: 'ts',
	}),
);

export default makeProject({
	scenes: [sceneA, sceneB, sceneC, sceneA],
});
