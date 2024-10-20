var mt = Object.defineProperty;
var gt = (o, e, t) => e in o ? mt(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var ee = (o, e, t) => (gt(o, typeof e != "symbol" ? e + "" : e, t), t), Te = (o, e, t) => {
  if (!e.has(o))
    throw TypeError("Cannot " + t);
};
var a = (o, e, t) => (Te(o, e, "read from private field"), t ? t.call(o) : e.get(o)), $ = (o, e, t) => {
  if (e.has(o))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(o) : e.set(o, t);
}, N = (o, e, t, i) => (Te(o, e, "write to private field"), i ? i.call(o, t) : e.set(o, t), t);
var w = (o, e, t) => (Te(o, e, "access private method"), t);
class j {
  constructor(e) {
    this.html = e;
  }
}
function Et(o) {
  return new j(o);
}
class Ke {
  constructor(e) {
    this.value = e;
  }
}
function Tt(o) {
  return new Ke(o);
}
let we = [], ae = null;
class Lt {
  static declare(e) {
    we.push(e), requestAnimationFrame(yt);
  }
}
function yt() {
  we.length != 0 && (ae == null && (ae = document.createElement("style")), ae.innerHTML += we.join(`
`), we = [], ae.parentNode || document.head.appendChild(ae));
}
function Dt(o, e) {
  for (let t = 0; t < o.length; t++)
    e(o[t], t) || (o.splice(t, 1), t--);
}
function Le(o) {
  return o.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function Oe(o) {
  return o instanceof Function && !!o.prototype && !!o.prototype.constructor;
}
function Ot(o, e) {
  if (o === e)
    return !0;
  if (o.size !== e.size)
    return !1;
  for (const t of o)
    if (!e.has(t))
      return !1;
  return !0;
}
function $t(o, e) {
  if (o === e || o === void 0 && e === void 0)
    return !0;
  if (o === void 0 || e === void 0)
    return !1;
  if (o === null && e === null)
    return !0;
  if (o === null || e === null || typeof o != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(o), i = Object.getOwnPropertyNames(e);
  if (t.length != i.length)
    return !1;
  for (let n of t)
    if (!Object.hasOwn(e, n) || !$t(o[n], e[n]))
      return !1;
  return !0;
}
function Ft(o, e, t) {
  let i = 0, n = o.length - 1;
  for (; i <= n; ) {
    let l = Math.floor((i + n) / 2), d = o[l], h = e(d, t);
    if (h == 0)
      return l;
    h < 0 ? i = l + 1 : n = l - 1;
  }
  return -1 - i;
}
function kt(o, e) {
  return o < e ? -1 : o > e ? 1 : 0;
}
function It(o, e) {
  return o = o.toLowerCase(), e = e.toLowerCase(), o < e ? -1 : o > e ? 1 : 0;
}
function Ne() {
  let o = [], e = "";
  function t(...y) {
    for (let m = 0; m < y.length; m++) {
      let u = y[m];
      u.lines ? o.push(...u.lines.map((g) => e + g)) : Array.isArray(u) ? o.push(...u.filter((g) => g != null).map((g) => e + g)) : o.push(...u.split(`
`).map((g) => e + g));
    }
  }
  function i() {
    e += "  ";
  }
  function n() {
    e = e.substring(2);
  }
  function l() {
    return o.join(`
`) + `
`;
  }
  function d(y) {
    t("{"), i(), y(this), n(), t("}");
  }
  function h(...y) {
    let m = {
      pos: this.lines.length
    };
    return this.append(y), m.headerLineCount = this.lines.length - m.pos, m;
  }
  function b(y, ...m) {
    this.lines.length == y.pos + y.headerLineCount ? this.lines.splice(y.pos, y.headerLineCount) : this.append(m);
  }
  return {
    append: t,
    enterCollapsibleBlock: h,
    leaveCollapsibleBlock: b,
    indent: i,
    unindent: n,
    braced: d,
    toString: l,
    lines: o,
    get isEmpty() {
      return o.length == 0;
    }
  };
}
class Pe {
  constructor() {
    this.code = Ne(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = Ne();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = Ne();
    return this.epilogs.push(e), e;
  }
  // Add a local variable to this closure
  addLocal(e, t) {
    this.locals.push({
      name: e,
      init: t
    });
  }
  // Add a function to this closure
  addFunction(e, t) {
    t || (t = []);
    let i = {
      name: e,
      args: t,
      code: new Pe()
    };
    return this.functions.push(i), i.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((i) => i.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = Ne();
    return this.appendTo(e), e.toString();
  }
  appendTo(e) {
    this.locals.length > 0 && e.append(`let ${this.locals.map((t) => t.init ? `${t.name} = ${t.init}` : t.name).join(", ")};`);
    for (let t of this.prologs)
      e.append(t);
    e.append(this.code);
    for (let t of this.functions)
      e.append(`function ${t.name}(${t.args.join(", ")})`), e.append("{"), e.indent(), t.code.appendTo(e), e.unindent(), e.append("}");
    for (let t of this.epilogs)
      e.append(t);
  }
}
class et {
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof j) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof j ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof j) {
      if (e.nodeType == 1)
        return e.innerHTML = t.html, e;
      let i = document.createElement("SPAN");
      return i.innerHTML = t.html, e.replaceWith(i), i;
    } else {
      if (e.nodeType == 3)
        return e.nodeValue = t, e;
      let i = document.createTextNode(t);
      return e.replaceWith(i), i;
    }
  }
  // Set or remove a class on an element
  static setNodeClass(e, t, i) {
    i ? e.classList.add(t) : e.classList.remove(t);
  }
  // Set or remove a style on an element
  static setNodeStyle(e, t, i) {
    i == null ? e.style.removeProperty(t) : e.style[t] = i;
  }
  static setNodeDisplay(e, t, i) {
    if (t === !0) {
      i === null ? e.style.removeProperty("display") : i !== void 0 && e.style.display != i && (e.style.display = i);
      return;
    } else if (t === !1 || t === null || t === void 0) {
      let n = e.style.display;
      return e.style.display != "none" && (e.style.display = "none"), n ?? null;
    } else if (typeof t == "string") {
      let n = e.style.display;
      return e.style.display != t && (e.style.display = t), n ?? null;
    }
  }
  static replaceMany(e, t) {
    if (e[0].parentNode) {
      e[0].replaceWith(...t);
      for (let i = 1; i < e.length; i++)
        e[i].remove();
    }
  }
  static addEventListener(e, t, i, n) {
    function l(d) {
      return n(e(), d);
    }
    return t.addEventListener(i, l), function() {
      t.removeEventListener(i, l);
    };
  }
  /*
      static cloneNodeRecursive(node) 
      {
          // Clone the node deeply
          let clone = node.cloneNode(true);
  
          // If the node has children, clone them recursively
          if (node.hasChildNodes()) 
          {
              node.childNodes.forEach(child => {
                  clone.append(this.cloneNodeRecursive(child));
              });
          }
  
          return clone;
      }
      */
}
function Ze(o) {
  let e = function() {
    let t = document.createComment(o);
    return {
      get rootNode() {
        return t;
      },
      get rootNodes() {
        return [t];
      },
      get isSingleRoot() {
        return !0;
      },
      destroy() {
      },
      update() {
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
class ve {
  static integrate(e) {
    let t = [], i = [], n = !1, l = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let h = e.branches[d], b = {};
      if (t.push(b), h.condition instanceof Function ? (b.condition = h.condition, n = !1) : h.condition !== void 0 ? (b.condition = () => h.condition, n = !!h.condition) : (b.condition = () => !0, n = !0), h.template !== void 0) {
        let y = new K(h.template);
        y.isSingleRoot || (l = !1), b.nodeIndex = i.length, i.push(y);
      }
    }
    return delete e.branches, n || t.push({
      condition: () => !0
    }), {
      isSingleRoot: l,
      wantsUpdate: !0,
      nodes: i,
      data: t
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: ve,
      branches: [
        {
          template: e,
          condition: e.if
        }
      ]
    };
    return delete e.if, t;
  }
  static transformGroup(e) {
    let t = null;
    for (let i = 0; i < e.length; i++) {
      let n = e[i];
      if (n.if)
        t = {
          type: ve,
          branches: [
            {
              condition: n.if,
              template: n
            }
          ]
        }, delete n.if, e.splice(i, 1, t);
      else if (n.elseif) {
        if (!t)
          throw new Error("template has 'elseif' without a preceeding condition");
        t.branches.push({
          condition: n.elseif,
          template: n
        }), delete n.elseif, e.splice(i, 1), i--;
      } else if (n.else !== void 0) {
        if (!t)
          throw new Error("template has 'else' without a preceeding condition");
        t.branches.push({
          condition: !0,
          template: n
        }), delete n.else, t = null, e.splice(i, 1), i--;
      } else
        t = null;
    }
  }
  constructor(e) {
    this.branches = e.data, this.branch_constructors = [], this.context = e.context;
    for (let t of this.branches)
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(Ze(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = Ze(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    let e = this.resolveActiveBranch();
    if (e != this.activeBranchIndex) {
      let t = this.activeBranch;
      this.activeBranchIndex = e, this.activeBranch = this.branch_constructors[e](), et.replaceMany(t.rootNodes, this.activeBranch.rootNodes), t.destroy();
    }
    this.activeBranch.update();
  }
  unbind() {
    var e, t;
    (t = (e = this.activeBranch).unbind) == null || t.call(e);
  }
  bind() {
    var e, t;
    (t = (e = this.activeBranch).bind) == null || t.call(e);
  }
  resolveActiveBranch() {
    for (let e = 0; e < this.branches.length; e++)
      if (this.branches[e].condition.call(this.context.model, this.context.model, this.context))
        return e;
    throw new Error("internal error, IfBlock didn't resolve to a branch");
  }
  get rootNodes() {
    return this.activeBranch.rootNodes;
  }
  get rootNode() {
    return this.activeBranch.rootNode;
  }
}
function bt(o, e) {
  let t = Math.min(o.length, e.length), i = Math.max(o.length, e.length), n = 0;
  for (; n < t && o[n] == e[n]; )
    n++;
  if (n == i)
    return [];
  if (n == o.length)
    return [{
      op: "insert",
      index: o.length,
      count: e.length - o.length
    }];
  let l = 0;
  for (; l < t - n && o[o.length - l - 1] == e[e.length - l - 1]; )
    l++;
  if (l == o.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - o.length
    }];
  if (n + l == o.length)
    return [{
      op: "insert",
      index: n,
      count: e.length - o.length
    }];
  if (n + l == e.length)
    return [{
      op: "delete",
      index: n,
      count: o.length - e.length
    }];
  let d = o.length - l, h = e.length - l, b = Z(e, n, h), y = null, m = [], u = n, g = n;
  for (; u < h; ) {
    for (; u < h && o[g] == e[u]; )
      b.delete(e[u], u), u++, g++;
    let v = u, x = g;
    for (; g < d && !b.has(o[g]); )
      g++;
    if (g > x) {
      m.push({ op: "delete", index: v, count: g - x });
      continue;
    }
    for (y || (y = Z(o, u, d)); u < h && !y.has(e[u]); )
      b.delete(e[u], u), u++;
    if (u > v) {
      m.push({ op: "insert", index: v, count: u - v });
      continue;
    }
    break;
  }
  if (u == h)
    return m;
  let r = 0, _ = new Ae();
  for (; g < d; ) {
    let v = g;
    for (; g < d && !b.has(o[g]); )
      g++;
    if (g > v) {
      m.push({ op: "delete", index: u, count: g - v });
      continue;
    }
    for (; g < d && b.consume(o[g]) !== void 0; )
      _.add(o[g], r++), g++;
    g > v && m.push({ op: "store", index: u, count: g - v });
  }
  for (; u < h; ) {
    let v = u;
    for (; u < h && !_.has(e[u]); )
      u++;
    if (u > v) {
      m.push({ op: "insert", index: v, count: u - v });
      continue;
    }
    let x = { op: "restore", index: u, count: 0 };
    for (m.push(x); u < h; ) {
      let O = _.consume(e[u]);
      if (O === void 0)
        break;
      x.count == 0 ? (x.storeIndex = O, x.count = 1) : x.storeIndex + x.count == O ? x.count++ : (x = { op: "restore", index: u, storeIndex: O, count: 1 }, m.push(x)), u++;
    }
  }
  return m;
  function Z(v, x, O) {
    let f = new Ae();
    for (let D = x; D < O; D++)
      f.add(v[D], D);
    return f;
  }
}
var H;
class Ae {
  constructor() {
    $(this, H, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let i = a(this, H).get(e);
    i ? i.push(t) : a(this, H).set(e, [t]);
  }
  delete(e, t) {
    let i = a(this, H).get(e);
    if (i) {
      let n = i.indexOf(t);
      if (n >= 0) {
        i.splice(n, 1);
        return;
      }
    }
    throw new Error("key/value pair not found");
  }
  consume(e) {
    let t = a(this, H).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return a(this, H).has(e);
  }
}
H = new WeakMap();
var he, ke, ne, Se, ue, Ie, ce, Re, fe, Be, pe, Me, xe, tt, me, Ve, ge, je, ye, Je, _e, it, $e, Ue, M, X;
const te = class te {
  constructor(e) {
    $(this, he);
    $(this, ne);
    $(this, ue);
    $(this, ce);
    $(this, fe);
    $(this, pe);
    $(this, xe);
    $(this, me);
    $(this, ge);
    $(this, ye);
    $(this, _e);
    $(this, $e);
    $(this, M);
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = document.createComment(" enter foreach block "), this.tailSentinal = document.createComment(" leave foreach block ");
  }
  static integrate(e) {
    let t = {
      itemConstructor: nt.compile(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, i;
    return e.empty && (i = [new K(e.empty)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: t,
      nodes: i
    };
  }
  static transform(e) {
    if (e.foreach === void 0)
      return e;
    let t;
    return e.foreach instanceof Function || Array.isArray(e.foreach) ? (t = {
      type: te,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: te,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = te.transform(e[t - 1])), e[t - 1].type === te && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, i) {
    if (i == 0 && t == 0)
      w(this, M, X).call(this, this.observableItems, null, e, e, 1);
    else {
      if (i && t) {
        let n = this.observableItems.slice(e, e + i), l = null;
        if (this.itemKey) {
          let d = { outer: this.outer };
          l = n.map((h) => (d.model = h, this.itemKey.call(h, h, d)));
        }
        w(this, he, ke).call(this, e, t, n, l);
      } else
        t != 0 ? w(this, ce, Re).call(this, e, t) : i != 0 && w(this, ue, Ie).call(this, this.observableItems, null, e, i);
      w(this, ne, Se).call(this);
    }
  }
  get rootNodes() {
    let e = this.emptyDom ? this.emptyDom.rootNodes : [];
    if (this.itemConstructor.isSingleRoot)
      return [this.headSentinal, ...this.itemDoms.map((t) => t.rootNode), ...e, this.tailSentinal];
    {
      let t = [this.headSentinal];
      for (let i = 0; i < this.itemDoms.length; i++)
        t.push(...this.itemDoms[i].rootNodes);
      return t.push(...e), t.push(this.tailSentinal), t;
    }
  }
  update() {
    let e;
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), w(this, ce, Re).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, i = null;
    if (this.observableItems || this.condition && (e = e.filter((n) => (t.model = n, this.condition.call(n, n, t)))), this.itemKey && (i = e.map((n) => (t.model = n, this.itemKey.call(n, n, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, w(this, ue, Ie).call(this, e, i, 0, e.length), w(this, ne, Se).call(this);
      return;
    }
    this.observableItems || w(this, he, ke).call(this, 0, this.itemDoms.length, e, i);
  }
  bind() {
    var e, t;
    (t = (e = this.emptyDom) == null ? void 0 : e.bind) == null || t.call(e);
  }
  unbind() {
    var e, t;
    (t = (e = this.emptyDom) == null ? void 0 : e.unbind) == null || t.call(e);
  }
  destroy() {
    this.observableItems != null && (this.observableItems.removeListener(this._onObservableUpdate), this.observableItems = null);
    for (let e = 0; e < this.itemDoms.length; e++)
      this.itemDoms[e].destroy();
    this.itemDoms = null;
  }
};
he = new WeakSet(), ke = function(e, t, i, n) {
  let l = e + t, d;
  e == 0 && t == this.itemDoms.length ? d = this.itemDoms : d = this.itemDoms.slice(e, l);
  let h;
  if (n ? h = bt(d.map((f) => f.context.key), n) : i.length > d.length ? h = [{
    op: "insert",
    index: d.length,
    count: i.length - d.length
  }] : i.length < d.length ? h = [{
    op: "delete",
    index: i.length,
    count: d.length - i.length
  }] : h = [], h.length == 0) {
    w(this, M, X).call(this, i, n, e, 0, t);
    return;
  }
  let b = [], y = [], m = {
    insert: Z,
    delete: v,
    store: x,
    restore: O
  }, u, g, r;
  this.itemConstructor.isSingleRoot ? (u = w(this, ge, je), g = w(this, ye, Je), r = w(this, $e, Ue)) : (u = w(this, fe, Be), g = w(this, pe, Me), r = w(this, me, Ve));
  let _ = 0;
  for (let f of h)
    f.index > _ && (w(this, M, X).call(this, i, n, e + _, _, f.index - _), _ = f.index), m[f.op].call(this, f);
  _ < i.length && w(this, M, X).call(this, i, n, e + _, _, i.length - _);
  for (let f = y.length - 1; f >= 0; f--)
    y[f].destroy();
  w(this, ne, Se).call(this);
  function Z(f) {
    _ += f.count;
    let D = Math.min(y.length, f.count);
    D && (g.call(this, f.index + e, y.splice(0, D)), w(this, M, X).call(this, i, n, f.index + e, f.index, D)), D < f.count && u.call(this, i, n, f.index + e + D, f.index + D, f.count - D);
  }
  function v(f) {
    y.push(...r.call(this, f.index + e, f.count));
  }
  function x(f) {
    b.push(...r.call(this, f.index + e, f.count));
  }
  function O(f) {
    _ += f.count, g.call(this, f.index, b.slice(f.index + e, f.index + e + f.count)), w(this, M, X).call(this, i, n, f.index + e, f.index, f.count);
  }
}, ne = new WeakSet(), Se = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.tailSentinal.parentNode && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.tailSentinal.parentNode)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, ue = new WeakSet(), Ie = function(e, t, i, n) {
  this.itemConstructor.isSingleRoot ? w(this, ge, je).call(this, e, t, i, i, n) : w(this, fe, Be).call(this, e, t, i, i, n);
}, ce = new WeakSet(), Re = function(e, t) {
  this.itemConstructor.isSingleRoot ? w(this, _e, it).call(this, e, t) : w(this, xe, tt).call(this, e, t);
}, fe = new WeakSet(), Be = function(e, t, i, n, l) {
  let d = [];
  for (let h = 0; h < l; h++) {
    let b = {
      outer: this.outer,
      model: e[n + h],
      key: t == null ? void 0 : t[n + h],
      index: i + h
    };
    d.push(this.itemConstructor(b));
  }
  w(this, pe, Me).call(this, i, d);
}, pe = new WeakSet(), Me = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let i = [];
  if (t.forEach((n) => i.push(...n.rootNodes)), this.tailSentinal.parentNode) {
    let n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNodes[0] : n = this.tailSentinal, n.before(...i);
  }
}, xe = new WeakSet(), tt = function(e, t) {
  let i = w(this, me, Ve).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    itemsDoms[n].destroy();
}, me = new WeakSet(), Ve = function(e, t) {
  let i = this.tailSentinal.parentNode != null;
  for (let n = 0; n < t; n++)
    if (i) {
      let l = this.itemDoms[e + n].rootNodes;
      for (let d = 0; d < l.length; d++)
        l[d].remove();
    }
  return this.itemDoms.splice(e, t);
}, ge = new WeakSet(), je = function(e, t, i, n, l) {
  let d = [];
  for (let h = 0; h < l; h++) {
    let b = {
      outer: this.outer,
      model: e[n + h],
      key: t == null ? void 0 : t[n + h],
      index: i + h
    };
    d.push(this.itemConstructor(b));
  }
  w(this, ye, Je).call(this, i, d);
}, ye = new WeakSet(), Je = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let i = t.map((n) => n.rootNode);
  if (this.tailSentinal.parentNode) {
    let n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNode : n = this.tailSentinal, n.before(...i);
  }
}, _e = new WeakSet(), it = function(e, t) {
  let i = w(this, $e, Ue).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    i[n].destroy();
}, $e = new WeakSet(), Ue = function(e, t) {
  let i = this.tailSentinal.parentNode != null;
  for (let n = 0; n < t; n++)
    i && this.itemDoms[e + n].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, M = new WeakSet(), X = function(e, t, i, n, l) {
  for (let d = 0; d < l; d++) {
    let h = this.itemDoms[i + d];
    h.context.key = t == null ? void 0 : t[n + d], h.context.index = i + d, h.context.model = e[n + d], h.rebind(), h.update();
  }
};
let Fe = te;
var I, B, R, Y, F, P, se, W, G;
const ie = class ie {
  constructor(e) {
    $(this, I, void 0);
    $(this, B, void 0);
    $(this, R, void 0);
    // either #content, or if #content is a function the return value from the function
    $(this, Y, void 0);
    $(this, F, void 0);
    $(this, P, void 0);
    $(this, se, void 0);
    $(this, W, void 0);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    $(this, G, !0);
    N(this, I, e.context), N(this, se, e.nodes.length > 0 ? e.nodes[0] : null), N(this, Y, document.createTextNode("")), N(this, P, document.createTextNode("")), N(this, F, []), N(this, G, e.data.ownsContent ?? !0), this.content = e.data.content;
  }
  static integrate(e) {
    let t = {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: {
        content: e.content,
        ownsContent: e.ownsContent ?? !0
      },
      nodes: e.placeholder ? [new K(e.placeholder)] : []
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, t;
  }
  static transform(e) {
    return e instanceof Function && !Oe(e) ? {
      type: ie,
      content: e
    } : (e.type == "embed-slot" && (e.type = ie), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = ie.transform(e[t - 1]), e[t - 1].type === ie && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      a(this, Y),
      ...a(this, F),
      a(this, P)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return a(this, G);
  }
  set ownsContent(e) {
    N(this, G, e);
  }
  get content() {
    return a(this, B);
  }
  set content(e) {
    N(this, B, e), a(this, B) instanceof Function ? this.replaceContent(a(this, B).call(a(this, I).model, a(this, I).model, a(this, I))) : this.replaceContent(a(this, B));
  }
  update() {
    a(this, B) instanceof Function && this.replaceContent(a(this, B).call(a(this, I).model, a(this, I).model, a(this, I)));
  }
  bind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, R)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, R)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  replaceContent(e) {
    var t, i;
    if (!(e == a(this, R) || !e && a(this, W))) {
      if (a(this, Y).parentNode != null) {
        let n = a(this, Y).nextSibling;
        for (; n != a(this, P); ) {
          let l = n.nextSibling;
          n.remove(), n = l;
        }
      }
      if (N(this, F, []), a(this, G) && ((i = (t = a(this, R)) == null ? void 0 : t.destroy) == null || i.call(t)), N(this, R, e), N(this, W, !1), !e)
        a(this, se) && (N(this, R, a(this, se).call(this, a(this, I))), N(this, W, !0), N(this, F, a(this, R).rootNodes));
      else if (e.rootNodes !== void 0)
        N(this, F, e.rootNodes);
      else if (Array.isArray(e))
        N(this, F, e);
      else if (e instanceof Node)
        N(this, F, [e]);
      else if (e instanceof j) {
        let n = document.createElement("span");
        n.innerHTML = e.html, N(this, F, [...n.childNodes]);
      } else if (typeof e == "string")
        N(this, F, [document.createTextNode(e)]);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      a(this, P).parentNode && a(this, P).before(...a(this, F));
    }
  }
  destroy() {
    var e, t;
    a(this, G) && ((t = (e = a(this, R)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
};
I = new WeakMap(), B = new WeakMap(), R = new WeakMap(), Y = new WeakMap(), F = new WeakMap(), P = new WeakMap(), se = new WeakMap(), W = new WeakMap(), G = new WeakMap();
let qe = ie;
class He {
  static register(e) {
    this.plugins.push(e);
  }
  static transform(e) {
    for (let t of this.plugins)
      t.transform && (e = t.transform(e));
    return e;
  }
  static transformGroup(e) {
    var t;
    for (let i of this.plugins)
      (t = i.transformGroup) == null || t.call(i, e);
  }
}
ee(He, "plugins", [
  Fe,
  qe,
  ve
]);
class K {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = He.transform(e), Oe(e) && (e = { type: e }), this.template = e, Oe(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof j) {
      let t = document.createElement("div");
      t.innerHTML = e.html, this.kind = "html", this.nodes = [...t.childNodes], this.nodes.forEach((i) => i.remove());
    } else
      e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (this.integrated = this.template.type.integrate(this.template)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof j) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((t) => {
        t._ && !t.type && (t.type = t._, delete t._);
      }), He.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((t) => new K(t))) : this.childNodes = [];
    else if (this.isComponent)
      e.$ && !e.content && (e.content = e.$, delete e.$);
    else if (e.childNodes)
      throw new Error("childNodes only supported on element and fragment nodes");
  }
  // Checks if this node is a single or multi-root node
  // (fragments and foreach nodes are multi-root, all others are single root)
  get isSingleRoot() {
    return this.isFragment ? this.childNodes.length == 1 && this.childNodes[0].isSingleRoot : this.isComponent ? this.template.type.isSingleRoot : this.isIntegrated ? this.integrated.isSingleRoot : this.kind == "html" ? this.nodes.length == 1 : !0;
  }
  // Is this a component?
  get isComponent() {
    return this.kind === "component";
  }
  get isFragment() {
    return this.kind === "fragment";
  }
  get isIntegrated() {
    return this.kind === "integrated";
  }
  // Recursively get all the local node variables associated with this node and it's
  // children. This function is used to get all the variables that need to
  // be reset to null when this item is conditionally removed from the DOM
  *enumLocalNodes() {
    if (this.isFragment || (yield this), this.childNodes)
      for (let e = 0; e < this.childNodes.length; e++)
        yield* this.childNodes[e].enumLocalNodes();
  }
  // Returns a string describing all the child DOM nodes
  // as a sequence of spread variables.
  spreadChildDomNodes() {
    return Array.from(e(this)).filter((t) => t.length > 0).join(", ");
    function* e(t) {
      for (let i = 0; i < t.childNodes.length; i++)
        yield t.childNodes[i].spreadDomNodes();
    }
  }
  // Returns a string descibing all the DOM nodes of this node
  // with conditionally included nodes correctly included/excluded
  spreadDomNodes() {
    return Array.from(this.enumAllNodes()).join(", ");
  }
  // Generate code to list out all this node's dom nodes
  *enumAllNodes() {
    switch (this.kind) {
      case "fragment":
        for (let e = 0; e < this.childNodes.length; e++)
          yield* this.childNodes[e].enumAllNodes();
        break;
      case "component":
      case "integrated":
        this.isSingleRoot ? yield `${this.name}.rootNode` : yield `...${this.name}.rootNodes`;
        break;
      case "html":
        this.nodes.length > 0 && (this.nodes.length > 1 ? yield `...${this.name}` : yield `${this.name}`);
        break;
      default:
        yield this.name;
    }
  }
}
function Nt(o, e) {
  let t = 1, i = 1, n = [], l = null, d = new K(o), h = /* @__PURE__ */ new Map();
  return {
    code: y(d, !0).toString(),
    isSingleRoot: d.isSingleRoot,
    refs: n
  };
  function y(m, u) {
    let g = {
      emit_text_node: D,
      emit_html_node: ot,
      emit_dynamic_text_node: rt,
      emit_comment_node: lt,
      emit_fragment_node: ht,
      emit_element_node: ut,
      emit_integrated_node: at,
      emit_component_node: dt
    }, r = new Pe();
    r.create = r.addFunction("create").code, r.bind = r.addFunction("bind").code, r.update = r.addFunction("update").code, r.unbind = r.addFunction("unbind").code, r.destroy = r.addFunction("destroy").code;
    let _;
    u && (_ = r.addFunction("rebind").code);
    let Z = /* @__PURE__ */ new Map();
    u && (l = r, l.code.append("let model = context.model;")), r.code.append("create();"), r.code.append("bind();"), r.code.append("update();"), f(m);
    for (let s of m.enumLocalNodes())
      ft(s);
    r.bind.closure.isEmpty || (r.create.append("bind();"), r.destroy.closure.addProlog().append("unbind();"));
    let v = [];
    return m.isSingleRoot && v.push(`  get rootNode() { return ${m.spreadDomNodes()}; },`), u ? (v.push("  context,"), m == d && h.forEach((s, c) => v.push(`  get ${c}() { return ${s}; },`)), r.getFunction("bind").isEmpty ? _.append("model = context.model") : (_.append("if (model != context.model)"), _.braced(() => {
      _.append("unbind();"), _.append("model = context.model"), _.append("bind();");
    })), v.push("  rebind,")) : (v.push("  bind,"), v.push("  unbind,")), r.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${m.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${m.isSingleRoot},`,
      ...v,
      "};"
    ]), r;
    function x(s) {
      s.template.export ? l.addLocal(s.name) : r.addLocal(s.name);
    }
    function O() {
      r.update.temp_declared || (r.update.temp_declared = !0, r.update.append("let temp;"));
    }
    function f(s) {
      s.name = `n${t++}`, g[`emit_${s.kind}_node`](s);
    }
    function D(s) {
      x(s), r.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function ot(s) {
      s.nodes.length != 0 && (x(s), s.nodes.length == 1 ? (r.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`), n.push(s.nodes[0])) : (r.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`), n.push(s.nodes)));
    }
    function rt(s) {
      x(s);
      let c = `p${i++}`;
      r.addLocal(c), r.create.append(`${s.name} = helpers.createTextNode("");`), O(), r.update.append(`temp = ${J(n.length)};`), r.update.append(`if (temp !== ${c})`), r.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${c} = ${J(n.length)});`), n.push(s.template);
    }
    function lt(s) {
      if (x(s), s.template.text instanceof Function) {
        let c = `p${i++}`;
        r.addLocal(c), r.create.append(`${s.name} = document.createComment("");`), O(), r.update.append(`temp = ${J(n.length)};`), r.update.append(`if (temp !== ${c})`), r.update.append(`  ${s.name}.nodeValue = ${c} = temp;`), n.push(s.template.text);
      } else
        r.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function at(s) {
      let c = [], T = !1;
      if (s.integrated.nodes)
        for (let p = 0; p < s.integrated.nodes.length; p++) {
          let S = s.integrated.nodes[p];
          S.name = `n${t++}`;
          let C = y(S, !1);
          C.getFunction("bind").isEmpty || (T = !0);
          let ze = `${S.name}_constructor_${p + 1}`, pt = r.addFunction(ze, []);
          C.appendTo(pt.code), c.push(ze);
        }
      s.integrated.wantsUpdate && r.update.append(`${s.name}.update()`), T && (r.bind.append(`${s.name}.bind()`), r.unbind.append(`${s.name}.unbind()`));
      let L = -1;
      s.integrated.data && (L = n.length, n.push(s.integrated.data)), x(s), r.create.append(
        `${s.name} = new refs[${n.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${L}]` : "null"},`,
        `  nodes: [ ${c.join(", ")} ],`,
        "});"
      ), n.push(s.template.type);
      for (let p of Object.keys(s.template))
        if (!Ee(s, p))
          throw new Error(`Unknown element template key: ${p}`);
    }
    function dt(s) {
      x(s), r.create.append(`${s.name} = new refs[${n.length}]();`), n.push(s.template.type);
      let c = new Set(s.template.type.slots ?? []), T = s.template.update === "auto", L = !1;
      for (let p of Object.keys(s.template)) {
        if (Ee(s, p) || p == "update")
          continue;
        if (c.has(p)) {
          if (s.template[p] === void 0)
            continue;
          let C = new K(s.template[p]);
          f(C), C.isSingleRoot ? r.create.append(`${s.name}${A(p)}.content = ${C.name};`) : r.create.append(`${s.name}${A(p)}.content = [${C.spreadDomNodes()}];`);
          continue;
        }
        let S = typeof s.template[p];
        if (S == "string" || S == "number" || S == "boolean")
          r.create.append(`${s.name}${A(p)} = ${JSON.stringify(s.template[p])}`);
        else if (S === "function") {
          T && !L && (L = `${s.name}_mod`, r.update.append(`let ${L} = false;`));
          let C = `p${i++}`;
          r.addLocal(C);
          let Ge = n.length;
          O(), r.update.append(`temp = ${J(Ge)};`), r.update.append(`if (temp !== ${C})`), T && (r.update.append("{"), r.update.append(`  ${L} = true;`)), r.update.append(`  ${s.name}${A(p)} = ${C} = temp;`), T && r.update.append("}"), n.push(s.template[p]);
        } else {
          let C = s.template[p];
          C instanceof Ke && (C = C.value), r.create.append(`${s.name}${A(p)} = refs[${n.length}];`), n.push(C);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (r.update.append(`if (${J(n.length)})`), r.update.append(`  ${s.name}.update();`), n.push(s.template.update)) : T ? L && (r.update.append(`if (${L})`), r.update.append(`  ${s.name}.update();`)) : r.update.append(`${s.name}.update();`));
    }
    function ht(s) {
      We(s);
    }
    function ut(s) {
      var L;
      let c = r.current_xmlns, T = s.template.xmlns;
      T === void 0 && s.template.type == "svg" && (T = "http://www.w3.org/2000/svg"), T == null && (T = r.current_xmlns), x(s), T ? (r.current_xmlns = T, r.create.append(`${s.name} = document.createElementNS(${JSON.stringify(T)}, ${JSON.stringify(s.template.type)});`)) : r.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let p of Object.keys(s.template))
        if (!Ee(s, p)) {
          if (p == "id") {
            U(s.template.id, (S) => `${s.name}.setAttribute("id", ${S});`);
            continue;
          }
          if (p == "class") {
            U(s.template.class, (S) => `${s.name}.setAttribute("class", ${S});`);
            continue;
          }
          if (p.startsWith("class_")) {
            let S = Le(p.substring(6));
            U(s.template[p], (C) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "style") {
            U(s.template.style, (S) => `${s.name}.setAttribute("style", ${S});`);
            continue;
          }
          if (p.startsWith("style_")) {
            let S = Le(p.substring(6));
            U(s.template[p], (C) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "display") {
            if (s.template.display instanceof Function)
              r.addLocal(`${s.name}_prev_display`), U(s.template[p], (S) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${S}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              r.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              r.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (p.startsWith("attr_")) {
            let S = p.substring(5);
            r.current_xmlns || (S = Le(S)), U(s.template[p], (C) => `${s.name}.setAttribute(${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "text") {
            s.template.text instanceof Function ? U(s.template.text, (S) => `helpers.setElementText(${s.name}, ${S})`) : s.template.text instanceof j && r.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && r.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${p}`);
        }
      We(s), (L = s.childNodes) != null && L.length && r.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), r.current_xmlns = c;
    }
    function We(s) {
      if (s.childNodes)
        for (let c = 0; c < s.childNodes.length; c++)
          f(s.childNodes[c]);
    }
    function Ee(s, c) {
      if (ct(c))
        return !0;
      if (c == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (h.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return h.set(s.template.export, s.name), !0;
      }
      if (c == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (Z.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return Z.set(s.template.bind, !0), r.bind.append(`model${A(s.template.bind)} = ${s.name};`), r.unbind.append(`model${A(s.template.bind)} = null;`), !0;
      }
      if (c.startsWith("on_")) {
        let T = c.substring(3);
        if (!(s.template[c] instanceof Function))
          throw new Error(`event handler for '${c}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let L = `${s.name}_ev${s.listenerCount}`;
        return r.addLocal(L), r.create.append(`${L} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(T)}, refs[${n.length}]);`), n.push(s.template[c]), !0;
      }
      return c == "debug_create" ? (typeof s.template[c] == "function" ? (r.create.append(`if (${J(n.length)})`), r.create.append("  debugger;"), n.push(s.template[c])) : s.template[c] && r.create.append("debugger;"), !0) : c == "debug_update" ? (typeof s.template[c] == "function" ? (r.update.append(`if (${J(n.length)})`), r.update.append("  debugger;"), n.push(s.template[c])) : s.template[c] && r.update.append("debugger;"), !0) : !1;
    }
    function ct(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function J(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function U(s, c) {
      if (s instanceof Function) {
        let T = `p${i++}`;
        r.addLocal(T), c(), O(), r.update.append(`temp = ${J(n.length)};`), r.update.append(`if (temp !== ${T})`), r.update.append(`  ${c(T + " = temp")};`), n.push(s);
      } else
        r.create.append(c(JSON.stringify(s)));
    }
    function ft(s) {
      if ((s.isComponent || s.isIntegrated) && r.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let c = 0; c < s.listenerCount; c++)
          r.destroy.append(`${s.name}_ev${c + 1}?.();`), r.destroy.append(`${s.name}_ev${c + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || r.destroy.append(`${s.name} = null;`);
    }
  }
}
let wt = 1;
function St(o, e) {
  let t = Nt(o), i = new Function("refs", "helpers", "context", t.code), n = function(l) {
    return l || (l = {}), l.$instanceId = wt++, i(t.refs, et, l ?? {});
  };
  return n.isSingleRoot = t.isSingleRoot, n;
}
let vt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function A(o) {
  return o.match(vt) ? `.${o}` : `[${JSON.stringify(o)}]`;
}
class nt {
  static compile() {
    return St(...arguments);
  }
}
let de = [], De = !1;
function st(o, e) {
  o && (e = e ?? 0, e != 0 && (De = !0), de.push({
    callback: o,
    order: e
  }), de.length == 1 && requestAnimationFrame(function() {
    let t = de;
    De && (t.sort((i, n) => n.order - i.order), De = !1), de = [];
    for (let i = t.length - 1; i >= 0; i--)
      t[i].callback();
  }));
}
function Rt(o) {
  de.length == 0 ? o() : st(o, Number.MAX_SAFE_INTEGER);
}
var k, Q, oe;
const q = class q extends EventTarget {
  constructor() {
    super();
    $(this, k, void 0);
    $(this, Q, !1);
    $(this, oe, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return nt.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    a(this, k) || N(this, k, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return a(this, k) || this.init(), a(this, k);
  }
  get isSingleRoot() {
    return this.dom.isSingleRoot;
  }
  get rootNode() {
    if (!this.isSingleRoot)
      throw new Error("rootNode property can't be used on multi-root template");
    return this.dom.rootNode;
  }
  get rootNodes() {
    return this.dom.rootNodes;
  }
  invalidate() {
    a(this, k) && (this.invalid || (this.invalid = !0, q.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && st(() => {
      for (let i = 0; i < this._invalidComponents.length; i++)
        this._invalidComponents[i].validate();
      this._invalidComponents = [];
    }, q.nextFrameOrder);
  }
  update() {
    a(this, k) && (this.invalid = !1, this.dom.update(), a(this, oe) && !a(this, Q) && (N(this, oe, !1), this.dispatchEvent(new Event("loaded"))));
  }
  destroy() {
    a(this, k) && (a(this, k).destroy(), N(this, k, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    a(this, k) && this.rootNodes.forEach((t) => t.remove());
  }
  get loading() {
    return a(this, Q);
  }
  set loading(t) {
    t != a(this, Q) && (N(this, Q, t), t && N(this, oe, !0), this.invalidate());
  }
};
k = new WeakMap(), Q = new WeakMap(), oe = new WeakMap(), ee(q, "_compiledTemplate"), ee(q, "nextFrameOrder", -100), ee(q, "_invalidComponents", []), ee(q, "template", {});
let Xe = q;
class Bt {
  static h(e, t) {
    return {
      type: `h${e}`,
      text: t
    };
  }
  static p(e) {
    return {
      type: "p",
      text: e
    };
  }
  static a(e, t) {
    return {
      type: "a",
      attr_href: e,
      text: t
    };
  }
  static raw(e) {
    return new j(e);
  }
}
var z;
const Ce = class Ce extends Array {
  constructor() {
    super(...arguments);
    $(this, z, []);
  }
  static from() {
    return new Ce(...arguments);
  }
  addListener(t) {
    a(this, z).push(t);
  }
  removeListener(t) {
    let i = a(this, z).indexOf(fn);
    i >= 0 && a(this, z).splice(i, 1);
  }
  fire(t, i, n) {
    (i != 0 || n != 0) && a(this, z).forEach((l) => l(t, i, n));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, z).forEach((i) => i(t, 0, 0));
  }
  push() {
    let t = this.length;
    super.push(...arguments), this.fire(t, 0, this.length - t);
  }
  pop() {
    let t = this.length;
    super.pop(), this.fire(this.length, t - this.length, 0);
  }
  shift() {
    let t = this.length;
    super.shift(...arguments), this.fire(0, t - this.length, 0);
  }
  unshift() {
    let t = this.length;
    super.unshift(...arguments), this.fire(0, 0, this.length - t);
  }
  splice(t, i) {
    t < 0 && (t += this.length), t >= this.length && (i = 0, t = this.length), i === void 0 && (i = this.length - t), i < 0 && (i = 0);
    let n = super.splice(...arguments);
    return this.fire(t, i, arguments.length > 2 ? arguments.length - 2 : 0), n;
  }
  sort() {
    super.sort(...arguments), this.fire(0, this.length, this.length);
  }
  setAt(t, i) {
    if (t < 0 || t >= this.length)
      throw new Error("Observable array index out of range");
    this[t] = i, this.fire(t, 1, 1);
  }
  get isObservable() {
    return !0;
  }
  static from(t) {
    return new Ce(...t);
  }
};
z = new WeakMap();
let Ye = Ce;
function xt(o) {
  let e = "^", t = o.length, i;
  for (let l = 0; l < t; l++) {
    i = !0;
    let d = o[l];
    if (d == "?")
      e += "[^\\/]";
    else if (d == "*")
      e += "[^\\/]+";
    else if (d == ":") {
      l++;
      let h = l;
      for (; l < t && n(o[l]); )
        l++;
      let b = o.substring(h, l);
      if (b.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let y = "[^\\/]+";
      if (o[l] == "(") {
        l++, h = l;
        let m = 0;
        for (; l < t; ) {
          if (o[l] == "(")
            m++;
          else if (o[l] == ")") {
            if (m == 0)
              break;
            m--;
          }
          l++;
        }
        if (l >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        y = o.substring(h, l), l++;
      }
      if (l < t && o[l] == "*" || o[l] == "+") {
        let m = o[l];
        l++, o[l] == "/" ? (e += `(?<${b}>(?:${y}\\/)${m})`, l++) : m == "*" ? e += `(?<${b}>(?:${y}\\/)*(?:${y})?\\/?)` : e += `(?<${b}>(?:${y}\\/)*(?:${y})\\/?)`, i = !1;
      } else
        e += `(?<${b}>${y})`;
      l--;
    } else
      d == "/" ? (e += "\\" + d, l == o.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(d) >= 0 ? (e += "\\" + d, i = d != "/") : e += d;
  }
  return i && (e += "\\/?"), e += "$", e;
  function n(l) {
    return l >= "a" && l <= "z" || l >= "A" && l <= "Z" || l >= "0" && l <= "9" || l == "_" || l == "$";
  }
}
function Mt(o) {
  return o == null ? "" : ("" + o).replace(/["'&<>]/g, function(e) {
    switch (e) {
      case '"':
        return "&quot;";
      case "&":
        return "&amp;";
      case "'":
        return "&#39;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
    }
  });
}
class Qe {
  static get() {
    return {
      top: window.pageYOffset || document.documentElement.scrollTop,
      left: window.pageXOffset || document.documentElement.scrollLeft
    };
  }
  static set(e) {
    e ? window.scrollTo(e.left, e.top) : window.scrollTo(0, 0);
  }
}
var V, be, E, re, le;
class _t extends EventTarget {
  constructor() {
    super(...arguments);
    $(this, V, {});
    // Prefix for all url matching
    $(this, be, void 0);
    // The current route
    $(this, E, void 0);
    $(this, re, []);
    $(this, le, !1);
  }
  start() {
    let t = window.sessionStorage.getItem("codeonly-view-states");
    t && N(this, V, JSON.parse(t)), this.load(window.location.pathname, window.history.state ?? { sequence: 0 }), window.history.replaceState(a(this, E).state, null), document.body.addEventListener("click", (i) => {
      let n = i.target.closest("a");
      if (n) {
        let l = n.getAttribute("href");
        this.navigate(l) && i.preventDefault();
      }
    }), window.addEventListener("popstate", (i) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage(), this.load(document.location.pathname, i.state);
    }), window.addEventListener("beforeunload", (i) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage();
    }), window.history.scrollRestoration && (window.history.scrollRestoration = "manual");
  }
  saveViewStatesToLocalStorage() {
    window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(a(this, V)));
  }
  captureCurrentViewState() {
    a(this, E) && (a(this, V)[a(this, E).state.sequence] = a(this, E).handler.captureViewState());
  }
  get prefix() {
    return a(this, be);
  }
  set prefix(t) {
    N(this, be, t);
  }
  get current() {
    return a(this, E);
  }
  navigate(t) {
    if (!t.startsWith("/") || this.prefix && t != this.prefix && !t.startsWith(this.prefix + "/"))
      return null;
    this.captureCurrentViewState();
    for (let n of Object.keys(a(this, V)))
      parseInt(n) > a(this, E).state.sequence && delete a(this, V)[n];
    this.saveViewStatesToLocalStorage();
    let i = this.load(t, { sequence: a(this, E).state.sequence + 1 });
    return i ? (window.history.pushState(i.state, null, t), !0) : null;
  }
  replace(t) {
    var i;
    a(this, E).url = t, this.prefix && (t = this.prefix + t), a(this, E).originalUrl = t, a(this, E).match = (i = a(this, E).handler.pattern) == null ? void 0 : i.match(a(this, E).url), window.history.replaceState(a(this, E).state, null, t);
  }
  load(t, i) {
    var d, h, b, y, m, u;
    let n = this.matchUrl(t, i);
    if (!n)
      return null;
    (b = (d = a(this, E)) == null ? void 0 : (h = d.handler).leave) == null || b.call(h, a(this, E)), N(this, E, n);
    let l = new Event("navigate");
    return l.route = n, this.dispatchEvent(l), (y = n.page) != null && y.loading ? n.page.addEventListener("loaded", () => {
      var g, r;
      a(this, E) == n && ((r = (g = n.handler).restoreViewState) == null || r.call(g, n.viewState));
    }, { once: !0 }) : (u = (m = n.handler).restoreViewState) == null || u.call(m, n.viewState), n;
  }
  matchUrl(t, i) {
    a(this, le) && (a(this, re).sort((l, d) => (l.order ?? 0) - (d.order ?? 0)), N(this, le, !1));
    let n = {
      url: t,
      state: i,
      viewState: a(this, V)[i.sequence],
      originalUrl: t
    };
    if (this.prefix) {
      if (!t.startsWith(this.prefix))
        return null;
      n.url = t.substring(this.prefix.length);
    }
    for (let l of a(this, re)) {
      if (l.pattern && (n.match = n.url.match(l.pattern), !n.match))
        continue;
      let d = l.match(n);
      if (d === !0 || d == n)
        return n.handler = l, n;
      if (d === null)
        return null;
    }
    return n.handler = {}, n;
  }
  back() {
    if (a(this, E).state.sequence == 0) {
      let t = ((this == null ? void 0 : this.prefix) ?? "") + "/";
      this.load(t, { sequence: 0 }), window.history.replaceState(a(this, E).state, null, t);
    } else
      window.history.back();
  }
  register(t) {
    typeof t.pattern == "string" && (t.pattern = xt(t.pattern)), t.captureViewState === void 0 && t.restoreViewState === void 0 && (t.captureViewState = Qe.get, t.restoreViewState = Qe.set), a(this, re).push(t), N(this, le, !0);
  }
}
V = new WeakMap(), be = new WeakMap(), E = new WeakMap(), re = new WeakMap(), le = new WeakMap();
let Vt = new _t();
export {
  Ke as CloakedValue,
  Xe as Component,
  Qe as DocumentScrollPosition,
  qe as EmbedSlot,
  Fe as ForEachBlock,
  Bt as Html,
  j as HtmlString,
  ve as IfBlock,
  Ye as ObservableArray,
  _t as Router,
  Lt as Style,
  nt as Template,
  Ot as areSetsEqual,
  Ft as binarySearch,
  Le as camel_to_dash,
  Tt as cloak,
  kt as compareStrings,
  It as compareStringsI,
  $t as deepEqual,
  Et as html,
  Mt as htmlEncode,
  Dt as inplace_filter_array,
  Oe as is_constructor,
  st as nextFrame,
  Rt as postNextFrame,
  Vt as router,
  xt as urlPattern
};
