const { extractSess } = require("./rbrApi");

describe("rbrApi", () => {
  describe("extractSess", () => {
    it("extracts the cookie", () => {
      const headers = {
        "set-cookie": [
          "PHPSESSID=bfa08d13b43c5131b8d1891b26cb91bc; path=/",
          "PHPSESSID=bfa08d13b43c5131b8d1891b26cb91bc; expires=Sat, 23-Apr-2022 00:57:42 GMT; Max-Age=86400; path=/",
          "PHPSESSID=bfa08d13b43c5131b8d1891b26cb91bc; expires=Sat, 23-Apr-2022 00:57:42 GMT; Max-Age=86400; path=/"
        ]
      };
      expect(extractSess(headers)).toEqual("bfa08d13b43c5131b8d1891b26cb91bc");
    });
  });
});
