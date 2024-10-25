import { DocumentScrollPosition } from "./DocumentScrollPosition.js";
import { urlPattern } from "./urlPattern.js";
import { env } from "./Environment.js";
import { nextFrame } from "./NextFrame.js";
import { whenLoaded } from "./Utils.js";

export class Router extends EventTarget
{
    #viewStates = {};

    start()
    {
        // Reload saved view states from session storage
        let savedViewStates = window.sessionStorage.getItem("codeonly-view-states");
        if (savedViewStates)
        {
            this.#viewStates = JSON.parse(savedViewStates);
        }

        if (window.history.state?.sequence === 0)
            delete this.#viewStates[0];

        // Do initial navigation
        this.load(window.location, window.history.state ?? { sequence: 0 });
        window.history.replaceState(this.#current.state, null);

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
                    if (url.pathname == this.#current.url.pathname)
                    {
                        if (this.#current?.onHashChanged?.(url.hash))
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
            this.load(document.location, event.state ?? { sequence: this.#current.state.sequence + 1 });
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

    saveViewStatesToLocalStorage()
    {
        window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(this.#viewStates));
    }

    captureCurrentViewState()
    {
        if (this.#current)
        {
            this.#viewStates[this.#current.state.sequence] = this.#current.handler.captureViewState();
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

    // The current route
    #current
    get current()
    {
        return this.#current;
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
            if (parseInt(k) > this.#current.state.sequence)
            {
                delete this.#viewStates[k];
            }
        }
        this.saveViewStatesToLocalStorage();

        // Load the route
        let route = this.load(url, { sequence: this.#current.state.sequence + 1 });
        if (!route)
            return null;

        // Update history
        window.history.pushState(route.state, null, url);
        return true;
    }

    replace(url)
    {
        if (typeof(url) === 'string')
            url = new URL(url);
        this.#current.pathname = url.pathname;
        if (this.prefix)
            url.pathname = this.prefix + url.pathname;
        this.#current.url = url;
        this.#current.originalUrl = url;
        this.#current.match = this.#current.handler.pattern?.match(this.#current.pathname);
        window.history.replaceState(this.#current.state, null, url);
    }

    load(url, state)
    {
        // Match url
        let route = this.matchUrl(url, state);
        if (!route)
            return null;

        // Tell old route handler that it's leaving
        if (this.#current)
        {
            this.#current.handler.leave?.(this.#current);
            this.#current.current = false;
        }

        // Switch route
        this.#current = route;
        this.#current.current = true;

        let ev = new Event("navigate");
        ev.route = route;
        this.dispatchEvent(ev);

        // Wait until environment loaded
        whenLoaded(env, () => {
            if (route.current)
            {
                let ev = new Event("navigateLoaded");
                ev.route = route;
                this.dispatchEvent(ev);

                nextFrame(() => {
                    if (route.current)
                    {
                        route.handler.restoreViewState?.(route.viewState);
                        let elHash = document.getElementById(route.url.hash.substring(1));
                        if (elHash)
                            elHash.scrollIntoView();
                    }
                });
            }
            else
            {
                let ev = new Event("navigateCancelled");
                ev.route = route;
                this.dispatchEvent(ev);
            }
        });

        // Return the route
        return route;
    }

    matchUrl(url, state)
    {
        // Sort handlers
        if (this.#needSort)
        {
            this.#handlers.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            this.#needSort = false;
        }

        // Create route
        let route = { 
            url, 
            pathname: url.pathname,
            state,
            viewState: this.#viewStates[state.sequence],
            originalUrl: url 
        }

        // Check url starts with required prefix
        if (this.prefix)
        {
            if (!pathname.startsWith(this.prefix))
                return null;
            route.pathname = pathname.substring(this.prefix.length);
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
            let result = h.match(route);
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

    back()
    {
        if (this.#current.state.sequence == 0)
        {
            let p = (this?.prefix ?? "") + "/";
            this.load(p, { sequence: 0 });
            window.history.replaceState(this.#current.state, null, p);
        }
        else
        {
            window.history.back();
        }
    }


    #handlers = [];
    #needSort = false;
    register(handler)
    {
        // Convert string patterns to RegExp
        if (typeof(handler.pattern) === 'string')
        {
            handler.pattern = urlPattern(handler.pattern);
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
        this.#needSort = true;

    }
}

export let router = new Router();