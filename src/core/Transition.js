import { Html } from "./Html.js";

export class Transition
{
    constructor(el, targetClass)
    {
        this.el = el;
        this.targetClass = targetClass;
        this.entered = false;
        this.pendingTransitions = [];
        this.detecting = false;
        this.transitioning = false;
        this.el.addEventListener('transitionend',this.onTransitionEndOrCancel.bind(this));
        this.el.addEventListener('transitioncancel',this.onTransitionEndOrCancel.bind(this));
        this.el.addEventListener('transitionrun', this.onTransitionRun.bind(this));
    }

    onTransitionEndOrCancel(ev)
    {
        let didRemove = false;
        for (let i=0; i<this.pendingTransitions.length; i++)
        {
            let e = this.pendingTransitions[i];
            if (e.target == ev.target && e.propertyName == ev.propertyName)
            {
                this.pendingTransitions.splice(i, 1);
                didRemove = true;
            }
        }

        if (didRemove && this.pendingTransitions.length == 0)
        {
            this.onTransitionsFinished();
        }
    }

    onTransitionRun(ev)
    {
        if (this.detecting)
        {
            this.pendingTransitions.push({
                target: ev.target,
                propertyName: ev.propertyName,
            });
        }
    }

    detectTransitions()
    {
        this.transitioning = true;
        this.detecting = true;
        this.pendingTransitions = [];

        // It takes three animation frames before transitionrun event is fired
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {

            this.detecting = false;
            if (this.pendingTransitions.length == 0)
            {
                this.onTransitionsFinished();
            }

        })));
    }

    onTransitionsFinished()
    {
        // Remove transitioning classes
        this.el.classList.remove(`${this.targetClass}-start-enter`);
        this.el.classList.remove(`${this.targetClass}-start-leave`);
        this.el.classList.remove(`${this.targetClass}-enter`);
        this.el.classList.remove(`${this.targetClass}-leave`);

        // Add or remove the final class
        if (this.entered)
        {
            this.el.classList.add(this.targetClass);
        }
        else
        {
            this.el.classList.remove(this.targetClass);
        }

        this.transitioning = false;
    }   

    enter(immediate)
    {
        if (immediate)
        {
            if (this.transitioning || !this.entered)
            {
                this.entered = true;
                this.onTransitionsFinished();
            }
            return;
        }

        if (this.entered)
            return;

        // Add target class and entry class
        this.entered = true;
        this.detectTransitions();
        this.el.classList.add(this.targetClass, `${this.targetClass}-enter`, `${this.targetClass}-start-enter`);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.el.classList.remove(`${this.targetClass}-start-enter`);
        }));
    }

    leave(immediate)
    {
        if (immediate)
        {
            if (this.transitioning || this.entered)
            {
                this.entered = false;
                this.onTransitionsFinished();
            }
            return;
        }

        if (!this.entered)
            return;

        this.entered = false;
        this.detectTransitions();
        this.el.classList.add(`${this.targetClass}-leave`, `${this.targetClass}-start-leave`);
        requestAnimationFrame(() => requestAnimationFrame(() => { 
            this.el.classList.remove(`${this.targetClass}-start-leave`);
        }));
    }

    toggle(immediate)
    {
        if (this.entered)
            this.leave();
        else
            this.enter();
    }
}