import assert from "node:assert/strict";
import { test } from "node:test";
import { splitChoices } from "./choices.ts";
import { parseDice, rollDice } from "./dice.ts";
import { judge } from "./rps.ts";

test("parseDice reads common notation", () => {
  assert.deepEqual(parseDice("d20"), { count: 1, sides: 20, modifier: 0 });
  assert.deepEqual(parseDice("2d6"), { count: 2, sides: 6, modifier: 0 });
  assert.deepEqual(parseDice("3D8 + 2"), { count: 3, sides: 8, modifier: 2 });
  assert.deepEqual(parseDice("4d6-1"), { count: 4, sides: 6, modifier: -1 });
  assert.deepEqual(parseDice("100"), { count: 1, sides: 100, modifier: 0 });
});

test("parseDice rejects nonsense and out-of-range dice", () => {
  for (const bad of ["", "abc", "d", "2d", "d1", "0d6", "101d6", "d1001", "2d6+"]) {
    assert.equal(typeof parseDice(bad), "string", bad);
  }
});

test("rollDice sums rolls plus modifier", () => {
  const result = rollDice({ count: 3, sides: 6, modifier: 2 }, () => 4);
  assert.deepEqual(result, { rolls: [4, 4, 4], total: 14 });
});

test("splitChoices handles commas, pipes, 'or' and spaces", () => {
  assert.deepEqual(splitChoices("pizza, sushi | tacos or burgers"), ["pizza", "sushi", "tacos", "burgers"]);
  assert.deepEqual(splitChoices("ice cream, frozen yogurt"), ["ice cream", "frozen yogurt"]);
  assert.deepEqual(splitChoices("red blue red"), ["red", "blue"]);
  assert.deepEqual(splitChoices("fortune, oregano"), ["fortune", "oregano"]);
});

test("judge follows the rules", () => {
  assert.equal(judge("rock", "scissors"), 1);
  assert.equal(judge("rock", "paper"), -1);
  assert.equal(judge("paper", "paper"), 0);
});
