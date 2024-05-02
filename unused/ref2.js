class Watchable
{
    constructor()
    {
        this._listeners = [];
    }

    watch(callback)
    {
        // Add weak ref to listeners collection
        this._listeners.push(new WeakRef(callback));

        // Return function to remove listener
        let self = this;
        return function()
        {
            for (let i=0; i<self._listeners.length; i++)
            {
                let cb = self._listeners[i].deref();
                if (cb === undefined || cb == callback)
                {
                    self._listeners.splice(i, 1);
                    return;
                }
            }
        }
    }

    notify()
    {
        // Notify all listeners
        for (let i=this._listeners.length-1; i>=0; i--)
        {
            let cb = this._listeners[i].deref();
            if (cb === undefined)
            {
                this._listeners.splice(i, 1);
            }
            cb();
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
    static DirtyList;

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
                unwatch: value.watch(() => this.depsChanged())
            });
        }
        else
        {
            ref.cycle = this.cycle;
        }
    }

    depsChanged()
    {
        if (!this.dirty)
        {
            // Mark as dirty
            this.dirty = true;

            // Add to the dirty list
            if (!RefTracker.DirtyList)
                RefTracker.DirtyList = [this];
            else
                RefTracker.DirtyList.push(this);

            // Notify all our listeners
            this.notify();
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

function watch(callback)
{
    let rt = new RefTracker();
    rt.Track(callback);
    return rt.watch(() => rt.Track(callback));
}

function computed(callback)
{
    let result = ref();
    watch(() => result.value = callback());
    return result;
}

let a = ref(10);
let b = ref(20);

let fnStop = watch(() => console.log(`${a.value} + ${b.value} = ${a.value + b.value}`));
a.value = 99;

let r = computed(() => a.value + b.value);
console.log(r.value);
r.watch(() => console.log(`r is now ${r.value}`));

b.value = 1000;

