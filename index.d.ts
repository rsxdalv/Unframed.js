declare module 'response-time' {
    function responseTime(req, res, next): void
    namespace responseTime {}
    export = responseTime
}

declare module 'serve-favicon' {
    function serveFavicon(path): (req, res, next) => void
    namespace serveFavicon {}
    export = serveFavicon
}