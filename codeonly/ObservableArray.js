class ArrayTraps
{
  constructor(arr)
  {
    this.arr = arr;
    this.listeners = [];
    this.boundTraps = {};
  }
  push()
  {
    let index = this.arr.length;
    this.arr.push(...arguments);
    this.fire(index, 0, this.arr.length - index);
  }
  pop()
  {
    let len = this.arr.length;
    this.arr.pop(...arguments);
    this.fire(this.arr.length, len - this.arr.length, 0);
  }
  shift()
  {
    let len = this.arr.length;
    this.arr.shift(...arguments);
    this.fire(0, len - this.arr.length, 0);
  }
  unshift()
  {
    let index = this.arr.length;
    this.arr.unshift(...arguments);
    this.fire(0, 0, this.arr.length - index);
  }
  splice(index, del)
  {
    this.arr.splice(...arguments);
    this.fire(index, del, arguments.length - 2);
  }
  sort()
  {
    this.arr.sort(...arguments);
    this.fire(0, this.arr.length, this.arr.length);
  }
  setAt(index, value)
  {
    this.arr[index] = value;
    this.fire(index, 1, 1);
  }
  addListener(fn)
  {
    this.listeners.push(fn);
  }
  removeListener(fn)
  {
    this.listeners.splice(listeners.indexOf(fn), 1);
  }
  fire(index, del, ins)
  {
    if (del != 0 || ins != 0)
      this.listeners.forEach(x => x(index, del, ins));
  }

  __gettrap(name)
  {
    let trap = this.boundTraps[name];
    if (trap)
      return trap;
    if (!ArrayTraps.prototype.hasOwnProperty(name))
      return null;
    trap = ArrayTraps.prototype[name].bind(this);
    this.boundTraps[name] = trap;
    return trap;
  }
}

class ArrayHandler
{
  constructor(arr)
  {
    this.traps = new ArrayTraps(arr);
  }

  ["set"](target, name, value)
  {
    if (typeof(name) === 'string')
    {
      let index = parseInt(name);
      if (!isNaN(index))
      {
          this.traps.setAt(index, value);
          return true;
      }
    }
    return Reflect.set(...arguments);
  }

  ["get"](target, name)
  {
    let trap = this.traps.__gettrap(name);
    if (trap)
      return trap;
    return Reflect.get(...arguments);
  }
}

export function ObservableArray()
{
  let arr = [];
  return new Proxy(arr, new ArrayHandler(arr));
}

