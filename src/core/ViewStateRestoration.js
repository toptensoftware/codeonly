import { env } from "./Environment.js";
import { whenLoaded } from "./Utils.js";
import { nextFrame } from "./NextFrame.js";

export class ViewStateRestoration
{
    constructor(router)
    {
        this.#router = router;

        // Disable browser scroll restoration
        if (env.window.history.scrollRestoration) {
           env.window.history.scrollRestoration = "manual";
        }

        // Reload saved view states from session storage
        let savedViewStates = env.window.sessionStorage.getItem("codeonly-view-states");
        if (savedViewStates)
        {
            this.#viewStates = JSON.parse(savedViewStates);
        }

        router.addEventListener("mayLeave", (from, to) => {
            this.captureViewState();
            return true;
        });

        router.addEventListener("mayEnter", (from, to) => {
            to.viewState = this.#viewStates[to.state.sequence];
        });

        router.addEventListener("didEnter", (from, to) => {

            if (to.navMode == "push")
            {
                // Clear any saved view states that can never be revisited
                for (let k of Object.keys(this.#viewStates))
                {
                    if (parseInt(k) > this.current.state.sequence)
                    {
                        delete this.#viewStates[k];
                    }
                }
                this.saveViewStatesToLocalStorage();
            };

            // Load view state
            whenLoaded(env, () => {
                nextFrame(() => {

                    // Restore view state
                    if (to.handler.restoreViewState)
                        to.handler.restoreViewState(to.viewState, to);
                    else
                        this.#router.restoreViewState?.(to.viewState, to);

                    // Jump to hash
                    if (env.browser)
                    {
                        let elHash = document.getElementById(route.url.hash.substring(1));
                        elHash?.scrollIntoView();
                    }
                });
            });
        });

        env.window.addEventListener("beforeunload", (event) => {
            this.captureCurrentViewState();
        });

    }

    #router;
    #viewStates = {};

    captureViewState()
    {
        let route = this.#router.current;
        if (route)
        {
            if (route.handler.captureViewState)
                this.#viewStates[route.state.sequence] = route.handler.captureViewState(route);
            else
                this.#viewStates[route.state.sequence] = this.#router.captureViewState?.(route);
        }
        this.saveViewStates();
    }
    saveViewStates()
    {
        env.window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(this.#viewStates));
    }
}