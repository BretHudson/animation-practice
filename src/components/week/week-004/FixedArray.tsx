import {
	FlexItems,
	initial,
	interpolation,
	Layout,
	LayoutMode,
	LayoutProps,
	nodeName,
	NodeState,
	Rect,
	RectProps,
	signal,
	Txt,
} from '@motion-canvas/2d';
import {
	all,
	boolLerp,
	chain,
	createEffect,
	createRef,
	createSignal,
	DEFAULT,
	easeInOutCubic,
	easeInQuad,
	map,
	Reference,
	sequence,
	SignalValue,
	SimpleSignal,
	spawn,
	TimingFunction,
	tween,
	Vector2,
	waitFor,
	waitUntil,
} from '@motion-canvas/core';
import { ArraySlot, emptyStr } from './ArraySlot';
import { positionItemInRow } from '~/util';

export interface FixedArrayProps extends LayoutProps {
	itemSize: SignalValue<number>;
	alignItems?: SignalValue<FlexItems>;
	layout?: LayoutMode;
}

const itemSize = 140;

@nodeName('FixedArray')
export class FixedArray extends Layout {
	@initial(true)
	@interpolation(boolLerp)
	@signal()
	public declare readonly layout: SimpleSignal<LayoutMode, this>;

	@initial('center')
	@signal()
	public declare readonly alignItems: SimpleSignal<FlexItems, this>;

	@initial(0)
	@signal()
	public declare readonly count: SimpleSignal<number, this>;

	@initial(140)
	@signal()
	public declare readonly itemSize: SimpleSignal<number, this>;

	@initial(0)
	@signal()
	public declare readonly arrCount: SimpleSignal<number, this>;

	private addYPos = createSignal(() => this.y() + this.itemSize() * 1.5);

	public slots: ArraySlot[] = [];

	constructor(props: FixedArrayProps) {
		super(props);

		this.arrCount(() => 0);

		this.minHeight(createSignal(() => this.itemSize() * 0.2));

		createEffect(() => {
			const targetCount = Math.round(this.count());

			const scaleDur = 0.8;

			for (let i = this.slots.length; i < targetCount; i++) {
				const slot = this.createSlot();
				this.add(slot);

				this.slots.push(slot);
				spawn(slot.growIn(scaleDur));
			}

			for (let i = this.slots.length; i > targetCount; i--) {
				const slot = this.slots.shift()!;
				spawn(slot.shrinkOut(scaleDur).do(() => slot.remove()));
			}
		});
	}

	*setLength(n: number, dur: number, timingFunction: TimingFunction) {
		yield* this.count(n, dur, timingFunction);
	}

	createSlot(startSmall = true, txt = emptyStr, itemSize = this.itemSize()) {
		const slot = (
			<ArraySlot
				stroke={'white'}
				lineWidth={3}
				itemSize={itemSize}
				startSmall={startSmall}
			/>
		) as ArraySlot;
		slot.setText(txt);
		return slot;
	}

	createSlotToAdd(value: string) {
		const slot = this.createSlot(true, value, this.itemSize() * 0.8);
		slot.y(this.addYPos());
		return slot;
	}

	createSlotToRemove(slot: ArraySlot) {
		return slot.clone();
	}

	*_push(slot: ArraySlot, offset = 0) {
		const index = this.arrCount() + offset;
		const dur = 0.6; //((maxArrLen - index) / maxArrLen) * 0.5;
		const toReplace = this.slots[index];
		yield* sequence(
			dur * 0.33,
			slot.overlapArraySlot(toReplace, Vector2.zero, dur),
			all(toReplace.fadeOut(0.4), slot.scaleTo(itemSize, 0.4)),
		);
		toReplace.parent().insert(slot, index);
		toReplace.remove();
		this.slots[index] = slot;
	}

	*push(...items: string[]) {
		const slotsToAdd = items.map((v, i) => {
			const slot = this.createSlotToAdd(v);
			slot.x(positionItemInRow(i, items.length, itemSize));
			return slot;
		});
		this.parent().add(slotsToAdd);

		if (slotsToAdd.length === 1) {
			const [slot] = slotsToAdd;
			yield* slot.growIn();
			yield* waitUntil('ready-to-push');
			yield* this._push(slot);
		} else {
			yield* sequence(
				0.05,
				...slotsToAdd.map((s, i) =>
					chain(waitFor(i * 0.1), s.growIn().wait(1), this._push(s, i)),
				),
			);
		}

		yield* this.arrCount(
			this.arrCount() + items.length,
			0.3 * Math.log2(1 + items.length),
		);
	}

