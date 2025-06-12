import { Layout, makeScene2D } from '@motion-canvas/2d';
import {
	all,
	chain,
	createEffect,
	createRef,
	createSignal,
	easeInOutCubic,
	easeInQuad,
	easeOutQuad,
	sequence,
	spawn,
	tween,
	Vector2,
	waitFor,
} from '@motion-canvas/core';
import { SafeArea } from '~/components/SafeArea';
import { ArraySlot, emptyStr } from '~/components/week/week-004/ArraySlot';
import { Week4Credits } from '~/components/week/week-004/Credits';
import { LabelledRay } from '~/components/week/week-004/LabelledRay';
import { Week4Title } from '~/components/week/week-004/Title';
import { allMap, getViewportData, positionItemInRow } from '~/util';

export default makeScene2D(function* (view) {
	const { byOrientation } = getViewportData(view);

	view.fontFamily('Outfit');

	view.add(<SafeArea />);
	view.add(
		<>
			<Week4Title
				y={-650 * 0.5 - 110}
				title="Arrays"
				subtitle="[WIP] Time Complexity"
			/>
			<Week4Credits />
		</>,
	);

	const itemSize = byOrientation(140, 140);
	const maxArrLen = 5;

	const count = createSignal(0);
	const container = createRef<Layout>();
	view.add(
		<Layout
			minHeight={itemSize * 0.2}
			alignItems={'center'}
			ref={container}
			layout
		/>,
	);

	const slots: ArraySlot[] = [];

	const createSlot = (
		startSmall = true,
		txt = emptyStr,
		_itemSize = itemSize,
	) => {
		const slot = (
			<ArraySlot
				stroke={'white'}
				lineWidth={3}
				itemSize={_itemSize}
				startSmall={startSmall}
			/>
		) as ArraySlot;
		slot.setText(txt);
		return slot;
	};

	const addYPos = itemSize * 1.5;
	const createSlotToAdd = (value: string) => {
		const slot = createSlot(true, value, itemSize * 0.8);
		slot.y(addYPos);
		return slot;
	};

	const createSlotToRemove = (slot: ArraySlot) => {
		const clone = slot.clone();
		clone.setText(slot.txt().text());
		clone.txt().scale(clone.scale);
		return clone;
	};

	const arrCount = createSignal(() => 0);

	const label = createSignal(() => `Items: ${Math.round(arrCount())}`);
	const opacity = createSignal(() => {
		return easeInQuad(container().width() / (itemSize * maxArrLen));
	});
	const x = createSignal(() => {
		return (
			positionItemInRow(arrCount() - 0.5, maxArrLen, itemSize, 0) * opacity()
		);
	});

	view.add(
		<LabelledRay
			x={x}
			y={-itemSize * 0.5}
			opacity={opacity}
			label={label}
			flipped
		/>,
	);

	createEffect(() => {
		const targetCount = Math.round(count());

		for (let i = slots.length; i < targetCount; i++) {
			const slot = createSlot();
			container().add(slot);

			slots.push(slot);
			spawn(slot.growIn());
		}

		for (let i = slots.length; i > targetCount; i--) {
			const slot = slots.shift()!;
			spawn(slot.shrinkOut().do(() => slot.remove()));
		}
	});

	yield* count(maxArrLen, 0.5, easeOutQuad);

	yield* waitFor(1);

	// older push animation, kind of cool
	function* moveToEndAndSlide(slot: ArraySlot) {
		const index = arrCount();
		const dur = (maxArrLen - index) / maxArrLen;
		const toReplace = slots[index];
		yield* slot.overlapArraySlot(
			slots[maxArrLen - 1],
			new Vector2(itemSize, 0),
		);
		yield* waitFor(0.5);
		yield* sequence(
			dur - 0.4,
			slot.absolutePosition(toReplace.absolutePosition(), dur),
			all(toReplace.fadeOut(0.4), slot.scaleTo(itemSize, 0.4)),
		);
		yield* arrCount(index + 1, 0.3);
		toReplace.parent().insert(slot, index);
		toReplace.remove();
	}

	function* push(slot: ArraySlot, offset = 0) {
		const index = arrCount() + offset;
		const dur = 0.6; //((maxArrLen - index) / maxArrLen) * 0.5;
		const toReplace = slots[index];
		yield* sequence(
			dur * 0.33,
			slot.overlapArraySlot(toReplace, Vector2.zero, dur),
			all(toReplace.fadeOut(0.4), slot.scaleTo(itemSize, 0.4)),
		);
		toReplace.parent().insert(slot, index);
		toReplace.remove();
		slots[index] = slot;
	}

	function* insert(slot: ArraySlot, index: number) {
		const dur = 0.6;
		const toReplace = slots[index];
		const toClone = slots
			.slice(index)
			.filter((slot) => slot.txt().text() !== emptyStr);

		const toMove = toClone.map((s) => s.clone());
		view.add(toMove);

		toMove.forEach((s, i) => s.setText(toClone[i].txt().text()));

		const lastValue = slots[index + toClone.length - 1].txt().text();
		for (let i = index + toClone.length - 1; i >= index; --i) {
			slots[i].setText(slots[i - 1].txt().text());
			slots[i].txt().opacity(0);
		}

		const lastSlot = slots[index + toClone.length];
		yield* lastSlot.txt().opacity(0, 0.3);
		lastSlot.txt().opacity(0);

		yield* sequence(
			0.15,
			...toMove.reverse().map((s, i) => {
				const nextPos = s.absolutePosition().add(new Vector2(itemSize, 0));
				return chain(
					s.scaleTo(itemSize * 0.8, 0.3),
					waitFor(0.5),
					sequence(
						0.2,
						chain(
							s.absolutePosition(nextPos, 0.5),
							waitFor(0.2),
							s.scaleTo(itemSize, 0.3),
						),
						slots[index + toMove.length - i].fadeOut(0.4),
					),
				);
			}),
		);

		lastSlot.setText(lastValue);
		for (let i = index + toClone.length; i > index; --i) {
			slots[i].txt().opacity(1);
			slots[i].opacityScale(1);
		}

		toMove.forEach((s) => s.remove());

		yield* sequence(
			dur * 0.33,
			slot.overlapArraySlot(toReplace, Vector2.zero, dur),
			all(toReplace.fadeOut(0.4), slot.scaleTo(itemSize, 0.4)),
		);
		toReplace.parent().insert(slot, index);
		toReplace.remove();
		slots[index] = slot;
	}

	function* pop() {
		const index = arrCount() - 1;
		const toRemove = slots[index];
		const slot = createSlotToRemove(toRemove);
		toRemove.setText(emptyStr);
		toRemove.opacityScale(0);
		view.add(slot);
		slot.absolutePosition(toRemove.absolutePosition());
		const dur = 0.6;
		const start = slot.position();
		const target = new Vector2(0, addYPos);
		yield* sequence(
			dur * 0.25,
			all(
				chain(waitFor(0.1), slot.scaleTo(itemSize * 0.8, 0.4)),
				tween(dur, (value) => {
					const t = easeInOutCubic(value);
					slot.position(Vector2.arcLerp(start, target, t, true));
				}),
			),
			toRemove.opacityScale(1, 0.3),
		);
		return slot;
	}

	function* remove(index: number) {
		const toRemove = slots[index];
		const slot = createSlotToRemove(toRemove);
		toRemove.setText(emptyStr);
		toRemove.opacityScale(0);
		view.add(slot);
		slot.absolutePosition(toRemove.absolutePosition());
		const dur = 0.6;
		const start = slot.position();
		const target = new Vector2(0, addYPos);
		yield* sequence(
			dur * 0.25,
			all(
				chain(waitFor(0.1), slot.scaleTo(itemSize * 0.8, 0.4)),
				tween(dur, (value) => {
					const t = easeInOutCubic(value);
					slot.position(Vector2.arcLerp(start, target, t, true));
				}),
			),
			toRemove.opacityScale(1, 0.3),
		);

		// move all items over
		const toClone = slots
			.slice(index)
			.filter((slot) => slot.txt().text() !== emptyStr);

		const toMove = toClone.map((s) => s.clone());
		view.add(toMove);

		toMove.forEach((s, i) => s.setText(toClone[i].txt().text()));

		for (let i = index + 1; i <= index + toMove.length; ++i) {
			slots[i].setText(slots[i + 1].txt().text());
			slots[i].txt().opacity(0);
		}

		const firstSlot = slots[index];
		const firstValue = toMove[0].txt().text();

		const emptySlot = slots[index + toMove.length];
		emptySlot.setText(emptyStr);
		const emptyOpacity = emptySlot.txt().opacity();
		emptySlot.txt().opacity(0);

		yield* sequence(
			0.15,
			...toMove.map((s) => {
				const nextPos = s.absolutePosition().add(new Vector2(-itemSize, 0));
				return chain(
					s.scaleTo(itemSize * 0.8, 0.3),
					waitFor(0.5),
					sequence(
						0.2,
						chain(
							s.absolutePosition(nextPos, 0.5),
							waitFor(0.2),
							s.scaleTo(itemSize, 0.3),
						),
						slots[index].fadeOut(0.4),
					),
				);
			}),
			chain(waitFor(0.7), emptySlot.txt().opacity(emptyOpacity, 0.3)),
		);

		firstSlot.setText(firstValue);
		for (let i = index; i < index + toClone.length; ++i) {
			slots[i].txt().opacity(1);
			slots[i].opacityScale(1);
		}

		toMove.forEach((s) => s.remove());

		// yield* emptySlot.txt().opacity(emptyOpacity, 0.3);

		return slot;
	}

	const slot0 = createSlotToAdd('0');
	view.add(slot0);
	yield* slot0.growIn().wait(1);
	yield* push(slot0);
	yield* arrCount(1, 0.3);
	yield* waitFor(1);

	const valuesToAdd = ['2', '3', '4'];
	const slotsToAdd = valuesToAdd.map((v, i) => {
		const slot = createSlotToAdd(v);
		slot.x(positionItemInRow(i, valuesToAdd.length, itemSize));
		return slot;
	});
	view.add(slotsToAdd);
	yield* sequence(
		0.05,
		...slotsToAdd.map((s, i) =>
			chain(waitFor(i * 0.1), s.growIn().wait(1), push(s, i)),
		),
	);
	yield* arrCount(4, 0.3);
	yield* waitFor(1);

	const slot1 = createSlotToAdd('1');
	view.add(slot1);
	yield* slot1.growIn().wait(1);
	yield* insert(slot1, 1);
	yield* arrCount(5, 0.3);
	yield* waitFor(1);

	const poppedSlot = yield* pop();
	yield* waitFor(0.5);
	yield* arrCount(4, 0.3);
	yield* waitFor(1);
	yield* all(
		poppedSlot.fadeOut(0.4).do(() => poppedSlot.remove()),
		poppedSlot.scale(0.7, 0.5),
	);
	yield* waitFor(1);

	const removedSlot = yield* remove(1);
	yield* waitFor(0.5);
	yield* arrCount(3, 0.3);
	yield* waitFor(1);
	yield* all(
		removedSlot.fadeOut(0.4).do(() => removedSlot.remove()),
		removedSlot.scale(0.7, 0.5),
	);
	yield* waitFor(1);

	// const slot4 = createSlotToAdd('4');
	// view.add(slot4);
	// yield* slot4.growIn().wait(1);
	// yield* push(slot4);
	// yield* arrCount(3, 0.3);
	// yield* waitFor(1);

	// yield* arrCount(maxArrLen, 0.5);

	yield* count(0, 0.5, easeInQuad);

	yield* waitFor(1);
});
