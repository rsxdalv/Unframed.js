/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />


import * as http from 'http'
// declare let responseTime: (req, res, next) => void
import * as responseTime from 'response-time'
import * as serveFavicon from 'serve-favicon'
import { IncomingMessage, ServerResponse } from 'http'

let app: Promise<[IncomingMessage, ServerResponse]> = new Promise((resolve, reject) => {
    const cb = (req: IncomingMessage, res: ServerResponse) => resolve([req, res])
    http.createServer(cb).listen(3001, 'localhost')
})

let thenify = function (middleware) {
    return function ([req, res]) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve([req, res])
            })
        })
    }
}

let favicon = thenify( serveFavicon('./favicon-bicycle.ico') )

let rt = function ([req, res]): Promise<[IncomingMessage, ServerResponse]> {
    return new Promise((resolve, reject) => {
        responseTime(req, res, function () {
            resolve([req, res])
        })
    })
}

app
    // .then( favicon ) 
    .then(([req, res]): [IncomingMessage, ServerResponse] => { res.write('Hello'); return [req, res] })
    .then(([req, res]) => res.end(' hack'))
    // .then(rt)
// app.then(
    // console.log
// )