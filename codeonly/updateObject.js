import { deepEqual } from "./deepEqual.js";

// Assign all the properties of source to target
export function updateObject(target, source)
{
    // Delete target object properties
    for (let p of Object.getOwnPropertyNames(target))
    {
        delete target[p];
    }
    
    // Assign source object properties
    Object.assign(target, source);
}

// Compare if two sets are equal
function areSetsEqual(a, b) 
{
    if (a === b) return true;
    if (a.size !== b.size) return false;
    for (const value of a) if (!b.has(value)) return false;
    return true;
}

// Assign all the properties of source to target
export function patchObject(target, source)
{
    // Get source and target object properties
    let targetProps = Object.getOwnPropertyNames(target);
    let sourceProps = Object.getOwnPropertyNames(source);

    // Work out if different
    let different = false;
    if (!areSetsEqual(new Set(targetProps), new Set(sourceProps)))
    {
        different = true;
    }
    else
    {
        for (let i=0; i<targetProps.length; i++)
        {
            let prop = targetProps[i];
            if (!deepEqual(source[prop], target[prop]))
            {
                different = true;
                break;
            }
        }
    }
    
    // Delete target object properties
    for (let p of targetProps)
    {
        delete target[p];
    }

    // Assign source object properties
    Object.assign(target, source);

    return different;
}