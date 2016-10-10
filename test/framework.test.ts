declare function describe(string, callback): void;
declare function it(string, callback): void;

import * as _ from '../framework';
import { expect } from 'chai'

describe('roll', function () {
    it('turns a generator into a coroutine', function () {
        let start = 557
        let f = _.roll(function* (start) {
            yield start;
        }, start as any)
        expect(f()).to.equal(start)
    })
})