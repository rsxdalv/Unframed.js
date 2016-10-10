/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />

type mw = { req: IncomingMessage, res: ServerResponse }
type mwp = Promise<mw>

import * as http from 'http'
import * as responseTime from 'response-time'
import * as serveFavicon from 'serve-favicon'
import { IncomingMessage, ServerResponse } from 'http'
import * as morgan from 'morgan'

export let main = function () {
    http.createServer(function parser(req: IncomingMessage, res: ServerResponse) {
        newCascade({ req, res })
        // newCascade(Promise.resolve({ req, res }))
    }).listen(3000, 'localhost')
}

export function roll(a: any, mw: mw) {
    let i = a(mw)
    let f = i.next.bind(i)
    return function() {
        let {value} = f()
        return value
    }
}

export let timer = function* (o: mw) {
    let start = Date.now();
    o = yield o;
    let ms = Date.now() - start;
    console.log('ms: %s', ms);
    // console.log('%s %s - %s', this.method, this.url, ms);
}

export function collapse(Promise: mwp, infix) {
    // Pre
    let start
    return infix(Promise.then(function (o) {
        start = new Date;
        return o
    })).then(function ({req, res}: mw) {
        let ms = new Date as any - start;
        console.log('%s %s - %s', req.method, req.url, ms);
    })
}

export function bind(cc, start: mwp, infix: (mwp) => mwp) {
    return infix(start.then(cc)).then(cc)
}

export function newCascade(flow: mw) {
    return bind(
        roll(timer, flow),
        // mw => {
        //     console.log('preafter')
        //     return mw
        // },
        Promise.resolve(flow),
        server)
}

export let thenify = function (middleware) {
    return function ({req, res}) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res })
            })
        })
    }
}

export let favicon = thenify(serveFavicon('./favicon-bicycle.ico'))
export let rt = thenify(responseTime)

export function server(flow: Promise<{ req: IncomingMessage, res: ServerResponse }>) {
    return flow
        // .then(thenify(morgan('combined')))
        .then(({req, res}) => { res.write('Hello'); return { req, res } })
        .then(({req, res}) => { res.end(' promises!'); return { req, res } })
}