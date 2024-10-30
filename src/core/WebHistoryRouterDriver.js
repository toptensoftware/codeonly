import { env } from "./Environment.js";

export class WebHistoryRouterDriver
{
    async start(router)
    {
        this.#router = router;

        // Listen for clicks on links
        env.document.body.addEventListener("click", (ev) => {
            if (ev.defaultPrevented)
                return;
            let a = ev.target.closest("a");
            if (a)
            {
                let href = a.getAttribute("href");
                let url = new URL(href, env.window.location);
                if (url.origin == env.window.location.origin)
                {
                    try
                    {
                        url = this.#router.internalize(url);
                    }
                    catch
                    {
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
        env.window.addEventListener("popstate", async (event) => {

            if (this.#ignoreNextPop)
            {
                this.#ignoreNextPop = false;
                return;
            }

            // Load
            let loadId = this.#loadId + 1;
            let url = this.#router.internalize(env.window.location);
            let state = event.state ?? { sequence: this.current.state.sequence + 1 };
            if (!await this.load(url, state, { navMode: "pop" }))
            {
                // Load was cancelled, adjust web history position
                // but only if there hasn't been another load/navigation
                // since
                if (loadId == this.#loadId)
                {
                    this.#ignoreNextPop = true;
                    env.window.history.go(this.current.state.sequence - state.sequence);
                }
            }
        });


        // Do initial navigation
        let url = this.#router.internalize(env.window.location);
        let state = env.window.history.state ?? { sequence: 0 };
        let route = await this.load(url, state, { navMode: "start" });
        env.window.history.replaceState(state, null);
        return route;
    }


    #loadId = 0;
    #router;
    #ignoreNextPop = false;
    get current() { return this.#router.current }

    async load(url, state, route)
    {
        this.#loadId++;
        return await this.#router.load(url, state, route);
    }

    back()
    {
        if (this.current.state.sequence == 0)
        {
            this.replace("/");
            this.load("/", { sequence: 0 }, { navMode: "replace" });
        }
        else
        {
            env.window.history.back();
        }
    }

    replace(url)
    {
        if (typeof(url) === 'string')
            url = new URL(url, this.#router.internalize(env.window.location));

        this.current.pathname = url.pathname;
        this.current.url = url;
        env.window.history.replaceState(
            this.current.state, 
            "", 
            this.#router.externalize(url),
            );
    }

    async navigate(url)
    {
        // Convert to URL
        if (typeof(url) === 'string')
        {
            url = new URL(url, this.#router.internalize(env.window.location));
        }

        // Load the route
        let route = await this.load(url, 
            { sequence: this.current.state.sequence + 1 }, 
            { navMode: "push" }
            );
        if (!route)
            return route;

        // Update history
        env.window.history.pushState(
            route.state, 
            "", 
            this.#router.externalize(url)
        );
        return route;
    }
}
