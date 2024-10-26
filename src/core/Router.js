import { DocumentScrollPosition } from "./DocumentScrollPosition.js";
import { urlPattern } from "./urlPattern.js";
import { env } from "./Environment.js";
import { nextFrame } from "./NextFrame.js";
import { whenLoaded } from "./Utils.js";

export class WebHistoryRouterDriver
{
    start(router)
    {
        this.#router = router;
    }

    #router;
    #viewStates = {};
    get current() { return this.#router.current }

    async load(url, state)
    {
        state.view = this.#viewStates[state.sequence];
        let route = await this.#router.load(url, state);

        // Load view state
        whenLoaded(env, () => {
            nextFrame(() => {
                if (route.current)
                {
                    // Call restore view state handler
                    route.handler.restoreViewState?.(route.viewState);

                    // Jump to hash
                    if (env.browser)
                    {
                        let elHash = document.getElementById(route.url.hash.substring(1));
                        if (elHash)
                            elHash.scrollIntoView();
                    }
                }
            });
        });
    }

    start()
    {
        // Reload saved view states from session storage
        let savedViewStates = window.sessionStorage.getItem("codeonly-view-states");
        if (savedViewStates)
        {
            this.#viewStates = JSON.parse(savedViewStates);
        }

        // Do initial navigation
        this.load(window.location, window.history.state ?? { sequence: 0 });
        window.history.replaceState(this.current.state, null);

        // Listen for clicks on links
        document.body.addEventListener("click", (ev) => {
            let a = ev.target.closest("a");
            if (a)
            {
                let href = a.getAttribute("href");
                let url = new URL(href, window.location);
                if (url.hostname == window.location.hostname && url.port == window.location.port)
                {
                    // Just the hash changed
                    if (url.pathname == this.current.url.pathname)
                    {
                        if (this.current?.onHashChanged?.(url.hash))
                            ev.preventDefault = true;
                        return;
                    }

                    if (this.navigate(url))
                    {
                        ev.preventDefault();
                        return true;
                    }
                }
            }
        });

        // Listen for pop state
        window.addEventListener("popstate", (event) => {

            // Store the current view state
            this.captureCurrentViewState();
            this.saveViewStatesToLocalStorage();

            // Reload
            this.load(window.location, event.state ?? { sequence: this.current.state.sequence + 1 });
        });

        window.addEventListener("beforeunload", (event) => {

            // Store the current view state
            this.captureCurrentViewState();
            this.saveViewStatesToLocalStorage();
            
        });

        // Disable browser scroll restoration
        if (window.history.scrollRestoration) {
           window.history.scrollRestoration = "manual";
        }
    }

    back()
    {
        if (this.current.state.sequence == 0)
        {
            let p = (this?.prefix ?? "") + "/";
            this.load(p, { sequence: 0 });
            window.history.replaceState(this.current.state, null, p);
        }
        else
        {
            window.history.back();
        }
    }

    replace(url)
    {
        if (typeof(url) === 'string')
            url = new URL(url);
        this.current.pathname = url.pathname;
        if (this.prefix)
            url.pathname = this.prefix + url.pathname;
        this.current.url = url;
        this.current.originalUrl = url;
        this.current.match = this.current.handler.pattern?.match(this.current.pathname);
        window.history.replaceState(this.current.state, null, url);
    }

    saveViewStatesToLocalStorage()
    {
        window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(this.#viewStates));
    }

    captureCurrentViewState()
    {
        if (this.current)
        {
            this.#viewStates[this.current.state.sequence] = this.current.handler.captureViewState();
        }
    }

    // Prefix for all url matching
    #prefix;
    get prefix()
    {
        return this.#prefix;
    }
    set prefix(value)
    {
        this.#prefix = value;
    }

    navigate(url)
    {
        if (typeof(url) === 'string')
            url = new URL(url);

        // Must match prefix
        if (this.prefix && url.pathname != this.prefix && !url.pathname.startsWith(this.prefix + "/"))
            return null;

        // Store the current view state
        this.captureCurrentViewState();

        // Clear and saved view states that can never be revisited
        for (let k of Object.keys(this.#viewStates))
        {
            if (parseInt(k) > this.current.state.sequence)
            {
                delete this.#viewStates[k];
            }
        }
        this.saveViewStatesToLocalStorage();

        // Load the route
        let route = this.load(url, { sequence: this.current.state.sequence + 1 });
        if (!route)
            return null;

        // Update history
        window.history.pushState(route.state, null, url);
        return true;
    }


}

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
        driver.start(this);
    }

    #driver;

    // The current route
    #current = null;
    get current()
    {
        return this.#current;
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

    #pending;

    // Load a URL with state
    async load(url, state)
    {
        // Match url
        let route = await this.matchUrl(url, state);
        if (!route)
            return null;

        // Store the pending route
        this.#pending = route;

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
            this.dispatchCancelEvents(route);
            throw err;
        }

        // Cancelled?
        if (this.#pending != route)
        {
            this.dispatchCancelEvents(route);
            return null;
        }

        this.#pending = null;
        return route;

    }

    dispatchCancelEvents(route)
    {
        this.#current?.handler.cancelLeave?.(this.#current, route);
        route.handler.cancelEnter?.(this.#current, route);
        this.dispatchEvent("cancel", false, this.#current, route);
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

    async matchUrl(url, state)
    {
        // Sort handlers
        if (this.#needSort)
        {
            this.#handlers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            this.#needSort = false;
        }

        // Create route
        let route = { 
            current: false,
            url, 
            pathname: url.pathname,
            state,
            originalUrl: url 
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