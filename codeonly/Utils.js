// Convert a camelCaseName to a dashed-name
export function camel_to_dash(name)
{
    return name.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);
}

// Check if a function is a constructor
export function is_constructor(x) 
{ 
    return x instanceof Function && !!x.prototype && !!x.prototype.constructor; 
}