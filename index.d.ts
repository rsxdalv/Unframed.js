declare module 'response-time' {
    function responseTime(req, res, next): void
    namespace responseTime { }
    export = responseTime
}

declare module 'serve-favicon' {
    function serveFavicon(path, opts?): (req, res, next) => void
    namespace serveFavicon { }
    export = serveFavicon
}

declare module 'morgan' {
    function morganF(mode: string): (req, res, next) => void
    namespace morganF { }
    export = morganF
}