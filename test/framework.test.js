"use strict";
const _ = require('../framework');
const chai_1 = require('chai');
describe('roll', function () {
    it('turns a generator into a coroutine', function () {
        let start = 557;
        let f = _.roll(function* (start) {
            yield start;
        }, start);
        chai_1.expect(f()).to.equal(start);
    });
});