	*_pop() {
		const index = this.arrCount() - 1;
		const toRemove = this.slots[index];
		const slot = this.createSlotToRemove(toRemove);
		toRemove.setText(emptyStr);
		toRemove.opacityScale(0);

		// view.add(slot);
		this.parent().add(slot);

		slot.absolutePosition(toRemove.absolutePosition());
		const dur = 0.6;
		const start = slot.position();

		const target = new Vector2(0, this.addYPos());
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

	*pop() {
		const poppedSlot = yield* this._pop();
		yield* waitFor(0.5);
		yield* this.arrCount(this.arrCount() - 1, 0.3);
		yield* waitFor(1);
		yield* all(
			poppedSlot.fadeOut(0.4).do(() => poppedSlot.remove()),
			poppedSlot.scale(0.7, 0.5),
		);
	}

	*_insertItemAtIndex(slot: ArraySlot, index: number) {
		const dur = 0.6;
		const toReplace = this.slots[index];
		const toClone = this.slots
			.slice(index)
			.filter((slot) => slot.txt().text() !== emptyStr);

		const toMove = toClone.map((s) => s.clone());
		// view.add(toMove);
		this.parent().add(toMove);

		const lastValue = this.slots[index + toClone.length - 1].txt().text();
		for (let i = index + toClone.length - 1; i >= index; --i) {
			this.slots[i].setText(this.slots[i - 1].txt().text());
			this.slots[i].txt().opacity(0);
		}

		const lastSlot = this.slots[index + toClone.length];
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
						this.slots[index + toMove.length - i].fadeOut(0.4),
					),
				);
			}),
		);

		lastSlot.setText(lastValue);
		for (let i = index + toClone.length; i > index; --i) {
			this.slots[i].txt().opacity(1);
			this.slots[i].opacityScale(1);
		}

		toMove.forEach((s) => s.remove());

		yield* waitUntil('do-insert');
		yield* sequence(
			dur * 0.33,
			slot.overlapArraySlot(toReplace, Vector2.zero, dur),
			all(toReplace.fadeOut(0.4), slot.scaleTo(itemSize, 0.4)),
		);
		toReplace.parent().insert(slot, index);
		toReplace.remove();
		this.slots[index] = slot;
	}

	*insertItemAtIndex(item: string, index: number) {
		const slot = this.createSlotToAdd(item);
		this.parent().add(slot);
		yield* slot.growIn().wait(1);
		yield* waitUntil('insert-move');
		yield* this._insertItemAtIndex(slot, index);
		yield* this.arrCount(this.arrCount() + 1, 0.3);
	}

	*_removeIndex(index: number) {
		const toRemove = this.slots[index];
		const slot = this.createSlotToRemove(toRemove);
		toRemove.setText(emptyStr);
		toRemove.opacityScale(0);
		// view.add(slot);
		this.parent().add(slot);
		slot.absolutePosition(toRemove.absolutePosition());
		const dur = 0.6;
		const start = slot.position();
		const target = new Vector2(0, this.addYPos());
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

		yield* waitUntil('remove-done');

		// move all items over
		const toClone = this.slots
			.slice(index)
			.filter((slot) => slot.txt().text() !== emptyStr);

		const toMove = toClone.map((s) => s.clone());
		// view.add(toMove);
		this.parent().add(toMove);

		for (let i = index + 1; i <= index + toMove.length; ++i) {
			this.slots[i].setText(this.slots[i + 1].txt().text());
			this.slots[i].txt().opacity(0);
		}

		const firstSlot = this.slots[index];
		const firstValue = toMove[0].txt().text();

		const emptySlot = this.slots[index + toMove.length];
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
						this.slots[index].fadeOut(0.4),
					),
				);
			}),
			chain(waitFor(0.7), emptySlot.txt().opacity(emptyOpacity, 0.3)),
		);

		firstSlot.setText(firstValue);
		for (let i = index; i < index + toClone.length; ++i) {
			this.slots[i].txt().opacity(1);
			this.slots[i].opacityScale(1);
		}

		toMove.forEach((s) => s.remove());

		return slot;
	}

	*removeIndex(index: number) {
		const removedSlot = yield* this._removeIndex(index);
		yield* waitFor(0.5);
		yield* this.arrCount(this.arrCount() - 1, 0.3);
		yield* waitFor(1);
		yield* all(
			removedSlot.fadeOut(0.4).do(() => removedSlot.remove()),
			removedSlot.scale(0.7, 0.5),
		);
	}
}
