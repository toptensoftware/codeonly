let frameCallbacks = [];
export function nextFrame(fn)
{
    if (!fn)
        return;
    frameCallbacks.push(fn);
    if (frameCallbacks.length == 1)
    {
        requestAnimationFrame(dispatchFrameCallbacks);
    }
}

function dispatchFrameCallbacks()
{
    let pending = frameCallbacks;
    frameCallbacks = [];
    pending.forEach(x => x());
}
