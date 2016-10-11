declare function describe(string, callback): void;
declare function it(string, callback): void;

import * as _ from '../framework';
import { expect } from 'chai'

describe('roll', function () {
    it('turns a generator into a coroutine', function () {
        let start = 557
        let f = _.roll(function* (start) {
            yield start;
            return start;
        })
        expect(f(start)).to.equal(start) // First call
        expect(f(start)).to.equal(start) // Second call
    })
})