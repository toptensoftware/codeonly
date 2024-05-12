import { EventEmitter } from "./EventEmitter.js";

class Router extends EventEmitter
{
    constructor(routes)
    {
        this.routes = routes;
        window.addEventListener('hashchange', () => this.navigate());
        requestAnimationFrame(() => this.navigate());
    }


    navigate()
    {
        let url = window.location.hash.substring(1);

        let route = null;
        for (let i=0; i<this.routes.length && route == null; i++)
        {
            let r = this.routes[i];

            if (r instanceof Function)
            {
                route = r(url);
            }
            else if (r.url instanceof Function)
            {
                route = r.url(url);
            }
            else if (r.url instanceof RegExp)
            {
                let m = url.match(r.url);
                if (m)
                {
                    route = Object.assign({}, r, m.groups);
                }
            }
            else
            {
            }
        }

        if (!route)
        {
            route = {};
        }

        route.url = url;
    }
}