/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="index.d.ts" />

import * as http from 'http'
import * as responseTime from 'response-time'
import * as serveFavicon from 'serve-favicon'
import { IncomingMessage, ServerResponse } from 'http'
import * as morgan from 'morgan'

let main = function () {
    http.createServer(parser).listen(3000, 'localhost')
} ()

let thenify = function (middleware) {
    return function ({req, res}) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({req, res})
            })
        })
    }
}

let favicon = thenify(serveFavicon('./favicon-bicycle.ico'))
let rt = thenify(responseTime)

function parser(req: IncomingMessage, res: ServerResponse) {
    Promise.resolve({ req, res })
        .then(favicon)
        .then( thenify(morgan('combined')))
        .then(({req, res}) => { res.write('Hello'); return { req, res } })
        .then(({req, res}) => { res.write(', oh hi again '); return { req, res } })
        .then(({req, res}) => res.end(' hack'))

}