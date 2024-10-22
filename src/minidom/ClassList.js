export class ClassList
{
    constructor(owner)
    {
        this.owner = owner;
    }

    add(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" ").filter(x => x.length > 0));
        classes.add(className);
        this.owner.setAttribute("class", [...classes].join(' '));
    }

    remove(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" "));
        classes.delete(className);
        this.owner.setAttribute("class", [...classes].join(' '));
    }

    has(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" "));
        return classes.has(className);
    }
}
