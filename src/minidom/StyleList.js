
let StyleListProxy = {
    get: function(object, key)
    {
        let val = Reflect.get(...arguments);
        if (val === undefined)
            val = object.getProperty(key);
        return val;
    },
    set: function(object, key, value)
    {
        if (!object.hasOwnProperty(key))
        {
            return object.setProperty(key, value);
        }

        return Reflect.set(...arguments);
    }
}

export class StyleList
{
    constructor(owner)
    {
        this.owner = owner;
        return new Proxy(this, StyleListProxy);
    }

    getList()
    {
        let parts = (this.owner.getAttribute("style") ?? "").split(";").map(x => x.trim()).filter(x => x.length > 0);

        return parts.map(x => {
            let keyval = x.split(":");
            return {
                key: keyval[0].trim(),
                value: keyval[1].trim(),
            }
        });
    }

    setList(list)
    {
        this.owner.setAttribute("style", list.map(x => `${x.key}: ${x.value}`).join("; "));
    }

    getProperty(key)
    {
        let list = this.getList();
        let index = list.findIndex(x => x.key == key);
        if (index < 0)
            return undefined;
        return list[index].value;
    }

    setProperty(key, value)
    {
        let list = this.getList();
        let index = list.findIndex(x => x.key == key);
        if (index < 0)
            list.push({ key, value });
        else
            list[index].value = value;
        this.setList(list);
        return true;
    }

    removeProperty(key)
    {
        this.setList(this.getList().filter(x => x.key != key));
    }
}

