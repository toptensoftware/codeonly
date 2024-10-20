var ct = Object.defineProperty;
var ft = (r, e, t) => e in r ? ct(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var le = (r, e, t) => (ft(r, typeof e != "symbol" ? e + "" : e, t), t), Le = (r, e, t) => {
  if (!e.has(r))
    throw TypeError("Cannot " + t);
};
var a = (r, e, t) => (Le(r, e, "read from private field"), t ? t.call(r) : e.get(r)), b = (r, e, t) => {
  if (e.has(r))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(r) : e.set(r, t);
}, N = (r, e, t, n) => (Le(r, e, "write to private field"), n ? n.call(r, t) : e.set(r, t), t);
var w = (r, e, t) => (Le(r, e, "access private method"), t);
class V {
  constructor(e) {
    this.html = e;
  }
}
function xt(r) {
  return new V(r);
}
class Xe {
  constructor(e) {
    this.value = e;
  }
}
function _t(r) {
  return new Xe(r);
}
let Se = [], ae = null;
class Ct {
  static declare(e) {
    Se.push(e), requestAnimationFrame(pt);
  }
}
function pt() {
  Se.length != 0 && (ae == null && (ae = document.createElement("style")), ae.innerHTML += Se.join(`
`), Se = [], ae.parentNode || document.head.appendChild(ae));
}
function Et(r, e) {
  for (let t = 0; t < r.length; t++)
    e(r[t], t) || (r.splice(t, 1), t--);
}
function De(r) {
  return r.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function Ie(r) {
  return r instanceof Function && !!r.prototype && !!r.prototype.constructor;
}
function Tt(r, e) {
  if (r === e)
    return !0;
  if (r.size !== e.size)
    return !1;
  for (const t of r)
    if (!e.has(t))
      return !1;
  return !0;
}
function mt(r, e) {
  if (r === e || r === void 0 && e === void 0)
    return !0;
  if (r === void 0 || e === void 0)
    return !1;
  if (r === null && e === null)
    return !0;
  if (r === null || e === null || typeof r != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(r), n = Object.getOwnPropertyNames(e);
  if (t.length != n.length)
    return !1;
  for (let s of t)
    if (!Object.hasOwn(e, s) || !mt(r[s], e[s]))
      return !1;
  return !0;
}
function Lt(r, e, t) {
  let n = 0, s = r.length - 1;
  for (; n <= s; ) {
    let o = Math.floor((n + s) / 2), d = r[o], h = e(d, t);
    if (h == 0)
      return o;
    h < 0 ? n = o + 1 : s = o - 1;
  }
  return -1 - n;
}
function Dt(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function Ot(r, e) {
  return r = r.toLowerCase(), e = e.toLowerCase(), r < e ? -1 : r > e ? 1 : 0;
}
function we() {
  let r = [], e = "";
  function t(...g) {
    for (let u = 0; u < g.length; u++) {
      let f = g[u];
      f.lines ? r.push(...f.lines.map((y) => e + y)) : Array.isArray(f) ? r.push(...f.filter((y) => y != null).map((y) => e + y)) : r.push(...f.split(`
`).map((y) => e + y));
    }
  }
  function n() {
    e += "  ";
  }
  function s() {
    e = e.substring(2);
  }
  function o() {
    return r.join(`
`) + `
`;
  }
  function d(g) {
    t("{"), n(), g(this), s(), t("}");
  }
  function h(...g) {
    let u = {
      pos: this.lines.length
    };
    return this.append(g), u.headerLineCount = this.lines.length - u.pos, u;
  }
  function S(g, ...u) {
    this.lines.length == g.pos + g.headerLineCount ? this.lines.splice(g.pos, g.headerLineCount) : this.append(u);
  }
  return {
    append: t,
    enterCollapsibleBlock: h,
    leaveCollapsibleBlock: S,
    indent: n,
    unindent: s,
    braced: d,
    toString: o,
    lines: r,
    get isEmpty() {
      return r.length == 0;
    }
  };
}
class Ue {
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
      code: new Ue()
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
class Ye {
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof V) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof V ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof V) {
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
      let s = e.style.display;
      return e.style.display != "none" && (e.style.display = "none"), s ?? null;
    } else if (typeof t == "string") {
      let s = e.style.display;
      return e.style.display != t && (e.style.display = t), s ?? null;
    }
  }
  static replaceMany(e, t) {
    if (e[0].parentNode) {
      e[0].replaceWith(...t);
      for (let n = 1; n < e.length; n++)
        e[n].remove();
    }
  }
  static addEventListener(e, t, n, s) {
    function o(d) {
      return s(e(), d);
    }
    return t.addEventListener(n, o), function() {
      t.removeEventListener(n, o);
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
function We(r) {
  let e = function() {
    let t = document.createComment(r);
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
class ue {
  static integrate(e) {
    let t = [], n = [], s = !1, o = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let h = e.branches[d], S = {};
      if (t.push(S), h.condition instanceof Function ? (S.condition = h.condition, s = !1) : h.condition !== void 0 ? (S.condition = () => h.condition, s = !!h.condition) : (S.condition = () => !0, s = !0), h.template !== void 0) {
        let g = new Q(h.template);
        g.isSingleRoot || (o = !1), S.nodeIndex = n.length, n.push(g);
      }
    }
    return delete e.branches, s || t.push({
      condition: () => !0
    }), {
      isSingleRoot: o,
      wantsUpdate: !0,
      nodes: n,
      data: t
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: ue,
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
      let s = e[n];
      if (s.if)
        t = {
          type: ue,
          branches: [
            {
              condition: s.if,
              template: s
            }
          ]
        }, delete s.if, e.splice(n, 1, t);
      else if (s.elseif) {
        if (!t)
          throw new Error("template has 'elseif' without a preceeding condition");
        t.branches.push({
          condition: s.elseif,
          template: s
        }), delete s.elseif, e.splice(n, 1), n--;
      } else if (s.else !== void 0) {
        if (!t)
          throw new Error("template has 'else' without a preceeding condition");
        t.branches.push({
          condition: !0,
          template: s
        }), delete s.else, t = null, e.splice(n, 1), n--;
      } else
        t = null;
    }
  }
  constructor(e) {
    this.branches = e.data, this.branch_constructors = [], this.context = e.context;
    for (let t of this.branches)
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(We(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = We(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    let e = this.resolveActiveBranch();
    if (e != this.activeBranchIndex) {
      let t = this.activeBranch;
      this.activeBranchIndex = e, this.activeBranch = this.branch_constructors[e](), Ye.replaceMany(t.rootNodes, this.activeBranch.rootNodes), t.destroy();
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
function gt(r, e) {
  let t = Math.min(r.length, e.length), n = Math.max(r.length, e.length), s = 0;
  for (; s < t && r[s] == e[s]; )
    s++;
  if (s == n)
    return [];
  if (s == r.length)
    return [{
      op: "insert",
      index: r.length,
      count: e.length - r.length
    }];
  let o = 0;
  for (; o < t - s && r[r.length - o - 1] == e[e.length - o - 1]; )
    o++;
  if (o == r.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - r.length
    }];
  if (s + o == r.length)
    return [{
      op: "insert",
      index: s,
      count: e.length - r.length
    }];
  if (s + o == e.length)
    return [{
      op: "delete",
      index: s,
      count: r.length - e.length
    }];
  let d = r.length - o, h = e.length - o, S = p(e, s, h), g = null, u = [], f = s, y = s;
  for (; f < h; ) {
    for (; f < h && r[y] == e[f]; )
      S.delete(e[f], f), f++, y++;
    let $ = f, x = y;
    for (; y < d && !S.has(r[y]); )
      y++;
    if (y > x) {
      u.push({ op: "delete", index: $, count: y - x });
      continue;
    }
    for (g || (g = p(r, f, d)); f < h && !g.has(e[f]); )
      S.delete(e[f], f), f++;
    if (f > $) {
      u.push({ op: "insert", index: $, count: f - $ });
      continue;
    }
    break;
  }
  if (f == h)
    return u;
  let l = 0, L = new Ge();
  for (; y < d; ) {
    let $ = y;
    for (; y < d && !S.has(r[y]); )
      y++;
    if (y > $) {
      u.push({ op: "delete", index: f, count: y - $ });
      continue;
    }
    for (; y < d && S.consume(r[y]) !== void 0; )
      L.add(r[y], l++), y++;
    y > $ && u.push({ op: "store", index: f, count: y - $ });
  }
  for (; f < h; ) {
    let $ = f;
    for (; f < h && !L.has(e[f]); )
      f++;
    if (f > $) {
      u.push({ op: "insert", index: $, count: f - $ });
      continue;
    }
    let x = { op: "restore", index: f, count: 0 };
    for (u.push(x); f < h; ) {
      let I = L.consume(e[f]);
      if (I === void 0)
        break;
      x.count == 0 ? (x.storeIndex = I, x.count = 1) : x.storeIndex + x.count == I ? x.count++ : (x = { op: "restore", index: f, storeIndex: I, count: 1 }, u.push(x)), f++;
    }
  }
  return u;
  function p($, x, I) {
    let K = new Ge();
    for (let ee = x; ee < I; ee++)
      K.add($[ee], ee);
    return K;
  }
}
var H;
class Ge {
  constructor() {
    b(this, H, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let n = a(this, H).get(e);
    n ? n.push(t) : a(this, H).set(e, [t]);
  }
  delete(e, t) {
    let n = a(this, H).get(e);
    if (n) {
      let s = n.indexOf(t);
      if (s >= 0) {
        n.splice(s, 1);
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
var A, de, ce, Fe, fe, ke, pe, Re, me, Be, _e, Qe, ge, Me, ye, Ve, $e, je, Ce, Ke, be, Je, R, U;
const te = class te {
  constructor(e) {
    b(this, A);
    b(this, ce);
    b(this, fe);
    b(this, pe);
    b(this, me);
    b(this, _e);
    b(this, ge);
    b(this, ye);
    b(this, $e);
    b(this, Ce);
    b(this, be);
    b(this, R);
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = document.createComment(" enter foreach block "), this.tailSentinal = document.createComment(" leave foreach block ");
  }
  static integrate(e) {
    let t = {
      itemConstructor: et.compile(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, n;
    return e.empty && (n = [new Q(e.empty)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
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
  onObservableUpdate(e, t, n) {
    n == 0 && t == 0 ? w(this, R, U).call(this, this.observableItems, null, e, 1) : (t != 0 && w(this, fe, ke).call(this, e, t), n != 0 && w(this, ce, Fe).call(this, this.observableItems, null, e, n), w(this, A, de).call(this));
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
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), w(this, fe, ke).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = null;
    if (!this.observableItems) {
      let p = {
        outer: this.outer
      };
      this.condition && (e = e.filter(($) => (p.model = $, this.condition.call($, $, p)))), this.itemKey && (t = e.map(($) => (p.model = $, this.itemKey.call($, $, p))));
    }
    if (!this.itemsLoaded) {
      this.itemsLoaded = !0, w(this, ce, Fe).call(this, e, t, 0, e.length), w(this, A, de).call(this);
      return;
    }
    if (this.observableItems) {
      w(this, R, U).call(this, this.observableItems, null, 0, this.itemDoms.length), w(this, A, de).call(this);
      return;
    }
    let n;
    if (t ? n = gt(this.itemDoms.map((p) => p.context.key), t) : e.length > this.itemDoms.length ? n = [{
      op: "insert",
      index: this.itemDoms.length,
      count: e.length - this.itemDoms.length
    }] : e.length < this.itemDoms.length ? n = [{
      op: "delete",
      index: e.length,
      count: this.itemDoms.length - e.length
    }] : n = [], n.length == 0) {
      w(this, R, U).call(this, e, t, 0, e.length);
      return;
    }
    let s = [], o = [], d = {
      insert: f,
      delete: y,
      store: l,
      restore: L
    }, h, S, g;
    this.itemConstructor.isSingleRoot ? (h = w(this, ye, Ve), S = w(this, $e, je), g = w(this, be, Je)) : (h = w(this, pe, Re), S = w(this, me, Be), g = w(this, ge, Me));
    let u = 0;
    for (let p of n)
      p.index > u && w(this, R, U).call(this, e, t, u, p.index - u), d[p.op].call(this, p);
    u < e.length && w(this, R, U).call(this, e, t, u, e.length - u);
    for (let p = o.length - 1; p >= 0; p--)
      o[p].destroy();
    w(this, A, de).call(this);
    function f(p) {
      u += p.count;
      let $ = Math.min(o.length, p.count);
      $ && (S.call(this, p.index, o.splice(0, $)), w(this, R, U).call(this, e, t, p.index, $)), $ < p.count && h.call(this, e, t, p.index, p.count);
    }
    function y(p) {
      o.push(...g.call(this, p.index, p.count));
    }
    function l(p) {
      s.push(...g.call(this, p.index, p.count));
    }
    function L(p) {
      u += p.count, S.call(this, p.index, s.slice(p.index, p.index + p.count)), w(this, R, U).call(this, e, t, p.index, p.count);
    }
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
A = new WeakSet(), de = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.tailSentinal.parentNode && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.tailSentinal.parentNode)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, ce = new WeakSet(), Fe = function(e, t, n, s) {
  this.itemConstructor.isSingleRoot ? w(this, ye, Ve).call(this, e, t, n, s) : w(this, pe, Re).call(this, e, t, n, s);
}, fe = new WeakSet(), ke = function(e, t) {
  this.itemConstructor.isSingleRoot ? w(this, Ce, Ke).call(this, e, t) : w(this, _e, Qe).call(this, e, t);
}, pe = new WeakSet(), Re = function(e, t, n, s) {
  let o = [];
  for (let d = 0; d < s; d++) {
    let h = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: n + d
    };
    o.push(this.itemConstructor(h));
  }
  w(this, me, Be).call(this, n, o);
}, me = new WeakSet(), Be = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = [];
  if (t.forEach((s) => n.push(...s.rootNodes)), this.tailSentinal.parentNode) {
    let s;
    e + t.length < this.itemDoms.length ? s = this.itemDoms[e + t.length].rootNodes[0] : s = this.tailSentinal, s.before(...n);
  }
}, _e = new WeakSet(), Qe = function(e, t) {
  let n = w(this, ge, Me).call(this, e, t);
  for (let s = n.length - 1; s >= 0; s--)
    itemsDoms[s].destroy();
}, ge = new WeakSet(), Me = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let s = 0; s < t; s++)
    if (n) {
      let o = this.itemDoms[e + s].rootNodes;
      for (let d = 0; d < o.length; d++)
        o[d].remove();
    }
  return this.itemDoms.splice(e, t);
}, ye = new WeakSet(), Ve = function(e, t, n, s) {
  let o = [];
  for (let d = 0; d < s; d++) {
    let h = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: n + d
    };
    o.push(this.itemConstructor(h));
  }
  w(this, $e, je).call(this, n, o);
}, $e = new WeakSet(), je = function(e, t) {
  this.itemDoms.splice(e, 0, ...t);
  let n = t.map((s) => s.rootNode);
  if (this.tailSentinal.parentNode) {
    let s;
    e + t.length < this.itemDoms.length ? s = this.itemDoms[e + t.length].rootNode : s = this.tailSentinal, s.before(...n);
  }
}, Ce = new WeakSet(), Ke = function(e, t) {
  let n = w(this, be, Je).call(this, e, t);
  for (let s = n.length - 1; s >= 0; s--)
    n[s].destroy();
}, be = new WeakSet(), Je = function(e, t) {
  let n = this.tailSentinal.parentNode != null;
  for (let s = 0; s < t; s++)
    n && this.itemDoms[e + s].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, R = new WeakSet(), U = function(e, t, n, s) {
  for (let o = n, d = n + s; o < d; o++) {
    let h = this.itemDoms[o];
    h.context.key = t == null ? void 0 : t[o], h.context.index = o, h.context.model = e[o], h.rebind(), h.update();
  }
};
let ve = te;
var F, B, k, X, D, P, ne, W, G;
const ie = class ie {
  constructor(e) {
    b(this, F, void 0);
    b(this, B, void 0);
    b(this, k, void 0);
    // either #content, or if #content is a function the return value from the function
    b(this, X, void 0);
    b(this, D, void 0);
    b(this, P, void 0);
    b(this, ne, void 0);
    b(this, W, void 0);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    b(this, G, !0);
    N(this, F, e.context), N(this, ne, e.nodes.length > 0 ? e.nodes[0] : null), N(this, X, document.createTextNode("")), N(this, P, document.createTextNode("")), N(this, D, []), N(this, G, e.data.ownsContent ?? !0), this.content = e.data.content;
  }
  static integrate(e) {
    let t = {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: {
        content: e.content,
        ownsContent: e.ownsContent ?? !0
      },
      nodes: e.placeholder ? [new Q(e.placeholder)] : []
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, t;
  }
  static transform(e) {
    return e instanceof Function && !Ie(e) ? {
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
      a(this, X),
      ...a(this, D),
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
    N(this, B, e), a(this, B) instanceof Function ? this.replaceContent(a(this, B).call(a(this, F).model, a(this, F).model, a(this, F))) : this.replaceContent(a(this, B));
  }
  update() {
    a(this, B) instanceof Function && this.replaceContent(a(this, B).call(a(this, F).model, a(this, F).model, a(this, F)));
  }
  bind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, k)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, k)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  replaceContent(e) {
    var t, n;
    if (!(e == a(this, k) || !e && a(this, W))) {
      if (a(this, X).parentNode != null) {
        let s = a(this, X).nextSibling;
        for (; s != a(this, P); ) {
          let o = s.nextSibling;
          s.remove(), s = o;
        }
      }
      if (N(this, D, []), a(this, G) && ((n = (t = a(this, k)) == null ? void 0 : t.destroy) == null || n.call(t)), N(this, k, e), N(this, W, !1), !e)
        a(this, ne) && (N(this, k, a(this, ne).call(this, a(this, F))), N(this, W, !0), N(this, D, a(this, k).rootNodes));
      else if (e.rootNodes !== void 0)
        N(this, D, e.rootNodes);
      else if (Array.isArray(e))
        N(this, D, e);
      else if (e instanceof Node)
        N(this, D, [e]);
      else if (e instanceof V) {
        let s = document.createElement("span");
        s.innerHTML = e.html, N(this, D, [...s.childNodes]);
      } else if (typeof e == "string")
        N(this, D, [document.createTextNode(e)]);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      a(this, P).parentNode && a(this, P).before(...a(this, D));
    }
  }
  destroy() {
    var e, t;
    a(this, G) && ((t = (e = a(this, k)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
};
F = new WeakMap(), B = new WeakMap(), k = new WeakMap(), X = new WeakMap(), D = new WeakMap(), P = new WeakMap(), ne = new WeakMap(), W = new WeakMap(), G = new WeakMap();
let xe = ie;
class Q {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e) {
    if (Array.isArray(e) && (e = { $: e }), e = ve.transform(e), e = xe.transform(e), e = ue.transform(e), Ie(e) && (e = { type: e }), this.template = e, e._ && !e.type && (e.type = e._, delete e._), Ie(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof V) {
      let t = document.createElement("div");
      t.innerHTML = e.html, this.kind = "html", this.nodes = [...t.childNodes], this.nodes.forEach((n) => n.remove());
    } else
      e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (this.integrated = this.template.type.integrate(this.template)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof V) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) || (e.childNodes = [e.childNodes]), e.childNodes = e.childNodes.flat(), ve.transformGroup(e.childNodes), xe.transformGroup(e.childNodes), ue.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((t) => new Q(t))) : this.childNodes = [];
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
function yt(r, e) {
  let t = 1, n = 1, s = [], o = null, d = new Q(r), h = /* @__PURE__ */ new Map();
  return {
    code: g(d, !0).toString(),
    isSingleRoot: d.isSingleRoot,
    refs: s
  };
  function g(u, f) {
    let y = {
      emit_text_node: ee,
      emit_html_node: it,
      emit_dynamic_text_node: nt,
      emit_comment_node: st,
      emit_fragment_node: lt,
      emit_element_node: at,
      emit_integrated_node: rt,
      emit_component_node: ot
    }, l = new Ue();
    l.create = l.addFunction("create").code, l.bind = l.addFunction("bind").code, l.update = l.addFunction("update").code, l.unbind = l.addFunction("unbind").code, l.destroy = l.addFunction("destroy").code;
    let L;
    f && (L = l.addFunction("rebind").code);
    let p = /* @__PURE__ */ new Map();
    f && (o = l, o.code.append("let model = context.model;")), l.code.append("create();"), l.code.append("bind();"), l.code.append("update();"), K(u);
    for (let i of u.enumLocalNodes())
      ht(i);
    l.bind.closure.isEmpty || (l.create.append("bind();"), l.destroy.closure.addProlog().append("unbind();"));
    let $ = [];
    return u.isSingleRoot && $.push(`  get rootNode() { return ${u.spreadDomNodes()}; },`), f ? ($.push("  context,"), u == d && h.forEach((i, c) => $.push(`  get ${c}() { return ${i}; },`)), l.getFunction("bind").isEmpty ? L.append("model = context.model") : (L.append("if (model != context.model)"), L.braced(() => {
      L.append("unbind();"), L.append("model = context.model"), L.append("bind();");
    })), $.push("  rebind,")) : ($.push("  bind,"), $.push("  unbind,")), l.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${u.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${u.isSingleRoot},`,
      ...$,
      "};"
    ]), l;
    function x(i) {
      i.template.export ? o.addLocal(i.name) : l.addLocal(i.name);
    }
    function I() {
      l.update.temp_declared || (l.update.temp_declared = !0, l.update.append("let temp;"));
    }
    function K(i) {
      i.name = `n${t++}`, y[`emit_${i.kind}_node`](i);
    }
    function ee(i) {
      x(i), l.create.append(`${i.name} = document.createTextNode(${JSON.stringify(i.template)});`);
    }
    function it(i) {
      i.nodes.length != 0 && (x(i), i.nodes.length == 1 ? (l.create.append(`${i.name} = refs[${s.length}].cloneNode(true);`), s.push(i.nodes[0])) : (l.create.append(`${i.name} = refs[${s.length}].map(x => x.cloneNode(true));`), s.push(i.nodes)));
    }
    function nt(i) {
      x(i);
      let c = `p${n++}`;
      l.addLocal(c), l.create.append(`${i.name} = helpers.createTextNode("");`), I(), l.update.append(`temp = ${j(s.length)};`), l.update.append(`if (temp !== ${c})`), l.update.append(`  ${i.name} = helpers.setNodeText(${i.name}, ${c} = ${j(s.length)});`), s.push(i.template);
    }
    function st(i) {
      if (x(i), i.template.text instanceof Function) {
        let c = `p${n++}`;
        l.addLocal(c), l.create.append(`${i.name} = document.createComment("");`), I(), l.update.append(`temp = ${j(s.length)};`), l.update.append(`if (temp !== ${c})`), l.update.append(`  ${i.name}.nodeValue = ${c} = temp;`), s.push(i.template.text);
      } else
        l.create.append(`${i.name} = document.createComment(${JSON.stringify(i.template.text)});`);
    }
    function rt(i) {
      let c = [], E = !1;
      if (i.integrated.nodes)
        for (let m = 0; m < i.integrated.nodes.length; m++) {
          let v = i.integrated.nodes[m];
          v.name = `n${t++}`;
          let _ = g(v, !1);
          _.getFunction("bind").isEmpty || (E = !0);
          let Pe = `${v.name}_constructor_${m + 1}`, ut = l.addFunction(Pe, []);
          _.appendTo(ut.code), c.push(Pe);
        }
      i.integrated.wantsUpdate && l.update.append(`${i.name}.update()`), E && (l.bind.append(`${i.name}.bind()`), l.unbind.append(`${i.name}.unbind()`));
      let T = -1;
      i.integrated.data && (T = s.length, s.push(i.integrated.data)), x(i), l.create.append(
        `${i.name} = new refs[${s.length}]({`,
        "  context,",
        `  data: ${i.integrated.data ? `refs[${T}]` : "null"},`,
        `  nodes: [ ${c.join(", ")} ],`,
        "});"
      ), s.push(i.template.type);
      for (let m of Object.keys(i.template))
        if (!Te(i, m))
          throw new Error(`Unknown element template key: ${m}`);
    }
    function ot(i) {
      x(i), l.create.append(`${i.name} = new refs[${s.length}]();`), s.push(i.template.type);
      let c = new Set(i.template.type.slots ?? []), E = i.template.update === "auto", T = !1;
      for (let m of Object.keys(i.template)) {
        if (Te(i, m) || m == "update")
          continue;
        if (c.has(m)) {
          if (i.template[m] === void 0)
            continue;
          let _ = new Q(i.template[m]);
          K(_), _.isSingleRoot ? l.create.append(`${i.name}${Z(m)}.content = ${_.name};`) : l.create.append(`${i.name}${Z(m)}.content = [${_.spreadDomNodes()}];`);
          continue;
        }
        let v = typeof i.template[m];
        if (v == "string" || v == "number" || v == "boolean")
          l.create.append(`${i.name}${Z(m)} = ${JSON.stringify(i.template[m])}`);
        else if (v === "function") {
          E && !T && (T = `${i.name}_mod`, l.update.append(`let ${T} = false;`));
          let _ = `p${n++}`;
          l.addLocal(_);
          let He = s.length;
          I(), l.update.append(`temp = ${j(He)};`), l.update.append(`if (temp !== ${_})`), E && (l.update.append("{"), l.update.append(`  ${T} = true;`)), l.update.append(`  ${i.name}${Z(m)} = ${_} = temp;`), E && l.update.append("}"), s.push(i.template[m]);
        } else {
          let _ = i.template[m];
          _ instanceof Xe && (_ = _.value), l.create.append(`${i.name}${Z(m)} = refs[${s.length}];`), s.push(_);
        }
      }
      i.template.update && (typeof i.template.update == "function" ? (l.update.append(`if (${j(s.length)})`), l.update.append(`  ${i.name}.update();`), s.push(i.template.update)) : E ? T && (l.update.append(`if (${T})`), l.update.append(`  ${i.name}.update();`)) : l.update.append(`${i.name}.update();`));
    }
    function lt(i) {
      qe(i);
    }
    function at(i) {
      var T;
      let c = l.current_xmlns, E = i.template.xmlns;
      E === void 0 && i.template.type == "svg" && (E = "http://www.w3.org/2000/svg"), E == null && (E = l.current_xmlns), x(i), E ? (l.current_xmlns = E, l.create.append(`${i.name} = document.createElementNS(${JSON.stringify(E)}, ${JSON.stringify(i.template.type)});`)) : l.create.append(`${i.name} = document.createElement(${JSON.stringify(i.template.type)});`);
      for (let m of Object.keys(i.template))
        if (!Te(i, m)) {
          if (m == "id") {
            J(i.template.id, (v) => `${i.name}.setAttribute("id", ${v});`);
            continue;
          }
          if (m == "class") {
            J(i.template.class, (v) => `${i.name}.setAttribute("class", ${v});`);
            continue;
          }
          if (m.startsWith("class_")) {
            let v = De(m.substring(6));
            J(i.template[m], (_) => `helpers.setNodeClass(${i.name}, ${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (m == "style") {
            J(i.template.style, (v) => `${i.name}.setAttribute("style", ${v});`);
            continue;
          }
          if (m.startsWith("style_")) {
            let v = De(m.substring(6));
            J(i.template[m], (_) => `helpers.setNodeStyle(${i.name}, ${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (m == "display") {
            if (i.template.display instanceof Function)
              l.addLocal(`${i.name}_prev_display`), J(i.template[m], (v) => `${i.name}_prev_display = helpers.setNodeDisplay(${i.name}, ${v}, ${i.name}_prev_display)`);
            else if (typeof i.template.display == "string")
              l.create.append(`${i.name}.style.display = '${i.template.display}';`);
            else if (i.template.display === !1 || i.template.display === null || i.template.display === void 0)
              l.create.append(`${i.name}.style.display = 'none';`);
            else if (i.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (m.startsWith("attr_")) {
            let v = m.substring(5);
            l.current_xmlns || (v = De(v)), J(i.template[m], (_) => `${i.name}.setAttribute(${JSON.stringify(v)}, ${_})`);
            continue;
          }
          if (m == "text") {
            i.template.text instanceof Function ? J(i.template.text, (v) => `helpers.setElementText(${i.name}, ${v})`) : i.template.text instanceof V && l.create.append(`${i.name}.innerHTML = ${JSON.stringify(i.template.text.html)};`), typeof i.template.text == "string" && l.create.append(`${i.name}.innerText = ${JSON.stringify(i.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${m}`);
        }
      qe(i), (T = i.childNodes) != null && T.length && l.create.append(`${i.name}.append(${i.spreadChildDomNodes()});`), l.current_xmlns = c;
    }
    function qe(i) {
      if (i.childNodes)
        for (let c = 0; c < i.childNodes.length; c++)
          K(i.childNodes[c]);
    }
    function Te(i, c) {
      if (dt(c))
        return !0;
      if (c == "export") {
        if (typeof i.template.export != "string")
          throw new Error("'export' must be a string");
        if (h.has(i.template.export))
          throw new Error(`duplicate export name '${i.template.export}'`);
        return h.set(i.template.export, i.name), !0;
      }
      if (c == "bind") {
        if (!p)
          throw new Error("'bind' can't be used inside 'foreach'");
        if (typeof i.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (p.has(i.template.export))
          throw new Error(`duplicate bind name '${i.template.bind}'`);
        return p.set(i.template.bind, !0), l.bind.append(`model${Z(i.template.bind)} = ${i.name};`), l.unbind.append(`model${Z(i.template.bind)} = null;`), !0;
      }
      if (c.startsWith("on_")) {
        let E = c.substring(3);
        if (!(i.template[c] instanceof Function))
          throw new Error(`event handler for '${c}' is not a function`);
        i.listenerCount || (i.listenerCount = 0), i.listenerCount++;
        let T = `${i.name}_ev${i.listenerCount}`;
        return l.addLocal(T), l.create.append(`${T} = helpers.addEventListener(() => model, ${i.name}, ${JSON.stringify(E)}, refs[${s.length}]);`), s.push(i.template[c]), !0;
      }
      return c == "debug_create" ? (typeof i.template[c] == "function" ? (l.create.append(`if (${j(s.length)})`), l.create.append("  debugger;"), s.push(i.template[c])) : i.template[c] && l.create.append("debugger;"), !0) : c == "debug_update" ? (typeof i.template[c] == "function" ? (l.update.append(`if (${j(s.length)})`), l.update.append("  debugger;"), s.push(i.template[c])) : i.template[c] && l.update.append("debugger;"), !0) : !1;
    }
    function dt(i) {
      return i == "type" || i == "childNodes" || i == "xmlns";
    }
    function j(i) {
      return `refs[${i}].call(model, model, context)`;
    }
    function J(i, c) {
      if (i instanceof Function) {
        let E = `p${n++}`;
        l.addLocal(E), c(), I(), l.update.append(`temp = ${j(s.length)};`), l.update.append(`if (temp !== ${E})`), l.update.append(`  ${c(E + " = temp")};`), s.push(i);
      } else
        l.create.append(c(JSON.stringify(i)));
    }
    function ht(i) {
      if ((i.isComponent || i.isIntegrated) && l.destroy.append(`${i.name}.destroy();`), i.listenerCount)
        for (let c = 0; c < i.listenerCount; c++)
          l.destroy.append(`${i.name}_ev${c + 1}?.();`), l.destroy.append(`${i.name}_ev${c + 1} = null;`);
      i.kind == "html" && i.nodes.length == 0 || l.destroy.append(`${i.name} = null;`);
    }
  }
}
let $t = 1;
function bt(r, e) {
  let t = yt(r), n = new Function("refs", "helpers", "context", t.code), s = function(o) {
    return o || (o = {}), o.$instanceId = $t++, n(t.refs, Ye, o ?? {});
  };
  return s.isSingleRoot = t.isSingleRoot, s;
}
let Nt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function Z(r) {
  return r.match(Nt) ? `.${r}` : `[${JSON.stringify(r)}]`;
}
class et {
  static compile() {
    return bt(...arguments);
  }
}
let he = [], Oe = !1;
function tt(r, e) {
  r && (e = e ?? 0, e != 0 && (Oe = !0), he.push({
    callback: r,
    order: e
  }), he.length == 1 && requestAnimationFrame(function() {
    let t = he;
    Oe && (t.sort((n, s) => s.order - n.order), Oe = !1), he = [];
    for (let n = t.length - 1; n >= 0; n--)
      t[n].callback();
  }));
}
function It(r) {
  he.length == 0 ? r() : tt(r, Number.MAX_SAFE_INTEGER);
}
var O, Y, se;
const q = class q extends EventTarget {
  constructor() {
    super();
    b(this, O, void 0);
    b(this, Y, !1);
    b(this, se, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return et.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    a(this, O) || N(this, O, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return a(this, O) || this.init(), a(this, O);
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
    a(this, O) && (this.invalid || (this.invalid = !0, q.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && tt(() => {
      for (let n = 0; n < this._invalidComponents.length; n++)
        this._invalidComponents[n].validate();
      this._invalidComponents = [];
    }, q.nextFrameOrder);
  }
  update() {
    a(this, O) && (this.invalid = !1, this.dom.update(), a(this, se) && !a(this, Y) && (N(this, se, !1), this.dispatchEvent(new Event("loaded"))));
  }
  destroy() {
    a(this, O) && (a(this, O).destroy(), N(this, O, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    a(this, O) && this.rootNodes.forEach((t) => t.remove());
  }
  get loading() {
    return a(this, Y);
  }
  set loading(t) {
    t != a(this, Y) && (N(this, Y, t), t && N(this, se, !0), this.invalidate());
  }
};
O = new WeakMap(), Y = new WeakMap(), se = new WeakMap(), le(q, "_compiledTemplate"), le(q, "nextFrameOrder", -100), le(q, "_invalidComponents", []), le(q, "template", {});
let ze = q;
class Ft {
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
    return new V(e);
  }
}
var z;
const Ee = class Ee extends Array {
  constructor() {
    super(...arguments);
    b(this, z, []);
  }
  static from() {
    return new Ee(...arguments);
  }
  addListener(t) {
    a(this, z).push(t);
  }
  removeListener(t) {
    let n = a(this, z).indexOf(fn);
    n >= 0 && a(this, z).splice(n, 1);
  }
  fire(t, n, s) {
    (n != 0 || s != 0) && a(this, z).forEach((o) => o(t, n, s));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, z).forEach((n) => n(t, 0, 0));
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
    let s = super.splice(...arguments);
    return this.fire(t, n, arguments.length > 2 ? arguments.length - 2 : 0), s;
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
    return new Ee(...t);
  }
};
z = new WeakMap();
let Ze = Ee;
function wt(r) {
  let e = "^", t = r.length, n;
  for (let o = 0; o < t; o++) {
    n = !0;
    let d = r[o];
    if (d == "?")
      e += "[^\\/]";
    else if (d == "*")
      e += "[^\\/]+";
    else if (d == ":") {
      o++;
      let h = o;
      for (; o < t && s(r[o]); )
        o++;
      let S = r.substring(h, o);
      if (S.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let g = "[^\\/]+";
      if (r[o] == "(") {
        o++, h = o;
        let u = 0;
        for (; o < t; ) {
          if (r[o] == "(")
            u++;
          else if (r[o] == ")") {
            if (u == 0)
              break;
            u--;
          }
          o++;
        }
        if (o >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        g = r.substring(h, o), o++;
      }
      if (o < t && r[o] == "*" || r[o] == "+") {
        let u = r[o];
        o++, r[o] == "/" ? (e += `(?<${S}>(?:${g}\\/)${u})`, o++) : u == "*" ? e += `(?<${S}>(?:${g}\\/)*(?:${g})?\\/?)` : e += `(?<${S}>(?:${g}\\/)*(?:${g})\\/?)`, n = !1;
      } else
        e += `(?<${S}>${g})`;
      o--;
    } else
      d == "/" ? (e += "\\" + d, o == r.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(d) >= 0 ? (e += "\\" + d, n = d != "/") : e += d;
  }
  return n && (e += "\\/?"), e += "$", e;
  function s(o) {
    return o >= "a" && o <= "z" || o >= "A" && o <= "Z" || o >= "0" && o <= "9" || o == "_" || o == "$";
  }
}
function kt(r) {
  return r == null ? "" : ("" + r).replace(/["'&<>]/g, function(e) {
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
class Ae {
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
var M, Ne, C, re, oe;
class St extends EventTarget {
  constructor() {
    super(...arguments);
    b(this, M, {});
    // Prefix for all url matching
    b(this, Ne, void 0);
    // The current route
    b(this, C, void 0);
    b(this, re, []);
    b(this, oe, !1);
  }
  start() {
    let t = window.sessionStorage.getItem("codeonly-view-states");
    t && N(this, M, JSON.parse(t)), this.load(window.location.pathname, window.history.state ?? { sequence: 0 }), window.history.replaceState(a(this, C).state, null), document.body.addEventListener("click", (n) => {
      let s = n.target.closest("a");
      if (s) {
        let o = s.getAttribute("href");
        this.navigate(o) && n.preventDefault();
      }
    }), window.addEventListener("popstate", (n) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage(), this.load(document.location.pathname, n.state);
    }), window.addEventListener("beforeunload", (n) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage();
    }), window.history.scrollRestoration && (window.history.scrollRestoration = "manual");
  }
  saveViewStatesToLocalStorage() {
    window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(a(this, M)));
  }
  captureCurrentViewState() {
    a(this, C) && (a(this, M)[a(this, C).state.sequence] = a(this, C).handler.captureViewState());
  }
  get prefix() {
    return a(this, Ne);
  }
  set prefix(t) {
    N(this, Ne, t);
  }
  get current() {
    return a(this, C);
  }
  navigate(t) {
    if (!t.startsWith("/") || this.prefix && t != this.prefix && !t.startsWith(this.prefix + "/"))
      return null;
    this.captureCurrentViewState();
    for (let s of Object.keys(a(this, M)))
      parseInt(s) > a(this, C).state.sequence && delete a(this, M)[s];
    this.saveViewStatesToLocalStorage();
    let n = this.load(t, { sequence: a(this, C).state.sequence + 1 });
    return n ? (window.history.pushState(n.state, null, t), !0) : null;
  }
  replace(t) {
    var n;
    a(this, C).url = t, this.prefix && (t = this.prefix + t), a(this, C).originalUrl = t, a(this, C).match = (n = a(this, C).handler.pattern) == null ? void 0 : n.match(a(this, C).url), window.history.replaceState(a(this, C).state, null, t);
  }
  load(t, n) {
    var d, h, S, g, u, f;
    let s = this.matchUrl(t, n);
    if (!s)
      return null;
    (S = (d = a(this, C)) == null ? void 0 : (h = d.handler).leave) == null || S.call(h, a(this, C)), N(this, C, s);
    let o = new Event("navigate");
    return o.route = s, this.dispatchEvent(o), (g = s.page) != null && g.loading ? s.page.addEventListener("loaded", () => {
      var y, l;
      a(this, C) == s && ((l = (y = s.handler).restoreViewState) == null || l.call(y, s.viewState));
    }, { once: !0 }) : (f = (u = s.handler).restoreViewState) == null || f.call(u, s.viewState), s;
  }
  matchUrl(t, n) {
    a(this, oe) && (a(this, re).sort((o, d) => (o.order ?? 0) - (d.order ?? 0)), N(this, oe, !1));
    let s = {
      url: t,
      state: n,
      viewState: a(this, M)[n.sequence],
      originalUrl: t
    };
    if (this.prefix) {
      if (!t.startsWith(this.prefix))
        return null;
      s.url = t.substring(this.prefix.length);
    }
    for (let o of a(this, re)) {
      if (o.pattern && (s.match = s.url.match(o.pattern), !s.match))
        continue;
      let d = o.match(s);
      if (d === !0 || d == s)
        return s.handler = o, s;
      if (d === null)
        return null;
    }
    return s.handler = {}, s;
  }
  back() {
    if (a(this, C).state.sequence == 0) {
      let t = ((this == null ? void 0 : this.prefix) ?? "") + "/";
      this.load(t, { sequence: 0 }), window.history.replaceState(a(this, C).state, null, t);
    } else
      window.history.back();
  }
  register(t) {
    typeof t.pattern == "string" && (t.pattern = wt(t.pattern)), t.captureViewState === void 0 && t.restoreViewState === void 0 && (t.captureViewState = Ae.get, t.restoreViewState = Ae.set), a(this, re).push(t), N(this, oe, !0);
  }
}
M = new WeakMap(), Ne = new WeakMap(), C = new WeakMap(), re = new WeakMap(), oe = new WeakMap();
let Rt = new St();
export {
  Xe as CloakedValue,
  ze as Component,
  Ae as DocumentScrollPosition,
  xe as EmbedSlot,
  ve as ForEachBlock,
  Ft as Html,
  V as HtmlString,
  ue as IfBlock,
  Ze as ObservableArray,
  St as Router,
  Ct as Style,
  et as Template,
  Tt as areSetsEqual,
  Lt as binarySearch,
  De as camel_to_dash,
  _t as cloak,
  Dt as compareStrings,
  Ot as compareStringsI,
  mt as deepEqual,
  xt as html,
  kt as htmlEncode,
  Et as inplace_filter_array,
  Ie as is_constructor,
  tt as nextFrame,
  It as postNextFrame,
  Rt as router,
  wt as urlPattern
};
