class WatchHandler
{
    constructor()
    {
        this._listeners = [];
        this.watch = this.watch.bind(this);
    }

    ["set"](target, name, value)
    {
        if (typeof(name) === 'string' && name[0] != '_')
        {
            for (let i=this._listeners.length-1; i>=0; i--)
            {
                let li = this._listeners[i];
                if (li.keys && !li.keys.has(name))
                    continue;
                li.listener(name);
            }
        }
        return Reflect.set(...arguments);
    }

    ["get"](target, name, value)
    {
        if (name === 'watch')
        {
            return this.watch;
        }
        return Reflect.set(...arguments);
    }

    watch(listener, ...keys)
    {  
        // Create listener info
        let li = {
            listener,
        };
        if (keys.length)
            li.keys = new Set(keys);

        // Add to list of listeners
        this._listeners.push(li);
        
        // Return a function to unwatch
        return function() {
            let index = this._listeners.indexOf(li);
            if (index >= 0)
                this._listeners.splice(index, 1);
        }.bind(this);
    }

}

class WatchProxy
{
    constructor(target)
    {
        return new Proxy(target, new WatchHandler(...arguments));
    }
}


class MyObject
{
    constructor()
    {
        return new WatchProxy(this);
    }
}

let obj = new MyObject();
let unwatch = obj.watch((x) => console.log(`modified ${x}`), 'foo');

obj.foo = 99;
obj.bar = 23;

unwatch();

obj.foo = 45;
