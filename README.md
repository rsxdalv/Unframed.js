# unframed
## Least a framework can probably be

A 'framework' or rather a convention with utilities for linking existing 
code and simplifying common tasks.

# The principle
ES2015 has given JavaScript and Node.js Promises which is an abstract
object representing an asynchrounous task. From that logic, any server,
for instance a http web server, can be represented using a callback
function that accepts a promise.
```js
function( Promise ) { Promise.then({request, response} => { response.end('Hello, World!') })}
```
Such a function can use all the might of promises.  
However, to be middleware/monoid-like, it **must** return an expression which resolves 
to a single argument (limitation of promises) which is {request, 
response}  
This of course is just an enabling limitation that *should* be ignored at
the end of the responses, considering that the chain can contain database
requests and ultimately be piped into a template engine.

## Why not express? 
Express uses callback based code that becomes tortourous when implementing 
a view from external API with a database based cache.
## Don't we already have koa?
Koa enables yielding promises, however, also introduces a lot of additional 
complexity as it imposes an understanding of generators at a fundamental 
level. 

# Basic implementation

```js
require('http')
.createServer((req, res) => {
    Promise.resolve({ req, res })
        .then(({ req, res }) => { res.write('Hello'); return { req, res }; })        
        .then(({ req, res }) => { res.end(' World!'); return { req, res }; })        
})
    .listen(3000, 'localhost');
```

That's it.

# Utilities

Since such a framework has no native middleware, conversion utilities are
very useful.

## Thenify: express => unframed

```js
function thenify(middleware) {
    return function ({ req, res }) {
        return new Promise((resolve, reject) => {
            middleware(req, res, function () {
                resolve({ req, res });
            });
        });
    };
};
```
This function enables conversion between express style middleware and .then
style by creating a function that accepts {req, res} and replacing the next()
with a resolve callback of a new Promise. This function works on morgan and
serve-favicon, for example; however, misbehaves with 'response-time'.

## Advanced: Cascading | Suspended execution | generator functions

Phew. The real battle against Koa begins here. TL;DR: It uses generator
functions, but is more an example of how it can be done, since promises
themselves are a very powerful primitive.

