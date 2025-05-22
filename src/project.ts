import { makeProject } from '@motion-canvas/core';

import sketch001 from './scenes/example?scene';
import sketch002 from './scenes/sketch-002?scene';
import sketch003 from './scenes/sketch-003?scene';

import './global.css';

export default makeProject({
	scenes: [sketch003],
});
