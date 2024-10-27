export class UrlMapper
{
    constructor(options)
    {
        this.options = options;
        if (this.options.base && 
            (!this.options.base.startsWith("/") ||
             !this.options.base.endsWith("/")))
        {
            throw new Error(`UrlMapper base '${this.options.base}' must start and end with '/'`);
        }
    }

    internalize(url)
    {
        if (this.options.base)
        {
            if (!url.pathname.startsWith(this.options.base))
                throw new Error(`Can't internalize url '${url}'`);
            
            url = new URL(url);
            url.pathname = url.pathname.substring(this.options.base.length-1);
        }

        if (this.options.hash)
        {
            let hash = url.hash.substring(1);
            if (!hash.startsWith("/"))
                hash = "/" + hash;
            url = new URL(`${url.origin}${hash}`);
        }

        return url;
    }

    externalize(url)
    {
        if (this.options.hash)
        {
            url = new URL(`${url.origin}/#${url.pathname}${url.search}${url.hash}`);
        }

        if (this.options.base)
        {
            url = new URL(url);
            url.pathname = this.options.base.slice(0, -1) + url.pathname;
        }
        return url;
    }
}