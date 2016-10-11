"use strict";
const _ = require('../framework');
const chai_1 = require('chai');
describe('roll', function () {
    it('turns a generator into a coroutine', function () {
        let start = 557;
        let f = _.roll(function* (start) {
            yield start;
            return start;
        });
        chai_1.expect(f(start)).to.equal(start);
        chai_1.expect(f(start)).to.equal(start);
    });
});
