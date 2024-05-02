let dependencies = new WeakMap();

// Register a dependency
function registerDependency(obj, key, listener)
{
    // Get the dep map for this object
    let depMap = dependencies.get(obj);
    if (depMap === undefined)
    {
        depMap = new Map();
        dependencies.set(obj, depMap);
    }

    // Get the dep list for this key
    let depList = depMap.get(key);
    if (depList === undefined)
    {
        depList = [];
        depMap.set(key, depList);
    }

    // Add to list
    depList.push(listener);

    // Return a function to revoke the dependency
    return function()
    {
        let index = depList.indexOf(listener);
        if (index >= 0)
            depList.splice(index, 1);
        if (depList.length == 0)
            depMap.delete(key);
    }
}

// Fire a dependency
function fireDependency(obj, key)
{
    // Get the dep map for this object
    let depMap = dependencies.get(obj);
    if (depMap === undefined)
        return;

    // Get the dep list for this key
    let depList = depMap.get(key);
    if (depList === undefined)
        return;

    // Notify all dependants
    for (let i = depList.length-1; i>=0; i--)
    {
        depList[i]();
    }
}

let trackDependency;

class PrimitiveRef
{
    constructor(value)
    {
        this._value = value;
    }

    get value()
    {
        trackDependency?.(this, "value");
        return this._value;
    }

    set value(val)
    {
        // Redundant?
        if (this._value == val)
            return;

        // Store new value
        this._value = val;

        fireDependency(this, "value");
    }
}

let pendingUpdates = [];

function registerPendingUpdate(callback)
{
    pendingUpdates.push(callback);
}

function flushPendingUpdates()
{
    let save = pendingUpdates;
    pendingUpdates = [];
    for (let i=0; i<save.length; i++)
    {
        save[i]();
    }
}

function ref(value)
{
    return new PrimitiveRef(value);
}


function watchCore(callback, notify)
{
    let depObjs = new Map();
    let currentCycle = 0;
    let dirty = false;
    let result;

    function process()
    {
        currentCycle++;

        // Setup dependency tracking
        let saveTrackDep = trackDependency;
        trackDependency = function(obj, key)
        {
            let depKeys = depObjs.get(obj);
            if (!depKeys)
            {
                depKeys = new Map();
                depObjs.set(obj, depKeys);
            }

            let depKey = depKeys.get(key);
            if (!depKey)
            {
                depKey = {
                    cycle: currentCycle,
                    unwatch: registerDependency(obj, key, dependencyChanged),
                };
                depKeys.set(key, depKey);
            }
            else
            {
                depKey.cycle = currentCycle;
            }
        }

        // Invoke the callback
        result = callback();
        dirty = false;

        // Revert dependency tracking
        trackDependency = saveTrackDep;

        // Remove listeners for any dependencies no longer active
        for (let [obj,depKeys] of depObjs)
        {
            for (let [depKey, dep] of depKeys)
            {
                if (dep.cycle != currentCycle)
                {
                    dep.unwatch();
                    depKeys.delete(depKey);
                }
            }
            if (depKeys.size == 0)
                depObjs.delete(obj);
        }
    }

    process();

    function dependencyChanged()
    {
        if (!dirty)
        {
            registerPendingUpdate(process);
        }
        dirty = true;
        notify?.();
    }

    function unwatch()
    {
        for (let [obj,depKeys] of depObjs)
        {
            for (let [depKey, dep] of depKeys)
            {
                dep.unwatch();
            }
        }
        depObjs.clear();
    }

    return {
        unwatch,
        get dirty() 
        { 
            return dirty 
        },
        get result()
        {  
            if (dirty)
                process();
            return result;
        },
    }
}

function watch(callback, notify)
{
    return watchCore(callback, notify).unwatch;
}


class ComputedValue
{
    constructor(callback)
    {
        this.watch = watchCore(callback, () => {
            fireDependency(this, "value");
        });
    }

    get value()
    {
        trackDependency?.(this, "value");
        return this.watch.result;
    }

    unwatch()
    {
        this.watch.unwatch();
    }
}

function computed(callback)
{
    return new ComputedValue(callback);
}


let a = ref(10);
let b = ref(20);
let c = ref(true);

watch(() => a.value, () => console.log("A changed"));

let comp = computed(() => c.value ? a.value : b.value);

watch(() => console.log("computed:", comp.value));


a.value = 5;
b.value = 25;
c.value = false;
flushPendingUpdates();

c.value = true;
flushPendingUpdates();

comp.unwatch();
