/*

class ArrayTraps
{
	constructor(arr)
	{
		this.arr = arr;
		this.listeners = [];
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
		// Make sure fired range is valid
		if (index < 0)
			index += this.arr.length;
		if (index >= this.arr.length)
		{
			del = 0;
			index = this.arr.length;
		}
		if (del === undefined)
			del = this.arr.length - index;
		if (del < 0)
			del = 0;

		let result = this.arr.splice(...arguments);
		this.fire(index, del, arguments.length > 2 ? arguments.length - 2 : 0);
		return result;
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
		let index = this.listeners.indexOf(fn);
		if (index >= 0)
			this.listeners.splice(index, 1);
	}
	fire(index, del, ins)
	{
		if (del != 0 || ins != 0)
			this.listeners.forEach(x => x(index, del, ins));
	}
	touch(index)
	{
		if (index >= 0 && index < this.arr.length)
			this.listeners.forEach(x => x(index, 0, 0));
	}
	__gettrap(name)
	{
		if (!ArrayTraps.prototype.hasOwnProperty(name))
			return false;

		let fn = this[name];
		if (typeof(fn) !== 'function')
			return false;

		if (fn.name == name)
			this[name] = fn.bind(this);

		return this[name];
	}


	["set"](target, name, value)
	{
		if (typeof (name) === 'string')
		{
			let index = parseInt(name);
			if (!isNaN(index))
			{
				this.setAt(index, value);
				return true;
			}
		}
		return Reflect.set(...arguments);
	}

	["get"](target, name)
	{
		if (name == "underlying")
			return this.arr;
		if (name == "isObservable")
			return true;
		let trap = this.__gettrap(name);
		if (trap)
			return trap;
		return Reflect.get(...arguments);
	}
}

export function ObservableArray()
{
  let arr = [...arguments];
  return new Proxy(arr, new ArrayTraps(arr));
}

ObservableArray.from = function(other)
{
	return new ObservableArray(...Array.from(other));
}
*/

// This is a much cleaner implementation but doesn't
// support notification of modification by [] indexer
//
// ie: `arr[index] = value` won't fire an event
//
// Given the performance overhead (x70+) and ugliness of 
// using proxies, this seems like a worthwhile compromise.
//
// Workaround, use either:
// 
// * `arr.setAt(index, value`
// * `arr.splice(index, 1, value)`

export class ObservableArray extends Array
{
	constructor()
	{
		super(...arguments);
	}
	#listeners = [];

	static from()
	{
		return new ObservableArray(...arguments);
	}

	addListener(listener)
	{
		this.#listeners.push(listener);
	}

	removeListener(listeners)
	{
		let index = this.#listeners.indexOf(fn);
		if (index >= 0)
			this.#listeners.splice(index, 1);
	}

	fire(index, del, ins)
	{
		if (del != 0 || ins != 0)
			this.#listeners.forEach(x => x(index, del, ins));
	}

	touch(index)
	{
		if (index >= 0 && index < this.length)
			this.#listeners.forEach(x => x(index, 0, 0));
	}

	push()
	{
		let index = this.length;
		super.push(...arguments);
		this.fire(index, 0, this.length - index);
	}
	pop()
	{
		let len = this.length;
		super.pop();
		this.fire(this.length, len - this.length, 0);
	}
	shift()
	{
		let len = this.length;
		super.shift(...arguments);
		this.fire(0, len - this.length, 0);
	}
	unshift()
	{
		let len = this.length;
		super.unshift(...arguments);
		this.fire(0, 0, this.length - len);
	}
	splice(index, del)
	{
		// Make sure fired range is valid
		if (index < 0)
			index += this.length;
		if (index >= this.length)
		{
			del = 0;
			index = this.length;
		}
		if (del === undefined)
			del = this.length - index;
		if (del < 0)
			del = 0;

		let result = super.splice(...arguments);
		this.fire(index, del, arguments.length > 2 ? arguments.length - 2 : 0);
		return result;
	}
	sort()
	{
		super.sort(...arguments);
		this.fire(0, this.length, this.length);
	}
	setAt(index, value)
	{
		if (index < 0 || index >= this.length)
			throw new Error("Observable array index out of range");
		this[index] = value;
		this.fire(index, 1, 1);
	}
	get isObservable() { return true; }
	static from(other)
	{
		return new ObservableArray(...other);
	}
}
