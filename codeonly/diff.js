/*
Based on this:
    https://github.com/kpdecker/jsdiff/blob/master/src/diff/base.js

But modified for working directly with arrays, no timeout, no max edit length

*/


// callback(op, index, count) where op = "insert" or "delete"
function diff_core(oldArray, newArray, callback, compareEqual)
{
    let newLen = newArray.length, oldLen = oldArray.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;

    let bestPath = [{ oldPos: -1, lastComponent: undefined }];

    // Seed editLength = 0, i.e. the content starts with the same values
    let newPos = extractCommon(bestPath[0], newArray, oldArray, 0);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen)
    {
        // Identity per the equality and tokenizer
        buildOps(bestPath[0].lastComponent);
        return true;
    }

    // Once we hit the right edge of the edit graph on some diagonal k, we can
    // definitely reach the end of the edit graph in no more than k edits, so
    // there's no point in considering any moves to diagonal k+1 any more (from
    // which we're guaranteed to need at least k+1 more edits).
    // Similarly, once we've reached the bottom of the edit graph, there's no
    // point considering moves to lower diagonals.
    // We record this fact by setting minDiagonalToConsider and
    // maxDiagonalToConsider to some finite value once we've hit the edge of
    // the edit graph.
    // This optimization is not faithful to the original algorithm presented in
    // Myers's paper, which instead pointlessly extends D-paths off the end of
    // the edit graph - see page 7 of Myers's paper which notes this point
    // explicitly and illustrates it with a diagram. This has major performance
    // implications for some common scenarios. For instance, to compute a diff
    // where the new text simply appends d characters on the end of the
    // original text of length n, the true Myers algorithm will take O(n+d^2)
    // time while this optimization needs only O(n+d) time.
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;

    // Main worker method. checks all permutations of a given edit length for acceptance.
    function execEditLength()
    {
        for (
            let diagonalPath = Math.max(minDiagonalToConsider, -editLength);
            diagonalPath <= Math.min(maxDiagonalToConsider, editLength);
            diagonalPath += 2
        )
        {
            let basePath;
            let removePath = bestPath[diagonalPath - 1],
                addPath = bestPath[diagonalPath + 1];
            if (removePath)
            {
                // No one else is going to attempt to use this value, clear it
                bestPath[diagonalPath - 1] = undefined;
            }

            let canAdd = false;
            if (addPath)
            {
                // what newPos will be after we do an insertion:
                const addPathNewPos = addPath.oldPos - diagonalPath;
                canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
            }

            let canRemove = removePath && removePath.oldPos + 1 < oldLen;
            if (!canAdd && !canRemove)
            {
                // If this path is a terminal then prune
                bestPath[diagonalPath] = undefined;
                continue;
            }

            // Select the diagonal that we want to branch from. We select the prior
            // path whose position in the old string is the farthest from the origin
            // and does not pass the bounds of the diff graph
            if (!canRemove || (canAdd && removePath.oldPos < addPath.oldPos))
            {
                basePath = addToPath(addPath, "insert", 0);
            } else
            {
                basePath = addToPath(removePath, "delete", 1);
            }

            newPos = extractCommon(basePath, newArray, oldArray, diagonalPath);

            if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen)
            {
                // If we have hit the end of both strings, then we are done
                buildOps(basePath.lastComponent);
                return true;
            } else
            {
                bestPath[diagonalPath] = basePath;
                if (basePath.oldPos + 1 >= oldLen)
                {
                    maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
                }
                if (newPos + 1 >= newLen)
                {
                    minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
                }
            }
        }

        editLength++;
    }

    // Performs the length of edit iteration. Is a bit fugly as this has to support the
    // sync and async mode which is never fun. Loops over execEditLength until a value
    // is produced, or until the edit length exceeds options.maxEditLength (if given),
    // in which case it will return undefined.
    while (editLength <= maxEditLength)
    {
        let ret = execEditLength();
        if (ret)
        {
            return ret;
        }
    }


    function extractCommon(basePath, newArray, oldArray, diagonalPath)
    {
        let newLen = newArray.length,
            oldLen = oldArray.length,
            oldPos = basePath.oldPos,
            newPos = oldPos - diagonalPath,
            commonCount = 0;
            
        while (newPos + 1 < newLen && oldPos + 1 < oldLen && compareEqual(oldArray[oldPos + 1], newArray[newPos + 1]))
        {
            newPos++;
            oldPos++;
            commonCount++;
        }

        if (commonCount)
        {
            basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, op: "keep"};
        }

        basePath.oldPos = oldPos;
        return newPos;
    }

    function addToPath(path, op, oldPosInc)
    {
        let last = path.lastComponent;
        if (last && last.op === op)
        {
            return {
                oldPos: path.oldPos + oldPosInc,
                lastComponent: { count: last.count + 1, op, previousComponent: last.previousComponent }
            };
        } else
        {
            return {
                oldPos: path.oldPos + oldPosInc,
                lastComponent: { count: 1, op, previousComponent: last }
            };
        }
    }

    function buildOps(lastComponent)
    {
        // First we convert our linked list of components in reverse order to an
        // array in the right order:
        const components = [];
        let nextComponent;
        while (lastComponent)
        {
            components.unshift(lastComponent);
            nextComponent = lastComponent.previousComponent;
            delete lastComponent.previousComponent;
            lastComponent = nextComponent;
        }

        let componentPos = 0,
            componentLen = components.length,
            newPos = 0,
            oldPos = 0;

        for (; componentPos < componentLen; componentPos++)
        {
            let component = components[componentPos];
            if (component.op != "delete")
            {
                component.index = newPos;
                //component.value = newArray.slice(newPos, newPos + component.count);
                newPos += component.count;

                // Common case
                if (component.op != "insert")
                {
                    oldPos += component.count;
                }
                else
                {
                    callback("insert", component.index, component.count);
                }
            } else
            {
                component.index = newPos;
                //component.value = oldArray.slice(oldPos, oldPos + component.count);
                oldPos += component.count;
                callback("delete", newPos, component.count);
            }
        }

        return components;
    }

}

