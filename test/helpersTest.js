const { assert } = require('chai');

const { emailCompare } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "dank@m.com",
    password: "123"
  }
};

describe('emailCompare', function() {
  it('should return true valid email', function() {
    const user = emailCompare("user@example.com", testUsers);
    assert.isTrue(user);
  });

  it('should return false', function () {
    const
  })
});