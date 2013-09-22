var
  app = require('../../joola.io.analytics.js');

"use strict";
describe("services", function () {
  var request;
  before(function (done) {
    request = require('supertest')('http://localhost:42113',{ debug: false });
		done();
	});

	it("should return a page", function (done) {
		this.timeout = 5000;
    request.get('/').expect(302, function (err) {
      if (err)
        return done(err);
      done();
    });
	});
});