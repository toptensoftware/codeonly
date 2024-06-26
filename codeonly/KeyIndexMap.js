export class KeyIndexMap
{
    constructor()
    {
        this.map = new Map();
    }

    add(key, index)
    {
        let list = this.map.get(key);
        if (list === undefined)
        {
            this.map.set(key, index);
        }
        else if (Array.isArray(list))
        {
            list.push(index);
        }
        else
        {
            this.map.set(key, [list, index]);
        }
    }

    try_delete(key, selector, cont)
    {
        let list = this.map.get(key);
        if (list === undefined)
            return false;
        if (Array.isArray(list))
        {
            let pos = list.findIndex(selector);
            if (pos < 0)
                return false;
            if (cont && !cont())
                return false;
            list.splice(pos, 1);
            return true;
        }
        else
        {
            if (!selector(list))
                return false;
            if (cont && !cont())
                return false;
            this.map.delete(key);
            return true;
        }
    }

    delete(key, selector)
    {
        let list = this.map.get(key);
        if (list === undefined)
            throw new Error("delete key not found");
        if (Array.isArray(list))
        {
            let pos = list.findIndex(selector);
            if (pos < 0)
                throw new Error("delete index not found");
            list.splice(pos, 1);
        }
        else
        {
            if (!selector(list))
                throw new Error("delete index not found");
            this.map.delete(key);
        }
    }

    get(key)
    {
        let list = this.map.get(key);
        if (Array.isArray(list))
            return list[0];
        else
            return list;
    }
}
