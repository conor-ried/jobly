const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../expressError");

describe("createSQL", function () {
  test("works for two updates", function () {
    const result = sqlForPartialUpdate({ username: "testuser", first_name: "Chung"}, {username: "username", first_name: "first_name" });

    
    expect(result).toEqual({
      setCols: "\"username\"=$1, \"first_name\"=$2",
      values: ["testuser", "Chung"],
    });
  });
});
//   test("works: admin", function () {
//     const token = createToken({ username: "test", isAdmin: true });
//     const payload = jwt.verify(token, SECRET_KEY);
//     expect(payload).toEqual({
//       iat: expect.any(Number),
//       username: "test",
//       isAdmin: true,
//     });
//   });
describe("createSQL", function () {
    test("works for one update", function () {
      const result = sqlForPartialUpdate({ username: "testuser"}, {username: "username" });
  
      
      expect(result).toEqual({
        setCols: "\"username\"=$1",
        values: ["testuser"],
      });
    });
});


// describe("badSqL", function () {
//     test("throws error for invalid column name", function () {
//         expect(() => {
//           sqlForPartialUpdate({ invalid_column: "testuser" }, {});
//         }).toThrowError(/invalid column name/i);
//       });
//     });