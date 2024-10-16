import { DocumentScrollPosition } from "./DocumentScrollPosition.js";
import { urlPattern } from "./urlPattern.js";

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

        // Do initial navigation
        this.load(window.location.pathname, window.history.state ?? { sequence: 0 });
        window.history.replaceState(this.#current.state, null);

        // Listen for clicks on links
        document.body.addEventListener("click", (ev) => {
            let a = ev.target.closest("a");
            if (a)
            {
                let href = a.getAttribute("href");

                if (this.navigate(href))
                {
                    ev.preventDefault();
                }
            }
        });

        // Listen for pop state
        window.addEventListener("popstate", (event) => {

            // Store the current view state
            this.captureCurrentViewState();
            this.saveViewStatesToLocalStorage();

            // Reload
            this.load(document.location.pathname, event.state);
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
        // Must be in-site link
        if (!url.startsWith("/"))
            return null;

        // Must match prefix
        if (this.prefix && url != this.prefix && !url.startsWith(this.prefix + "/"))
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
        this.#current.url = url;
        if (this.prefix)
            url = this.prefix + url;
        this.#current.originalUrl = url;
        this.#current.match = this.#current.handler.pattern?.match(this.#current.url);
        window.history.replaceState(this.#current.state, null, url);
    }

    load(url, state)
    {
        // Match url
        let route = this.matchUrl(url, state);
        if (!route)
            return null;

        // Tell old route handler that it's leaving
        this.#current?.handler.leave?.(this.#current);

        // Switch route
        this.#current = route;

        // Fire event
        let ev = new Event("navigate");
        ev.route = route;
        this.dispatchEvent(ev);

        // Restore view state
        if (route.page?.loading)
        {
            route.page.addEventListener("loaded", () => {
                if (this.#current == route)
                {
                    route.handler.restoreViewState?.(route.viewState);
                }
            }, { once :true });
        }
        else
        {
            route.handler.restoreViewState?.(route.viewState);
        }


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
            state,
            viewState: this.#viewStates[state.sequence],
            originalUrl: url 
        }

        // Check url starts with required prefix
        if (this.prefix)
        {
            if (!url.startsWith(this.prefix))
                return null;
            route.url = url.substring(this.prefix.length);
        }

        // Create the route instance
        for (let h of this.#handlers)
        {
            // If the handler has a pattern, check it matches
            if (h.pattern)
            {
                route.match = route.url.match(h.pattern);
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