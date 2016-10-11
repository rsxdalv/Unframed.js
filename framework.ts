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
        // newCascade({ req, res })
        newCascade(Promise.resolve({ req, res }))
    }).listen(3000, 'localhost')
}

export function roll(generator: any) {
    let i
    return function(o) {
        i = i || generator(o)
        let {value} = i.next(o)
        return value
    }
}

export let timer = function* ({req, res}: mw) {
    let start = Date.now();
    let {_req, _res} = yield {req, res};
    let ms = Date.now() - start;
    console.log('%s %s ms: %s', req.method, req.url, ms);
    return {_req, _res}
}

export function bind(cc, start: mwp, infix: (mwp) => mwp) {
    return infix(start.then(cc)).then(cc)
}

export function newCascade(flow: mwp) {
    return bind(
        roll(timer),
        flow,
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