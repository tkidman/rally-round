const { knapsack, knapsackDroppedIndexes } = require("./shared");

describe("knapsack", () => {
  it("calculates correct max value", () => {
    expect(knapsack(2, [1, 2, 1], [30, 2, 1])).toEqual(31);
    expect(knapsack(2, [1, 1], [1, 1])).toEqual(2);
    expect(knapsack(2, [1, 1, 2], [10, 10, 21])).toEqual(21);
    expect(knapsack(3, [1, 1, 2], [10, 11, 21])).toEqual(32);
    expect(knapsack(0, [1, 1, 2], [10, 11, 21])).toEqual(0);
    expect(knapsack(1, [1, 1, 2], [10, 11, 21])).toEqual(11);
    expect(knapsack(6, [1, 1, 2], [10, 11, 21])).toEqual(42);
  });
});

describe("knapsackDroppedIndexes", () => {
  it("drops the rounds the optimal selection leaves out", () => {
    // one round of budget spent on the cheapest way to lose the fewest points
    expect(knapsackDroppedIndexes(2, [1, 1, 1], [10, 2, 8])).toEqual([1]);
    expect(knapsackDroppedIndexes(2, [1, 1, 1], [2, 10, 8])).toEqual([0]);
    expect(knapsackDroppedIndexes(1, [1, 1, 1], [10, 2, 8])).toEqual([1, 2]);
  });

  it("drops no more rounds than the budget when scores tie", () => {
    // a zero scoring round is worth keeping once the budget is spent
    expect(knapsackDroppedIndexes(2, [1, 1, 1], [10, 0, 0])).toEqual([1]);
    expect(knapsackDroppedIndexes(3, [1, 1, 1], [0, 0, 0])).toEqual([]);
  });

  it("accounts for endurance round weights", () => {
    // the endurance round counts double, so dropping it costs two rounds of
    // budget - cheaper to drop both single rounds here
    expect(knapsackDroppedIndexes(2, [1, 2, 1], [5, 30, 4])).toEqual([0, 2]);
    // ...but not when the endurance round is the weak one
    expect(knapsackDroppedIndexes(2, [1, 2, 1], [30, 3, 20])).toEqual([1]);
  });

  it("drops everything when no rounds count", () => {
    expect(knapsackDroppedIndexes(0, [1, 1], [10, 11])).toEqual([0, 1]);
  });

  it("keeps the total in step with knapsack", () => {
    const weights = [1, 2, 1, 1];
    const points = [12, 25, 0, 7];
    const dropped = knapsackDroppedIndexes(3, weights, points);
    const kept = points.filter((_, index) => !dropped.includes(index));
    expect(kept.reduce((total, value) => total + value, 0)).toEqual(
      knapsack(3, weights, points)
    );
  });
});
