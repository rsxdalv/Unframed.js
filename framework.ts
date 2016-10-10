/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />

import * as http from 'http'
import * as responseTime from 'response-time'
import * as serveFavicon from 'serve-favicon'
import { IncomingMessage, ServerResponse } from 'http'
import * as morgan from 'morgan'

let main = function () {
    http.createServer(function parser(req: IncomingMessage, res: ServerResponse) {
        cascade(Promise.resolve({ req, res }))
    }).listen(3000, 'localhost')
} ()

type mw = { req: IncomingMessage, res: ServerResponse }
type mwp = Promise<mw>

function pre(mw: mw): mw {
    console.log('pre'); return mw
}

function post(mw: mw): mw {
    console.log('post'); return mw
}

function cascade(Promise: mwp) {

    // Pre
    let start
    let first = Promise.then(function (o) {
        start = new Date;
        return o
    })
    // infix
    let infix = server(first)
    // let infix = server(Promise)
    // Post
    let ms
    let last = infix.then(function ({req, res}: mw) {
        ms = new Date as any - start;
        console.log('%s %s - %s', req.method, req.url, ms);
    })
    return last
}
function server(Promise: Promise<{ req: IncomingMessage, res: ServerResponse }>) {
    return Promise
        // .then(favicon)
        .then(thenify(morgan('combined')))
        .then(({req, res}) => { res.write('Hello'); return { req, res } })
        .then(({req, res}) => { res.end(' promises!'); return { req, res } })
}

let thenify = function (middleware) {
    return function ({req, res}) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res })
            })
        })
    }
}

let favicon = thenify(serveFavicon('./favicon-bicycle.ico'))
let rt = thenify(responseTime)

function parser(req: IncomingMessage, res: ServerResponse) {
    Promise.resolve({ req, res })
        .then(favicon)
        .then(thenify(morgan('combined')))
        .then(({req, res}) => { res.write('Hello'); return { req, res } })
        .then(({req, res}) => { res.write(', oh hi again '); return { req, res } })
        .then(({req, res}) => res.end(' hack'))

}