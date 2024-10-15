
export class DocumentScrollPosition
{
    static get()
    {
        return { 
            top: window.pageYOffset || document.documentElement.scrollTop,
            left: window.pageXOffset || document.documentElement.scrollLeft,
        }
    }
    static set(value)
    {
        if (!value)
            return;
        window.scrollTo(value.left, value.top);
    }
}