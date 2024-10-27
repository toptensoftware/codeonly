import { DocumentScrollPosition } from "./DocumentScrollPosition.js";
import { urlPattern } from "./urlPattern.js";

export class Router
{   
    constructor(handlers)
    {
        if (handlers)
            this.register(handlers);
    }

    start(driver)
    {
        this.#driver = driver;
        this.navigate = driver.navigate.bind(driver);
        this.replace = driver.navigate.bind(driver);
        this.back = driver.back.bind(driver);
        return driver.start(this);
    }

    #driver;

    internalize = x => x;
    externalize = x => x;

    // The current route
    #current = null;
    get current()
    {
        return this.#current;
    }

    // The route currently being switched to
    #pending = null;
    get pending()
    {
        return this.#pending;
    }


    #listeners = [];
    addEventListener(event, handler)
    {
        this.#listeners.push({ event, handler });
    }
    removeEventListener(event, handler)
    {
        let index = this.#listeners.findIndex(x => x.event == event && x.handler == handler);
        if (index >= 0)
            this.#listeners.splice(index, 1);
    }
    async dispatchEvent(event, canCancel, from, to)
    {
        for (let l of this.#listeners)
        {
            if (l.event == event)
            {
                let r = l.handler(from, to);
                if (canCancel && (await Promise.resolve(r)) == false)
                    return false;
            }
        }
        return true;
    }

    // Load a URL with state
    async load(url, state, route)
    {
        let from = this.#current;

        // Create route
        this.#pending = route = Object.assign({ 
            current: false,
            url, 
            pathname: url.pathname,
            state,
            originalUrl: url 
        }, route);

        // Match url
        route = await this.matchUrl(url, state, route);
        if (!route)
            return null;

        // Try to load
        try
        {
            if ((await this.tryLoad(route)) !== true)
            {
                this.#pending = null;
            }
        }
        catch (err)
        {
            this.dispatchCancelEvents(from, route);
            throw err;
        }

        // Cancelled?
        if (this.#pending != route)
        {
            this.dispatchCancelEvents(from, route);
            return null;
        }

        this.#pending = null;
        return route;

    }

    dispatchCancelEvents(from, route)
    {
        this.#current?.handler.cancelLeave?.(from, route);
        route.handler.cancelEnter?.(from, route);
        this.dispatchEvent("cancel", false, from, route);
    }

    // Fires the sequence of events associated with loading a route
    // 
    // event => mayLeave        |
    // old route => mayLeave    |  Async and cancellable
    // new route => mayEnter    |
    // event => mayEnter        |
    // 
    // event => didLeave        |
    // old route => didLeave    |  Sync and non-cancellable
    // new route => didEnter    |
    // event => didEnter        |
    //
    async tryLoad(route)
    {
        let oldRoute = this.#current;

        // Try to leave old route
        let r;
        if (oldRoute)
        {
            // mayLeave event
            if (!await this.dispatchEvent("mayLeave", true, oldRoute, route))
                return;

            // Cancelled?
            if (route != this.#pending)
                return;

            // mayLeave old route
            r = oldRoute.handler.mayLeave?.(oldRoute, route);
            if ((await Promise.resolve(r)) === false)
                return;

            // Cancelled?
            if (route != this.#pending)
                return;
        }

        // mayEnter new route
        r = route.handler.mayEnter?.(oldRoute, route);
        if ((await Promise.resolve(r)) === false)
            return;

        // Cancelled?
        if (route != this.#pending)
            return;

        // mayEnter event
        if (!await this.dispatchEvent("mayEnter", true, oldRoute, route))
            return;

        // Cancelled?
        if (route != this.#pending)
            return;

        // Switch current route
        if (oldRoute)
            oldRoute.current = false;
        route.current = true;
        this.#current = route;

        // Notify (sync, cant cancel)
        if (oldRoute)
        {
            this.dispatchEvent("didLeave", false, oldRoute, route);
            oldRoute?.handler.didLeave?.(oldRoute, route);
        }
        route.handler.didEnter?.(oldRoute, route);
        this.dispatchEvent("didEnter", false, oldRoute, route);
        return true;
    }

    async matchUrl(url, state, route)
    {
        // Sort handlers
        if (this.#needSort)
        {
            this.#handlers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            this.#needSort = false;
        }

        // Create the route instance
        for (let h of this.#handlers)
        {
            // If the handler has a pattern, check it matches
            if (h.pattern)
            {
                route.match = route.pathname.match(h.pattern);
                if (!route.match)
                    continue;
            }

            // Call match handler
            let result = await Promise.resolve(h.match(route));
            if (result === true || result == route)
            {
                route.handler = h;
                return route;
            }

            // External page load
            if (result === null)
                return null;
        }

        // Dummy handler
        route.handler = {};
        return route;
    }


    #handlers = [];
    #needSort = false;
    register(handlers)
    {
        if (!Array.isArray(handlers))
            handlers = [ handlers ];

        for (let handler of handlers)
        {
            // Convert string patterns to RegExp
            if (typeof(handler.pattern) === 'string')
            {
                handler.pattern = new RegExp(urlPattern(handler.pattern));
            }

            // If handler doesn't declare view state handlers
            // the use the document scroll position
            if (handler.captureViewState === undefined &&
                handler.restoreViewState === undefined)
            {
                handler.captureViewState = DocumentScrollPosition.get;
                handler.restoreViewState = DocumentScrollPosition.set;
            }

            this.#handlers.push(handler);
        }

        this.#needSort = true;
    }
}

export let router = new Router();