export function diff(oldArray, newArray, callback, compareEqual)
{
    if (!compareEqual)
        compareEqual = function(a,b) { return a == b; }

    let minLength = Math.min(oldArray.length, newArray.length);
    let maxLength = Math.max(oldArray.length, newArray.length);

    // Work out how many matching keys at the start
    let trimStart = 0;
    while (trimStart < minLength && 
        compareEqual(oldArray[trimStart], newArray[trimStart]))
    {
        trimStart++;
    }

    // Already exact match
    if (trimStart == maxLength)
        return;

    // Simple Append?
    if (trimStart == oldArray.length)
    {
        callback('insert', oldArray.length, newArray.length - oldArray.length);
        return;
    }

    // Work out how many matching keys at the end
    let trimEnd = 0;
    while (trimEnd < (minLength - trimStart) && 
        compareEqual(oldArray[oldArray.length - trimEnd - 1], newArray[newArray.length - trimEnd - 1]))
    {
        trimEnd++;
    }

    // Simple prepend
    if (trimEnd == oldArray.length)
    {
        callback('insert', 0, newArray.length - oldArray.length);
        return;
    }

    // Simple insert?
    if (trimStart + trimEnd == oldArray.length)
    {
        callback('insert', trimStart, newArray.length - oldArray.length);
        return;
    }

    // Simple delete?
    if (trimStart + trimEnd == newArray.length)
    {
        callback('delete', trimStart, oldArray.length - newArray.length);
        return;
    }

    console.log("-- using diff_core --");
    // Untrimmed?
    if (trimStart == 0 && trimEnd == 0)
    {
        return diff_core(oldArray, newArray, callback, compareEqual);
    }

    // Trimmed diff
    return diff_core(
        oldArray.slice(trimStart, -trimEnd),
        newArray.slice(trimStart, -trimEnd),
        (op, index, count) => callback(op, index + trimStart, count),
        compareEqual
        );
    
}


