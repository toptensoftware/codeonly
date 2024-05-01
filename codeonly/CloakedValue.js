export class CloakedValue
{
    constructor(value)
    {
        this.value = value;
    }
}

export function cloak(value)
{
    return new CloakedValue(value);
}
