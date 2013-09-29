/*require('../../joola.io.analytics.js');

"use strict";
describe("services", function () {
  var request;
  before(function (done) {
    request = require('supertest')('http://localhost:40002', { debug: false });
    done();
  });

  it("should return a page", function (done) {
    this.timeout = 5000;
    try {
      request.get('/').expect(302, function (err) {
        if (err)
          return done(err);
        done();
      });
    } catch (ex) {
      console.log(ex);
    }
  });
});*/