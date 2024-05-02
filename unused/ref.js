
class Watchable
{
    constructor()
    {
        this._listeners = [];
    }

    notify()
    {
        // Notify
        for (let i=this._listeners.length-1; i>=0; i--)
        {
            this._listeners[i]();
        }
    }

    watch(listener)
    {
        this._listeners.push(listener);

        let self = this;
        return function()
        {
            self._listeners.splice(self._listeners.indexOf(listener), 1);
        }
    }
}

class RefTracker extends Watchable
{
    constructor()
    {
        super();
        this.refs = new Map();
        this.cycle = 0;
    }

    static Active;

    Track(callback)
    {
        this.cycle++;
        
        let previousTracker = RefTracker.Active;
        RefTracker.Active = this;

        let retv = callback();

        for (let [k,v] of this.refs)
        {
            if (v.cycle < this.cycle)
            {
                this.refs[k].unwatch();
                this.refs.delete(k);
            }
        }

        RefTracker.Active = previousTracker;
        return retv;
    }

    registerValue(value)
    {
        let ref = this.refs.get(value);
        if (!ref)
        {
            this.refs.set(value, { 
                cycle: this.cycle,
                unwatch: value.watch(() => this.notify())
            });
        }
        else
        {
            ref.cycle = this.cycle;
        }
    }
}

class PrimitiveRef extends Watchable
{
    constructor(value)
    {
        super();
        this._value = value;
    }

    get value()
    {
        RefTracker.Active?.registerValue(this);
        return this._value;
    }

    set value(val)
    {
        // Redundant?
        if (this._value == val)
            return;

        // Store new value
        this._value = val;

        this.notify();
    }
}


function ref(value)
{
    return new PrimitiveRef(value);
}

function computed(callback)
{
    let result = ref();

    let rt = new RefTracker();
    result.value = rt.Track(callback);
    rt.watch(() => result.value = rt.Track(callback));

    return result;
}


let a = ref(23);
let b = ref(99);

let r = computed(() => a.value + b.value);
r.watch(() => console.log(`r: ${r.value}`));

console.log(`r: ${r.value}`)

a.value = 24;
