// A short tour of the two things a fake function can do for you. Nothing
// here tests the products app -- it's a place to look at the tools on
// their own, away from anything complicated.
//
// Run it with: npm run test:unit

import { beforeEach, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.restoreAllMocks();
});

// #region recorder
it('a fake function remembers how it was called', () => {
  const notify = vi.fn();

  notify('order shipped', 3);

  expect(notify).toHaveBeenCalledWith('order shipped', 3);
  expect(notify).toHaveBeenCalledTimes(1);
});
// #endregion recorder

// #region answer
it('a fake function can be told what to answer', () => {
  const rollDie = vi.fn().mockReturnValue(4);

  expect(rollDie()).toBe(4);
  expect(rollDie()).toBe(4);
});
// #endregion answer

// #region asyncAnswer
it('an async fake answers with a resolved promise', async () => {
  const loadSettings = vi.fn().mockResolvedValue({ theme: 'dark' });

  expect(await loadSettings()).toEqual({ theme: 'dark' });
});
// #endregion asyncAnswer

// #region realThing
const inventory = {
  countOnHand: () => 42
};

it('vi.spyOn alone watches, but does not replace', () => {
  const count = vi.spyOn(inventory, 'countOnHand');

  expect(inventory.countOnHand()).toBe(42);
  expect(count).toHaveBeenCalledTimes(1);
});
// #endregion realThing

// #region replace
it('vi.spyOn plus an answer replaces the real function', () => {
  const count = vi.spyOn(inventory, 'countOnHand').mockReturnValue(0);

  expect(inventory.countOnHand()).toBe(0);
  expect(count).toHaveBeenCalledTimes(1);
});
// #endregion replace
