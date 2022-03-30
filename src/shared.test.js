const { knapSack } = require("./shared");

describe("knapSack", () => {
  it("calculates correct max value", () => {
    expect(knapSack(2, [1, 2, 1], [30, 2, 1], 3)).toEqual(31);
    expect(knapSack(2, [1, 1], [1, 1], 2)).toEqual(2);
    expect(knapSack(2, [1, 1, 2], [10, 10, 21], 3)).toEqual(21);
    expect(knapSack(3, [1, 1, 2], [10, 11, 21], 3)).toEqual(32);
    expect(knapSack(0, [1, 1, 2], [10, 11, 21], 3)).toEqual(0);
    expect(knapSack(1, [1, 1, 2], [10, 11, 21], 3)).toEqual(11);
  });
});
