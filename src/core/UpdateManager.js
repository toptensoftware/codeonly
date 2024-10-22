export class UpdateManager
{
    constructor()
    {
    }

    #listenerMap = new WeakMap();

    // Add a listener for a source object
    addListener(sourceObject, handler)
    {
        if (!sourceObject)
            return;
        let listeners = this.#listenerMap.get(sourceObject);
        if (!listeners)
            listeners = this.#listenerMap.set(sourceObject, [handler]);
        else
            listeners.push(handler);
    }

    // Remove a listener for a source object
    removeListener(sourceObject, handler)
    {
        if (!sourceObject)
            return;
        let listeners = this.#listenerMap.get(sourceObject);
        if (listeners)
        {
            let index = listeners.indexOf(handler);
            if (index >= 0)
            {
                listeners.splice(index, 1);
            }
        }
    }

    // Fire a listener for a source object
    fire(sourceObject)
    {
        if (!sourceObject)
            return;
        let listeners = this.#listenerMap.get(sourceObject);
        if (listeners)
        {
            for (let i=listeners.length-1; i>=0; i--)
            {
                listeners[i].apply(null, arguments);
            }
        }
    }

}

// Default instance of update manager
export let updateManager = new UpdateManager();