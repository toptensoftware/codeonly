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

    delete(key, index)
    {
        let list = this.map.get(key);
        if (list === undefined)
            throw new Error("delete key not found");
        if (Array.isArray(list))
        {
            let pos = list.indexOf(index);
            if (pos < 0)
                throw new Error("delete index not found");
            list.splice(pos, 1);
        }
        else
        {
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
