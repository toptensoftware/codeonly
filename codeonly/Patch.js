import { diff } from "./diff.js";
import { areSetsEqual, deepEqual } from "./Utils.js";


export class Patch
{
    // Patch an array
    static array(target, source, compare_key, patch_item)
    {
        let ops = diff(target, source, compare_key);

        if (patch_item)
        {
            let isObservableTarget = target.isObservable;

            // Deep
            let pos = 0;
            for (let i=0; i < ops.length; i++)
            {
                let op = ops[i];
                if (op.index > pos)
                {
                    do_deep_compare(pos, op.index);
                }
                if (op.op == "insert")
                {
                    target.splice(op.index, 0, ...source.slice(op.index, op.index + op.count));
                }
                else if (op.op == "delete")
                {
                    target.splice(op.index, op.count);
                }
                pos = op.index + op.count;
            }

            do_deep_compare(pos, source.length);

            function do_deep_compare(from, to)
            {
                for (let i=from; i<to; i++)
                {
                    let patch = patch_item(target[i], source[i], i);
                    if (patch === false)
                        continue;
                    if (patch === true)
                    {
                        if (isObservableTarget)
                            target.touch(i);
                        else
                            target.splice(i, 1, source[i]);
                        continue;
                    }
                    target.splice(i, 1, patch);
                }
            }
        }
        else
        {
            // Shallow
            for (let i=0; i < ops.length; i++)
            {
                let op = ops[i];
                if (op.op == "insert")
                {
                    target.splice(op.index, 0, ...source.slice(op.index, op.index + op.count));
                }
                else if (op.op == "delete")
                {
                    target.splice(op.index, op.count);
                }
            }
        }
    }

    static replaceInArray(array, predicate, value)
    {
      let index = array.findIndex(predicate);
      if (index >= 0)
      {
        array.splice(index, value);
        return index;
      }
      return -1;
    }

    static updateInArray(array, predicate, value)
    {
      let index = array.findIndex(predicate);
      if (index >= 0)
      {
        this.update_always(array, value);
        return index;
      }
      return -1;
    }
  
  

    // Assign all the properties of source to target
    static update_different(target, source)
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

    static replace_different(target, source)
    {
        if (!deepEqual(target, source))
            return source;
        return false;
    }

    static update_always(target, source)
    {
        // Delete target object properties
        for (let p of Object.getOwnPropertyNames(target))
        {
            delete target[p];
        }
        
        // Assign source object properties
        Object.assign(target, source);

        return true;
    }

    static replace_always(target, source)
    {
        return source;
    }
}