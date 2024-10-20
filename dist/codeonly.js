var pt = Object.defineProperty;
var mt = (o, e, t) => e in o ? pt(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var le = (o, e, t) => (mt(o, typeof e != "symbol" ? e + "" : e, t), t), De = (o, e, t) => {
  if (!e.has(o))
    throw TypeError("Cannot " + t);
};
var a = (o, e, t) => (De(o, e, "read from private field"), t ? t.call(o) : e.get(o)), y = (o, e, t) => {
  if (e.has(o))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(o) : e.set(o, t);
}, N = (o, e, t, n) => (De(o, e, "write to private field"), n ? n.call(o, t) : e.set(o, t), t);
var w = (o, e, t) => (De(o, e, "access private method"), t);
class j {
  constructor(e) {
    this.html = e;
  }
}
function Ct(o) {
  return new j(o);
}
class Qe {
  constructor(e) {
    this.value = e;
  }
}
function Et(o) {
  return new Qe(o);
}
let Se = [], ae = null;
class Tt {
  static declare(e) {
    Se.push(e), requestAnimationFrame(gt);
  }
}
function gt() {
  Se.length != 0 && (ae == null && (ae = document.createElement("style")), ae.innerHTML += Se.join(`
`), Se = [], ae.parentNode || document.head.appendChild(ae));
}
function Lt(o, e) {
  for (let t = 0; t < o.length; t++)
    e(o[t], t) || (o.splice(t, 1), t--);
}
function Oe(o) {
  return o.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function ke(o) {
  return o instanceof Function && !!o.prototype && !!o.prototype.constructor;
}
function Dt(o, e) {
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
  let t = Object.getOwnPropertyNames(o), n = Object.getOwnPropertyNames(e);
  if (t.length != n.length)
    return !1;
  for (let i of t)
    if (!Object.hasOwn(e, i) || !$t(o[i], e[i]))
      return !1;
  return !0;
}
function Ot(o, e, t) {
  let n = 0, i = o.length - 1;
  for (; n <= i; ) {
    let l = Math.floor((n + i) / 2), d = o[l], h = e(d, t);
    if (h == 0)
      return l;
    h < 0 ? n = l + 1 : i = l - 1;
  }
  return -1 - n;
}
function Ft(o, e) {
  return o < e ? -1 : o > e ? 1 : 0;
}
function kt(o, e) {
  return o = o.toLowerCase(), e = e.toLowerCase(), o < e ? -1 : o > e ? 1 : 0;
}
function we() {
  let o = [], e = "";
  function t(...$) {
    for (let m = 0; m < $.length; m++) {
      let u = $[m];
      u.lines ? o.push(...u.lines.map((g) => e + g)) : Array.isArray(u) ? o.push(...u.filter((g) => g != null).map((g) => e + g)) : o.push(...u.split(`
`).map((g) => e + g));
    }
  }
  function n() {
    e += "  ";
  }
  function i() {
    e = e.substring(2);
  }
  function l() {
    return o.join(`
`) + `
`;
  }
  function d($) {
    t("{"), n(), $(this), i(), t("}");
  }
  function h(...$) {
    let m = {
      pos: this.lines.length
    };
    return this.append($), m.headerLineCount = this.lines.length - m.pos, m;
  }
  function b($, ...m) {
    this.lines.length == $.pos + $.headerLineCount ? this.lines.splice($.pos, $.headerLineCount) : this.append(m);
  }
  return {
    append: t,
    enterCollapsibleBlock: h,
    leaveCollapsibleBlock: b,
    indent: n,
    unindent: i,
    braced: d,
    toString: l,
    lines: o,
    get isEmpty() {
      return o.length == 0;
    }
  };
}
class He {
  constructor() {
    this.code = we(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = we();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = we();
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
    let n = {
      name: e,
      args: t,
      code: new He()
    };
    return this.functions.push(n), n.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((n) => n.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = we();
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
class Ke {
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
      let n = document.createElement("SPAN");
      return n.innerHTML = t.html, e.replaceWith(n), n;
    } else {
      if (e.nodeType == 3)
        return e.nodeValue = t, e;
      let n = document.createTextNode(t);
      return e.replaceWith(n), n;
    }
  }
  // Set or remove a class on an element
  static setNodeClass(e, t, n) {
    n ? e.classList.add(t) : e.classList.remove(t);
  }
  // Set or remove a style on an element
  static setNodeStyle(e, t, n) {
    n == null ? e.style.removeProperty(t) : e.style[t] = n;
  }
  static setNodeDisplay(e, t, n) {
    if (t === !0) {
      n === null ? e.style.removeProperty("display") : n !== void 0 && e.style.display != n && (e.style.display = n);
      return;
    } else if (t === !1 || t === null || t === void 0) {
      let i = e.style.display;
      return e.style.display != "none" && (e.style.display = "none"), i ?? null;
    } else if (typeof t == "string") {
      let i = e.style.display;
      return e.style.display != t && (e.style.display = t), i ?? null;
    }
  }
  static replaceMany(e, t) {
    if (e[0].parentNode) {
      e[0].replaceWith(...t);
      for (let n = 1; n < e.length; n++)
        e[n].remove();
    }
  }
  static addEventListener(e, t, n, i) {
    function l(d) {
      return i(e(), d);
    }
    return t.addEventListener(n, l), function() {
      t.removeEventListener(n, l);
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
function ze(o) {
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
class he {
  static integrate(e) {
    let t = [], n = [], i = !1, l = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let h = e.branches[d], b = {};
      if (t.push(b), h.condition instanceof Function ? (b.condition = h.condition, i = !1) : h.condition !== void 0 ? (b.condition = () => h.condition, i = !!h.condition) : (b.condition = () => !0, i = !0), h.template !== void 0) {
        let $ = new K(h.template);
        $.isSingleRoot || (l = !1), b.nodeIndex = n.length, n.push($);
      }
    }
    return delete e.branches, i || t.push({
      condition: () => !0
    }), {
      isSingleRoot: l,
      wantsUpdate: !0,
      nodes: n,
      data: t
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: he,
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
    for (let n = 0; n < e.length; n++) {
      let i = e[n];
      if (i.if)
        t = {
          type: he,
          branches: [
            {
              condition: i.if,
              template: i
            }
          ]
        }, delete i.if, e.splice(n, 1, t);
      else if (i.elseif) {
        if (!t)
          throw new Error("template has 'elseif' without a preceeding condition");
        t.branches.push({
          condition: i.elseif,
          template: i
        }), delete i.elseif, e.splice(n, 1), n--;
      } else if (i.else !== void 0) {
        if (!t)
          throw new Error("template has 'else' without a preceeding condition");
        t.branches.push({
          condition: !0,
          template: i
        }), delete i.else, t = null, e.splice(n, 1), n--;
      } else
        t = null;
    }
  }
  constructor(e) {
    this.branches = e.data, this.branch_constructors = [], this.context = e.context;
    for (let t of this.branches)
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(ze(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = ze(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    let e = this.resolveActiveBranch();
    if (e != this.activeBranchIndex) {
      let t = this.activeBranch;
      this.activeBranchIndex = e, this.activeBranch = this.branch_constructors[e](), Ke.replaceMany(t.rootNodes, this.activeBranch.rootNodes), t.destroy();
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
function yt(o, e) {
  let t = Math.min(o.length, e.length), n = Math.max(o.length, e.length), i = 0;
  for (; i < t && o[i] == e[i]; )
    i++;
  if (i == n)
    return [];
  if (i == o.length)
    return [{
      op: "insert",
      index: o.length,
      count: e.length - o.length
    }];
  let l = 0;
  for (; l < t - i && o[o.length - l - 1] == e[e.length - l - 1]; )
    l++;
  if (l == o.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - o.length
    }];
  if (i + l == o.length)
    return [{
      op: "insert",
      index: i,
      count: e.length - o.length
    }];
  if (i + l == e.length)
    return [{
      op: "delete",
      index: i,
      count: o.length - e.length
    }];
  let d = o.length - l, h = e.length - l, b = J(e, i, h), $ = null, m = [], u = i, g = i;
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
    for ($ || ($ = J(o, u, d)); u < h && !$.has(e[u]); )
      b.delete(e[u], u), u++;
    if (u > v) {
      m.push({ op: "insert", index: v, count: u - v });
      continue;
    }
    break;
  }
  if (u == h)
    return m;
  let r = 0, _ = new Ze();
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
  function J(v, x, O) {
    let f = new Ze();
    for (let D = x; D < O; D++)
      f.add(v[D], D);
    return f;
  }
}
var P;
class Ze {
  constructor() {
    y(this, P, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let n = a(this, P).get(e);
    n ? n.push(t) : a(this, P).set(e, [t]);
  }
  delete(e, t) {
    let n = a(this, P).get(e);
    if (n) {
      let i = n.indexOf(t);
      if (i >= 0) {
        n.splice(i, 1);
        return;
      }
    }
    throw new Error("key/value pair not found");
  }
  consume(e) {
    let t = a(this, P).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return a(this, P).has(e);
  }
}
P = new WeakMap();
var ue, Ie, ie, ve, ce, Re, fe, Be, pe, Me, me, Ve, Ce, et, ge, je, $e, Je, ye, Ue, Ee, tt, be, qe, M, X;
const ee = class ee {
  constructor(e) {
    y(this, ue);
    y(this, ie);
    y(this, ce);
    y(this, fe);
    y(this, pe);
    y(this, me);
    y(this, Ce);
    y(this, ge);
    y(this, $e);
    y(this, ye);
    y(this, Ee);
    y(this, be);
    y(this, M);
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = document.createComment(" enter foreach block "), this.tailSentinal = document.createComment(" leave foreach block ");
  }
  static integrate(e) {
    let t = {
      itemConstructor: it.compile(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, n;
    return e.empty && (n = [new K(e.empty)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: t,
      nodes: n
    };
  }
  static transform(e) {
    if (e.foreach === void 0)
      return e;
    let t;
    return e.foreach instanceof Function || Array.isArray(e.foreach) ? (t = {
      type: ee,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: ee,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = ee.transform(e[t - 1])), e[t - 1].type === ee && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, n) {
    if (n == 0 && t == 0)
      w(this, M, X).call(this, this.observableItems, null, e, e, 1);
    else {
      if (n && t) {
        let i = this.observableItems.slice(e, e + n), l = null;
        if (this.itemKey) {
          let d = { outer: this.outer };
          l = i.map((h) => (d.model = h, this.itemKey.call(h, h, d)));
        }
        w(this, ue, Ie).call(this, e, t, i, l);
      } else
        t != 0 ? w(this, fe, Be).call(this, e, t) : n != 0 && w(this, ce, Re).call(this, this.observableItems, null, e, n);
      w(this, ie, ve).call(this);
    }
  }
  get rootNodes() {
    let e = this.emptyDom ? this.emptyDom.rootNodes : [];
    if (this.itemConstructor.isSingleRoot)
      return [this.headSentinal, ...this.itemDoms.map((t) => t.rootNode), ...e, this.tailSentinal];
    {
      let t = [this.headSentinal];
      for (let n = 0; n < this.itemDoms.length; n++)
        t.push(...this.itemDoms[n].rootNodes);
      return t.push(...e), t.push(this.tailSentinal), t;
    }
  }
  update() {
    let e;
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), w(this, fe, Be).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, n = null;
    if (this.observableItems || this.condition && (e = e.filter((i) => (t.model = i, this.condition.call(i, i, t)))), this.itemKey && (n = e.map((i) => (t.model = i, this.itemKey.call(i, i, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, w(this, ce, Re).call(this, e, n, 0, e.length), w(this, ie, ve).call(this);
      return;
    }
    this.observableItems || w(this, ue, Ie).call(this, 0, this.itemDoms.length, e, n);
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
ue = new WeakSet(), Ie = function(e, t, n, i) {
  let l = e + t, d;
  e == 0 && t == this.itemDoms.length ? d = this.itemDoms : d = this.itemDoms.slice(e, l);
  let h;
  if (i ? h = yt(d.map((f) => f.context.key), i) : n.length > d.length ? h = [{
    op: "insert",
    index: d.length,
    count: n.length - d.length
  }] : n.length < d.length ? h = [{
    op: "delete",
    index: n.length,
    count: d.length - n.length
  }] : h = [], h.length == 0) {
    w(this, M, X).call(this, n, i, e, 0, t);
    return;
  }
  let b = [], $ = [], m = {
    insert: J,
    delete: v,
    store: x,
    restore: O
  }, u, g, r;
  this.itemConstructor.isSingleRoot ? (u = w(this, $e, Je), g = w(this, ye, Ue), r = w(this, be, qe)) : (u = w(this, pe, Me), g = w(this, me, Ve), r = w(this, ge, je));
  let _ = 0;
  for (let f of h)
    f.index > _ && (w(this, M, X).call(this, n, i, e + _, _, f.index - _), _ = f.index), m[f.op].call(this, f);
  _ < n.length && w(this, M, X).call(this, n, i, e + _, _, n.length - _);
  for (let f = $.length - 1; f >= 0; f--)
    $[f].destroy();
  w(this, ie, ve).call(this);
  function J(f) {
    _ += f.count;
    let D = Math.min($.length, f.count);
    D && (g.call(this, f.index + e, $.splice(0, D)), w(this, M, X).call(this, n, i, f.index + e, f.index, D)), D < f.count && u.call(this, n, i, f.index + e + D, f.index + D, f.count - D);
  }
  function v(f) {
    $.push(...r.call(this, f.index + e, f.count));
  }
  function x(f) {
    b.push(...r.call(this, f.index + e, f.count));
  }
  function O(f) {
    _ += f.count, g.call(this, f.index, b.slice(f.index + e, f.index + e + f.count)), w(this, M, X).call(this, n, i, f.index + e, f.index, f.count);
  }
}, ie = new WeakSet(), ve = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.tailSentinal.parentNode && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.tailSentinal.parentNode)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, ce = new WeakSet(), Re = function(e, t, n, i) {
  this.itemConstructor.isSingleRoot ? w(this, $e, Je).call(this, e, t, n, n, i) : w(this, pe, Me).call(this, e, t, n, n, i);
}, fe = new WeakSet(), Be = function(e, t) {
  this.itemConstructor.isSingleRoot ? w(this, Ee, tt).call(this, e, t) : w(this, Ce, et).call(this, e, t);
}, pe = new WeakSet(), Me = function(e, t, n, i, l) {
  let d = [];
  for (let h = 0; h < l; h++) {
    let b = {
      outer: this.outer,
      model: e[i + h],
      key: t == null ? void 0 : t[i + h],
      index: n + h
    };
    d.push(this.itemConstructor(b));
  }
  w(this, me, Ve).call(this, n, d);
}, me = new WeakSet(), Ve = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = [];
  if (t.forEach((i) => n.push(...i.rootNodes)), this.tailSentinal.parentNode) {
    let i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNodes[0] : i = this.tailSentinal, i.before(...n);
  }
}, Ce = new WeakSet(), et = function(e, t) {
  let n = w(this, ge, je).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    itemsDoms[i].destroy();
}, ge = new WeakSet(), je = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let i = 0; i < t; i++)
    if (n) {
      let l = this.itemDoms[e + i].rootNodes;
      for (let d = 0; d < l.length; d++)
        l[d].remove();
    }
  return this.itemDoms.splice(e, t);
}, $e = new WeakSet(), Je = function(e, t, n, i, l) {
  let d = [];
  for (let h = 0; h < l; h++) {
    let b = {
      outer: this.outer,
      model: e[i + h],
      key: t == null ? void 0 : t[i + h],
      index: n + h
    };
    d.push(this.itemConstructor(b));
  }
  w(this, ye, Ue).call(this, n, d);
}, ye = new WeakSet(), Ue = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = t.map((i) => i.rootNode);
  if (this.tailSentinal.parentNode) {
    let i;
    e + t.length < this.itemDoms.length ? i = this.itemDoms[e + t.length].rootNode : i = this.tailSentinal, i.before(...n);
  }
}, Ee = new WeakSet(), tt = function(e, t) {
  let n = w(this, be, qe).call(this, e, t);
  for (let i = n.length - 1; i >= 0; i--)
    n[i].destroy();
}, be = new WeakSet(), qe = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let i = 0; i < t; i++)
    n && this.itemDoms[e + i].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, M = new WeakSet(), X = function(e, t, n, i, l) {
  for (let d = 0; d < l; d++) {
    let h = this.itemDoms[n + d];
    h.context.key = t == null ? void 0 : t[i + d], h.context.index = n + d, h.context.model = e[i + d], h.rebind(), h.update();
  }
};
let xe = ee;
var I, B, R, Y, F, W, ne, G, z;
const te = class te {
  constructor(e) {
    y(this, I, void 0);
    y(this, B, void 0);
    y(this, R, void 0);
    // either #content, or if #content is a function the return value from the function
    y(this, Y, void 0);
    y(this, F, void 0);
    y(this, W, void 0);
    y(this, ne, void 0);
    y(this, G, void 0);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    y(this, z, !0);
    N(this, I, e.context), N(this, ne, e.nodes.length > 0 ? e.nodes[0] : null), N(this, Y, document.createTextNode("")), N(this, W, document.createTextNode("")), N(this, F, []), N(this, z, e.data.ownsContent ?? !0), this.content = e.data.content;
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
    return e instanceof Function && !ke(e) ? {
      type: te,
      content: e
    } : (e.type == "embed-slot" && (e.type = te), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = te.transform(e[t - 1]), e[t - 1].type === te && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      a(this, Y),
      ...a(this, F),
      a(this, W)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return a(this, z);
  }
  set ownsContent(e) {
    N(this, z, e);
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
    a(this, G) && ((t = (e = a(this, R)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, G) && ((t = (e = a(this, R)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  replaceContent(e) {
    var t, n;
    if (!(e == a(this, R) || !e && a(this, G))) {
      if (a(this, Y).parentNode != null) {
        let i = a(this, Y).nextSibling;
        for (; i != a(this, W); ) {
          let l = i.nextSibling;
          i.remove(), i = l;
        }
      }
      if (N(this, F, []), a(this, z) && ((n = (t = a(this, R)) == null ? void 0 : t.destroy) == null || n.call(t)), N(this, R, e), N(this, G, !1), !e)
        a(this, ne) && (N(this, R, a(this, ne).call(this, a(this, I))), N(this, G, !0), N(this, F, a(this, R).rootNodes));
      else if (e.rootNodes !== void 0)
        N(this, F, e.rootNodes);
      else if (Array.isArray(e))
        N(this, F, e);
      else if (e instanceof Node)
        N(this, F, [e]);
      else if (e instanceof j) {
        let i = document.createElement("span");
        i.innerHTML = e.html, N(this, F, [...i.childNodes]);
      } else if (typeof e == "string")
        N(this, F, [document.createTextNode(e)]);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      a(this, W).parentNode && a(this, W).before(...a(this, F));
    }
  }
  destroy() {
    var e, t;
    a(this, z) && ((t = (e = a(this, R)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
};
I = new WeakMap(), B = new WeakMap(), R = new WeakMap(), Y = new WeakMap(), F = new WeakMap(), W = new WeakMap(), ne = new WeakMap(), G = new WeakMap(), z = new WeakMap();
let _e = te;
class K {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e) {
    if (Array.isArray(e) && (e = { $: e }), e = xe.transform(e), e = _e.transform(e), e = he.transform(e), ke(e) && (e = { type: e }), this.template = e, e._ && !e.type && (e.type = e._, delete e._), ke(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof j) {
      let t = document.createElement("div");
      t.innerHTML = e.html, this.kind = "html", this.nodes = [...t.childNodes], this.nodes.forEach((n) => n.remove());
    } else
      e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (this.integrated = this.template.type.integrate(this.template)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof j) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) || (e.childNodes = [e.childNodes]), e.childNodes = e.childNodes.flat(), xe.transformGroup(e.childNodes), _e.transformGroup(e.childNodes), he.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((t) => new K(t))) : this.childNodes = [];
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
      for (let n = 0; n < t.childNodes.length; n++)
        yield t.childNodes[n].spreadDomNodes();
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
function bt(o, e) {
  let t = 1, n = 1, i = [], l = null, d = new K(o), h = /* @__PURE__ */ new Map();
  return {
    code: $(d, !0).toString(),
    isSingleRoot: d.isSingleRoot,
    refs: i
  };
  function $(m, u) {
    let g = {
      emit_text_node: D,
      emit_html_node: st,
      emit_dynamic_text_node: ot,
      emit_comment_node: rt,
      emit_fragment_node: dt,
      emit_element_node: ht,
      emit_integrated_node: lt,
      emit_component_node: at
    }, r = new He();
    r.create = r.addFunction("create").code, r.bind = r.addFunction("bind").code, r.update = r.addFunction("update").code, r.unbind = r.addFunction("unbind").code, r.destroy = r.addFunction("destroy").code;
    let _;
    u && (_ = r.addFunction("rebind").code);
    let J = /* @__PURE__ */ new Map();
    u && (l = r, l.code.append("let model = context.model;")), r.code.append("create();"), r.code.append("bind();"), r.code.append("update();"), f(m);
    for (let s of m.enumLocalNodes())
      ct(s);
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
    function st(s) {
      s.nodes.length != 0 && (x(s), s.nodes.length == 1 ? (r.create.append(`${s.name} = refs[${i.length}].cloneNode(true);`), i.push(s.nodes[0])) : (r.create.append(`${s.name} = refs[${i.length}].map(x => x.cloneNode(true));`), i.push(s.nodes)));
    }
    function ot(s) {
      x(s);
      let c = `p${n++}`;
      r.addLocal(c), r.create.append(`${s.name} = helpers.createTextNode("");`), O(), r.update.append(`temp = ${U(i.length)};`), r.update.append(`if (temp !== ${c})`), r.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${c} = ${U(i.length)});`), i.push(s.template);
    }
    function rt(s) {
      if (x(s), s.template.text instanceof Function) {
        let c = `p${n++}`;
        r.addLocal(c), r.create.append(`${s.name} = document.createComment("");`), O(), r.update.append(`temp = ${U(i.length)};`), r.update.append(`if (temp !== ${c})`), r.update.append(`  ${s.name}.nodeValue = ${c} = temp;`), i.push(s.template.text);
      } else
        r.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function lt(s) {
      let c = [], T = !1;
      if (s.integrated.nodes)
        for (let p = 0; p < s.integrated.nodes.length; p++) {
          let S = s.integrated.nodes[p];
          S.name = `n${t++}`;
          let C = $(S, !1);
          C.getFunction("bind").isEmpty || (T = !0);
          let Ge = `${S.name}_constructor_${p + 1}`, ft = r.addFunction(Ge, []);
          C.appendTo(ft.code), c.push(Ge);
        }
      s.integrated.wantsUpdate && r.update.append(`${s.name}.update()`), T && (r.bind.append(`${s.name}.bind()`), r.unbind.append(`${s.name}.unbind()`));
      let L = -1;
      s.integrated.data && (L = i.length, i.push(s.integrated.data)), x(s), r.create.append(
        `${s.name} = new refs[${i.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${L}]` : "null"},`,
        `  nodes: [ ${c.join(", ")} ],`,
        "});"
      ), i.push(s.template.type);
      for (let p of Object.keys(s.template))
        if (!Le(s, p))
          throw new Error(`Unknown element template key: ${p}`);
    }
    function at(s) {
      x(s), r.create.append(`${s.name} = new refs[${i.length}]();`), i.push(s.template.type);
      let c = new Set(s.template.type.slots ?? []), T = s.template.update === "auto", L = !1;
      for (let p of Object.keys(s.template)) {
        if (Le(s, p) || p == "update")
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
          let C = `p${n++}`;
          r.addLocal(C);
          let We = i.length;
          O(), r.update.append(`temp = ${U(We)};`), r.update.append(`if (temp !== ${C})`), T && (r.update.append("{"), r.update.append(`  ${L} = true;`)), r.update.append(`  ${s.name}${A(p)} = ${C} = temp;`), T && r.update.append("}"), i.push(s.template[p]);
        } else {
          let C = s.template[p];
          C instanceof Qe && (C = C.value), r.create.append(`${s.name}${A(p)} = refs[${i.length}];`), i.push(C);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (r.update.append(`if (${U(i.length)})`), r.update.append(`  ${s.name}.update();`), i.push(s.template.update)) : T ? L && (r.update.append(`if (${L})`), r.update.append(`  ${s.name}.update();`)) : r.update.append(`${s.name}.update();`));
    }
    function dt(s) {
      Pe(s);
    }
    function ht(s) {
      var L;
      let c = r.current_xmlns, T = s.template.xmlns;
      T === void 0 && s.template.type == "svg" && (T = "http://www.w3.org/2000/svg"), T == null && (T = r.current_xmlns), x(s), T ? (r.current_xmlns = T, r.create.append(`${s.name} = document.createElementNS(${JSON.stringify(T)}, ${JSON.stringify(s.template.type)});`)) : r.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let p of Object.keys(s.template))
        if (!Le(s, p)) {
          if (p == "id") {
            q(s.template.id, (S) => `${s.name}.setAttribute("id", ${S});`);
            continue;
          }
          if (p == "class") {
            q(s.template.class, (S) => `${s.name}.setAttribute("class", ${S});`);
            continue;
          }
          if (p.startsWith("class_")) {
            let S = Oe(p.substring(6));
            q(s.template[p], (C) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "style") {
            q(s.template.style, (S) => `${s.name}.setAttribute("style", ${S});`);
            continue;
          }
          if (p.startsWith("style_")) {
            let S = Oe(p.substring(6));
            q(s.template[p], (C) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "display") {
            if (s.template.display instanceof Function)
              r.addLocal(`${s.name}_prev_display`), q(s.template[p], (S) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${S}, ${s.name}_prev_display)`);
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
            r.current_xmlns || (S = Oe(S)), q(s.template[p], (C) => `${s.name}.setAttribute(${JSON.stringify(S)}, ${C})`);
            continue;
          }
          if (p == "text") {
            s.template.text instanceof Function ? q(s.template.text, (S) => `helpers.setElementText(${s.name}, ${S})`) : s.template.text instanceof j && r.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && r.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${p}`);
        }
      Pe(s), (L = s.childNodes) != null && L.length && r.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), r.current_xmlns = c;
    }
    function Pe(s) {
      if (s.childNodes)
        for (let c = 0; c < s.childNodes.length; c++)
          f(s.childNodes[c]);
    }
    function Le(s, c) {
      if (ut(c))
        return !0;
      if (c == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (h.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return h.set(s.template.export, s.name), !0;
      }
      if (c == "bind") {
        if (!J)
          throw new Error("'bind' can't be used inside 'foreach'");
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (J.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return J.set(s.template.bind, !0), r.bind.append(`model${A(s.template.bind)} = ${s.name};`), r.unbind.append(`model${A(s.template.bind)} = null;`), !0;
      }
      if (c.startsWith("on_")) {
        let T = c.substring(3);
        if (!(s.template[c] instanceof Function))
          throw new Error(`event handler for '${c}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let L = `${s.name}_ev${s.listenerCount}`;
        return r.addLocal(L), r.create.append(`${L} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(T)}, refs[${i.length}]);`), i.push(s.template[c]), !0;
      }
      return c == "debug_create" ? (typeof s.template[c] == "function" ? (r.create.append(`if (${U(i.length)})`), r.create.append("  debugger;"), i.push(s.template[c])) : s.template[c] && r.create.append("debugger;"), !0) : c == "debug_update" ? (typeof s.template[c] == "function" ? (r.update.append(`if (${U(i.length)})`), r.update.append("  debugger;"), i.push(s.template[c])) : s.template[c] && r.update.append("debugger;"), !0) : !1;
    }
    function ut(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function U(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function q(s, c) {
      if (s instanceof Function) {
        let T = `p${n++}`;
        r.addLocal(T), c(), O(), r.update.append(`temp = ${U(i.length)};`), r.update.append(`if (temp !== ${T})`), r.update.append(`  ${c(T + " = temp")};`), i.push(s);
      } else
        r.create.append(c(JSON.stringify(s)));
    }
    function ct(s) {
      if ((s.isComponent || s.isIntegrated) && r.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let c = 0; c < s.listenerCount; c++)
          r.destroy.append(`${s.name}_ev${c + 1}?.();`), r.destroy.append(`${s.name}_ev${c + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || r.destroy.append(`${s.name} = null;`);
    }
  }
}
let Nt = 1;
function wt(o, e) {
  let t = bt(o), n = new Function("refs", "helpers", "context", t.code), i = function(l) {
    return l || (l = {}), l.$instanceId = Nt++, n(t.refs, Ke, l ?? {});
  };
  return i.isSingleRoot = t.isSingleRoot, i;
}
let St = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function A(o) {
  return o.match(St) ? `.${o}` : `[${JSON.stringify(o)}]`;
}
class it {
  static compile() {
    return wt(...arguments);
  }
}
let de = [], Fe = !1;
function nt(o, e) {
  o && (e = e ?? 0, e != 0 && (Fe = !0), de.push({
    callback: o,
    order: e
  }), de.length == 1 && requestAnimationFrame(function() {
    let t = de;
    Fe && (t.sort((n, i) => i.order - n.order), Fe = !1), de = [];
    for (let n = t.length - 1; n >= 0; n--)
      t[n].callback();
  }));
}
function It(o) {
  de.length == 0 ? o() : nt(o, Number.MAX_SAFE_INTEGER);
}
var k, Q, se;
const H = class H extends EventTarget {
  constructor() {
    super();
    y(this, k, void 0);
    y(this, Q, !1);
    y(this, se, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return it.compile(this.template);
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
    a(this, k) && (this.invalid || (this.invalid = !0, H.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && nt(() => {
      for (let n = 0; n < this._invalidComponents.length; n++)
        this._invalidComponents[n].validate();
      this._invalidComponents = [];
    }, H.nextFrameOrder);
  }
  update() {
    a(this, k) && (this.invalid = !1, this.dom.update(), a(this, se) && !a(this, Q) && (N(this, se, !1), this.dispatchEvent(new Event("loaded"))));
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
    t != a(this, Q) && (N(this, Q, t), t && N(this, se, !0), this.invalidate());
  }
};
k = new WeakMap(), Q = new WeakMap(), se = new WeakMap(), le(H, "_compiledTemplate"), le(H, "nextFrameOrder", -100), le(H, "_invalidComponents", []), le(H, "template", {});
let Ae = H;
class Rt {
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
var Z;
const Te = class Te extends Array {
  constructor() {
    super(...arguments);
    y(this, Z, []);
  }
  static from() {
    return new Te(...arguments);
  }
  addListener(t) {
    a(this, Z).push(t);
  }
  removeListener(t) {
    let n = a(this, Z).indexOf(fn);
    n >= 0 && a(this, Z).splice(n, 1);
  }
  fire(t, n, i) {
    (n != 0 || i != 0) && a(this, Z).forEach((l) => l(t, n, i));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, Z).forEach((n) => n(t, 0, 0));
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
  splice(t, n) {
    t < 0 && (t += this.length), t >= this.length && (n = 0, t = this.length), n === void 0 && (n = this.length - t), n < 0 && (n = 0);
    let i = super.splice(...arguments);
    return this.fire(t, n, arguments.length > 2 ? arguments.length - 2 : 0), i;
  }
  sort() {
    super.sort(...arguments), this.fire(0, this.length, this.length);
  }
  setAt(t, n) {
    if (t < 0 || t >= this.length)
      throw new Error("Observable array index out of range");
    this[t] = n, this.fire(t, 1, 1);
  }
  get isObservable() {
    return !0;
  }
  static from(t) {
    return new Te(...t);
  }
};
Z = new WeakMap();
let Xe = Te;
function vt(o) {
  let e = "^", t = o.length, n;
  for (let l = 0; l < t; l++) {
    n = !0;
    let d = o[l];
    if (d == "?")
      e += "[^\\/]";
    else if (d == "*")
      e += "[^\\/]+";
    else if (d == ":") {
      l++;
      let h = l;
      for (; l < t && i(o[l]); )
        l++;
      let b = o.substring(h, l);
      if (b.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let $ = "[^\\/]+";
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
        $ = o.substring(h, l), l++;
      }
      if (l < t && o[l] == "*" || o[l] == "+") {
        let m = o[l];
        l++, o[l] == "/" ? (e += `(?<${b}>(?:${$}\\/)${m})`, l++) : m == "*" ? e += `(?<${b}>(?:${$}\\/)*(?:${$})?\\/?)` : e += `(?<${b}>(?:${$}\\/)*(?:${$})\\/?)`, n = !1;
      } else
        e += `(?<${b}>${$})`;
      l--;
    } else
      d == "/" ? (e += "\\" + d, l == o.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(d) >= 0 ? (e += "\\" + d, n = d != "/") : e += d;
  }
  return n && (e += "\\/?"), e += "$", e;
  function i(l) {
    return l >= "a" && l <= "z" || l >= "A" && l <= "Z" || l >= "0" && l <= "9" || l == "_" || l == "$";
  }
}
function Bt(o) {
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
class Ye {
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
var V, Ne, E, oe, re;
class xt extends EventTarget {
  constructor() {
    super(...arguments);
    y(this, V, {});
    // Prefix for all url matching
    y(this, Ne, void 0);
    // The current route
    y(this, E, void 0);
    y(this, oe, []);
    y(this, re, !1);
  }
  start() {
    let t = window.sessionStorage.getItem("codeonly-view-states");
    t && N(this, V, JSON.parse(t)), this.load(window.location.pathname, window.history.state ?? { sequence: 0 }), window.history.replaceState(a(this, E).state, null), document.body.addEventListener("click", (n) => {
      let i = n.target.closest("a");
      if (i) {
        let l = i.getAttribute("href");
        this.navigate(l) && n.preventDefault();
      }
    }), window.addEventListener("popstate", (n) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage(), this.load(document.location.pathname, n.state);
    }), window.addEventListener("beforeunload", (n) => {
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
    return a(this, Ne);
  }
  set prefix(t) {
    N(this, Ne, t);
  }
  get current() {
    return a(this, E);
  }
  navigate(t) {
    if (!t.startsWith("/") || this.prefix && t != this.prefix && !t.startsWith(this.prefix + "/"))
      return null;
    this.captureCurrentViewState();
    for (let i of Object.keys(a(this, V)))
      parseInt(i) > a(this, E).state.sequence && delete a(this, V)[i];
    this.saveViewStatesToLocalStorage();
    let n = this.load(t, { sequence: a(this, E).state.sequence + 1 });
    return n ? (window.history.pushState(n.state, null, t), !0) : null;
  }
  replace(t) {
    var n;
    a(this, E).url = t, this.prefix && (t = this.prefix + t), a(this, E).originalUrl = t, a(this, E).match = (n = a(this, E).handler.pattern) == null ? void 0 : n.match(a(this, E).url), window.history.replaceState(a(this, E).state, null, t);
  }
  load(t, n) {
    var d, h, b, $, m, u;
    let i = this.matchUrl(t, n);
    if (!i)
      return null;
    (b = (d = a(this, E)) == null ? void 0 : (h = d.handler).leave) == null || b.call(h, a(this, E)), N(this, E, i);
    let l = new Event("navigate");
    return l.route = i, this.dispatchEvent(l), ($ = i.page) != null && $.loading ? i.page.addEventListener("loaded", () => {
      var g, r;
      a(this, E) == i && ((r = (g = i.handler).restoreViewState) == null || r.call(g, i.viewState));
    }, { once: !0 }) : (u = (m = i.handler).restoreViewState) == null || u.call(m, i.viewState), i;
  }
  matchUrl(t, n) {
    a(this, re) && (a(this, oe).sort((l, d) => (l.order ?? 0) - (d.order ?? 0)), N(this, re, !1));
    let i = {
      url: t,
      state: n,
      viewState: a(this, V)[n.sequence],
      originalUrl: t
    };
    if (this.prefix) {
      if (!t.startsWith(this.prefix))
        return null;
      i.url = t.substring(this.prefix.length);
    }
    for (let l of a(this, oe)) {
      if (l.pattern && (i.match = i.url.match(l.pattern), !i.match))
        continue;
      let d = l.match(i);
      if (d === !0 || d == i)
        return i.handler = l, i;
      if (d === null)
        return null;
    }
    return i.handler = {}, i;
  }
  back() {
    if (a(this, E).state.sequence == 0) {
      let t = ((this == null ? void 0 : this.prefix) ?? "") + "/";
      this.load(t, { sequence: 0 }), window.history.replaceState(a(this, E).state, null, t);
    } else
      window.history.back();
  }
  register(t) {
    typeof t.pattern == "string" && (t.pattern = vt(t.pattern)), t.captureViewState === void 0 && t.restoreViewState === void 0 && (t.captureViewState = Ye.get, t.restoreViewState = Ye.set), a(this, oe).push(t), N(this, re, !0);
  }
}
V = new WeakMap(), Ne = new WeakMap(), E = new WeakMap(), oe = new WeakMap(), re = new WeakMap();
let Mt = new xt();
export {
  Qe as CloakedValue,
  Ae as Component,
  Ye as DocumentScrollPosition,
  _e as EmbedSlot,
  xe as ForEachBlock,
  Rt as Html,
  j as HtmlString,
  he as IfBlock,
  Xe as ObservableArray,
  xt as Router,
  Tt as Style,
  it as Template,
  Dt as areSetsEqual,
  Ot as binarySearch,
  Oe as camel_to_dash,
  Et as cloak,
  Ft as compareStrings,
  kt as compareStringsI,
  $t as deepEqual,
  Ct as html,
  Bt as htmlEncode,
  Lt as inplace_filter_array,
  ke as is_constructor,
  nt as nextFrame,
  It as postNextFrame,
  Mt as router,
  vt as urlPattern
};
