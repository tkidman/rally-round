const { knapsack } = require("./shared");

describe("knapsack", () => {
  it("calculates correct max value", () => {
    expect(knapsack(2, [1, 2, 1], [30, 2, 1], 3)).toEqual(31);
    expect(knapsack(2, [1, 1], [1, 1], 2)).toEqual(2);
    expect(knapsack(2, [1, 1, 2], [10, 10, 21], 3)).toEqual(21);
    expect(knapsack(3, [1, 1, 2], [10, 11, 21], 3)).toEqual(32);
    expect(knapsack(0, [1, 1, 2], [10, 11, 21], 3)).toEqual(0);
    expect(knapsack(1, [1, 1, 2], [10, 11, 21], 3)).toEqual(11);
    expect(knapsack(6, [1, 1, 2], [10, 11, 21], 3)).toEqual(42);
  });
});
