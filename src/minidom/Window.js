export class Window
{
    animationFrames = null;

    requestAnimationFrame(callback) 
    { 
        if (this.animationFrames == null)
            callback() 
        else
            this.animationFrames.push(callback);
    }

    blockAnimationFrames()
    {
        if (this.animationFrames === null)
            this.animationFrames = [];
    }

    dispatchAnimationFrames()
    {
        if (this.animationFrames != null)
        {
            let temp = this.animationFrames;
            this.animationFrames = [];
            temp.forEach(x => x());
        }
    }
}

