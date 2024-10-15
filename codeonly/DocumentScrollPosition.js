
export class DocumentScrollPosition
{
    static get()
    {
        return { 
            top: document.documentElement.scrollTop,
            left: document.documentElement.scrollLeft,
        }
    }
    static set(value)
    {
        document.documentElement.scrollTop = value.top; 
        document.documentElement.scrollLeft = value.left;
    }
}