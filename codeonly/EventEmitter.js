export class EventEmitter
{
    #eventMap;
    constructor()
    {
        this.#eventMap = new Map();
    }

    #addEventListener(event, handler, once)
    {
        let listeners = this.#eventMap.get(event);
        if (!listeners)
        {
            listeners = [];
            this.#eventMap.set(event, listeners);
        }
        listeners.push({ handler, once });
    }

    once(event, handler)
    {
        this.#addEventListener(event, handler, true);
    }

    addEventListener(event, handler)
    {
        this.#addEventListener(event, handler, false);
    }

    removeEventListener(event, handler)
    {
        let listeners = this.#eventMap.get(event);
        if (!listeners)
            return;

        let index = listeners.findIndex(x => x.handler == handler);
        if (index < 0)
            return;

        listeners.splice(index, 1);
    }

    emit(event, ...rest)
    {
        let listeners = this.#eventMap.get(event);
        if (!listeners)
            return;

        for (let i=listeners.length-1; i>=0; i--)
        {
            listeners[i].handler(...rest);
            if (listeners[i].once)
            {
                listeners.splice(i, 1);
            }
        }
    }
}

EventEmitter.prototype.on = EventEmitter.prototype.addEventListener;
EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener;