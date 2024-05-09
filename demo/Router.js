class RouteManager
{
    constructor()
    {
        window.addEventListener('hashchange', () => this.navigate());
        this.routes = [];
        this.listeners = [];
        requestAnimationFrame(() => this.navigate());
    }

    navigate()
    {
        let url = window.location.hash.substring(1);
        let routeIndex = this.routes.findIndex(x => x.url == url);
        if (routeIndex >= 0)
        {
            this.notify(this.routes[routeIndex]);
        }
        else
        {
            this.notify(null);
        }
    }

    notify(route)
    {
        for (let i=this.listeners.length-1; i>=0; i--)
        {
            this.listeners[i](route);
        }
    }

    addListener(handler)
    {
        this.listeners.push(handler);
    }

    registerRoute(url, name, componentClass)
    {
        // Store route
        let route = {
            url, 
            name,
            componentClass,
        };

        this.routes.push(route);
    }
}

export let Router = new RouteManager();