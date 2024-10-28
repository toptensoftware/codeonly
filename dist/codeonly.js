var gt = Object.defineProperty;
var He = (r) => {
  throw TypeError(r);
};
var yt = (r, e, t) => e in r ? gt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var ee = (r, e, t) => yt(r, typeof e != "symbol" ? e + "" : e, t), Te = (r, e, t) => e.has(r) || He("Cannot " + t);
var a = (r, e, t) => (Te(r, e, "read from private field"), t ? t.call(r) : e.get(r)), S = (r, e, t) => e.has(r) ? He("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), m = (r, e, t, i) => (Te(r, e, "write to private field"), i ? i.call(r, t) : e.set(r, t), t), x = (r, e, t) => (Te(r, e, "access private method"), t);
var ce = (r, e, t, i) => ({
  set _(n) {
    m(r, e, n, t);
  },
  get _() {
    return a(r, e, i);
  }
});
function Ft(r, e) {
  for (let t = 0; t < r.length; t++)
    e(r[t], t) || (r.splice(t, 1), t--);
}
function De(r) {
  return r.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function Re(r) {
  return r instanceof Function && !!r.prototype && !!r.prototype.constructor;
}
function Rt(r, e) {
  if (r === e) return !0;
  if (r.size !== e.size) return !1;
  for (const t of r) if (!e.has(t)) return !1;
  return !0;
}
function $t(r, e) {
  if (r === e || r === void 0 && e === void 0)
    return !0;
  if (r === void 0 || e === void 0)
    return !1;
  if (r === null && e === null)
    return !0;
  if (r === null || e === null || typeof r != "object" || typeof e != "object")
    return !1;
  let t = Object.getOwnPropertyNames(r), i = Object.getOwnPropertyNames(e);
  if (t.length != i.length)
    return !1;
  for (let n of t)
    if (!Object.hasOwn(e, n) || !$t(r[n], e[n]))
      return !1;
  return !0;
}
function Ot(r, e, t) {
  let i = 0, n = r.length - 1;
  for (; i <= n; ) {
    let o = Math.floor((i + n) / 2), h = r[o], d = e(h, t);
    if (d == 0)
      return o;
    d < 0 ? i = o + 1 : n = o - 1;
  }
  return -1 - i;
}
function It(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function kt(r, e) {
  return r = r.toLowerCase(), e = e.toLowerCase(), r < e ? -1 : r > e ? 1 : 0;
}
let bt = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function te(r) {
  return r.match(bt) ? `.${r}` : `[${JSON.stringify(r)}]`;
}
function wt(r, e) {
  r.loading ? r.addEventListener("loaded", e, { once: !0 }) : e();
}
class M {
  constructor(e) {
    this.html = e;
  }
}
function Mt(r) {
  return new M(r);
}
class Ke {
  constructor(e) {
    this.value = e;
  }
}
function Bt(r) {
  return new Ke(r);
}
function Ne() {
  let r = [], e = "";
  function t(...y) {
    for (let g = 0; g < y.length; g++) {
      let u = y[g];
      u.lines ? r.push(...u.lines.map((v) => e + v)) : Array.isArray(u) ? r.push(...u.filter((v) => v != null).map((v) => e + v)) : r.push(...u.split(`
`).map((v) => e + v));
    }
  }
  function i() {
    e += "  ";
  }
  function n() {
    e = e.substring(2);
  }
  function o() {
    return r.join(`
`) + `
`;
  }
  function h(y) {
    t("{"), i(), y(this), n(), t("}");
  }
  function d(...y) {
    let g = {
      pos: this.lines.length
    };
    return this.append(y), g.headerLineCount = this.lines.length - g.pos, g;
  }
  function p(y, ...g) {
    this.lines.length == y.pos + y.headerLineCount ? this.lines.splice(y.pos, y.headerLineCount) : this.append(g);
  }
  return {
    append: t,
    enterCollapsibleBlock: d,
    leaveCollapsibleBlock: p,
    indent: i,
    unindent: n,
    braced: h,
    toString: o,
    lines: r,
    get isEmpty() {
      return r.length == 0;
    }
  };
}
class je {
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
      code: new je()
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
function Se(r) {
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
class et {
  static rawText(e) {
    return e instanceof M ? e.html : Se(e);
  }
  static renderToString(e) {
    let t = "";
    return e({
      write: function(i) {
        t += i;
      }
    }), t;
  }
  static renderComponentToString(e) {
    let t = "";
    return e.render({
      write: function(i) {
        t += i;
      }
    }), t;
  }
  static rawStyle(e) {
    let t;
    return e instanceof M ? t = e.html : t = Se(e), t = t.trim(), t.endsWith(";") || (t += ";"), t;
  }
  static rawNamedStyle(e, t) {
    if (!t)
      return "";
    let i;
    return t instanceof M ? i = t.html : i = Se(t), i = i.trim(), i += ";", `${e}:${i}`;
  }
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof M) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof M ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof M) {
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
    var i;
    if ((i = e == null ? void 0 : e[0]) != null && i.parentNode) {
      e[0].replaceWith(...t);
      for (let n = 1; n < e.length; n++)
        e[n].remove();
    }
  }
  static addEventListener(e, t, i, n) {
    function o(h) {
      return n(e(), h);
    }
    return t.addEventListener(i, o), function() {
      t.removeEventListener(i, o);
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
    var i;
    let t = (i = b.document) == null ? void 0 : i.createComment(r);
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
      },
      render(n) {
        n.write(`<!--${Se(r)}-->`);
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
class _e {
  static integrate(e, t) {
    let i = [], n = [], o = !1, h = !0;
    for (let d = 0; d < e.branches.length; d++) {
      let p = e.branches[d], y = {};
      if (i.push(y), p.condition instanceof Function ? (y.condition = p.condition, o = !1) : p.condition !== void 0 ? (y.condition = () => p.condition, o = !!p.condition) : (y.condition = () => !0, o = !0), p.template !== void 0) {
        let g = new Q(p.template, t);
        g.isSingleRoot || (h = !1), y.nodeIndex = n.length, n.push(g);
      }
    }
    return delete e.branches, o || i.push({
      condition: () => !0
    }), {
      isSingleRoot: h,
      wantsUpdate: !0,
      nodes: n,
      data: i
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: _e,
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
          type: _e,
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
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(We(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = We(" IfBlock placeholder ")();
  }
  destroy() {
    this.activeBranch.destroy();
  }
  update() {
    this.switchActiveBranch(), this.activeBranch.update();
  }
  render(e) {
    this.activeBranch.render(e);
  }
  unbind() {
    var e, t;
    (t = (e = this.activeBranch).unbind) == null || t.call(e);
  }
  bind() {
    var e, t;
    (t = (e = this.activeBranch).bind) == null || t.call(e);
  }
  switchActiveBranch(e) {
    let t = this.resolveActiveBranch();
    if (t != this.activeBranchIndex) {
      let i = this.activeBranch;
      this.activeBranchIndex = t, this.activeBranch = this.branch_constructors[t](), et.replaceMany(i.rootNodes, this.activeBranch.rootNodes), i.destroy();
    }
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
function vt(r, e) {
  let t = Math.min(r.length, e.length), i = Math.max(r.length, e.length), n = 0;
  for (; n < t && r[n] == e[n]; )
    n++;
  if (n == i)
    return [];
  if (n == r.length)
    return [{
      op: "insert",
      index: r.length,
      count: e.length - r.length
    }];
  let o = 0;
  for (; o < t - n && r[r.length - o - 1] == e[e.length - o - 1]; )
    o++;
  if (o == r.length)
    return [{
      op: "insert",
      index: 0,
      count: e.length - r.length
    }];
  if (n + o == r.length)
    return [{
      op: "insert",
      index: n,
      count: e.length - r.length
    }];
  if (n + o == e.length)
    return [{
      op: "delete",
      index: n,
      count: r.length - e.length
    }];
  let h = r.length - o, d = e.length - o, p = K(e, n, d), y = null, g = [], u = n, v = n;
  for (; u < d; ) {
    for (; u < d && r[v] == e[u]; )
      p.delete(e[u], u), u++, v++;
    let c = u, E = v;
    for (; v < h && !p.has(r[v]); )
      v++;
    if (v > E) {
      g.push({ op: "delete", index: c, count: v - E });
      continue;
    }
    for (y || (y = K(r, u, h)); u < d && !y.has(e[u]); )
      p.delete(e[u], u), u++;
    if (u > c) {
      g.push({ op: "insert", index: c, count: u - c });
      continue;
    }
    break;
  }
  if (u == d)
    return g;
  let l = 0, D = new Ge();
  for (; v < h; ) {
    let c = v;
    for (; v < h && !p.has(r[v]); )
      v++;
    if (v > c) {
      g.push({ op: "delete", index: u, count: v - c });
      continue;
    }
    for (; v < h && p.consume(r[v]) !== void 0; )
      D.add(r[v], l++), v++;
    v > c && g.push({ op: "store", index: u, count: v - c });
  }
  for (; u < d; ) {
    let c = u;
    for (; u < d && !D.has(e[u]); )
      u++;
    if (u > c) {
      g.push({ op: "insert", index: c, count: u - c });
      continue;
    }
    let E = { op: "restore", index: u, count: 0 };
    for (g.push(E); u < d; ) {
      let B = D.consume(e[u]);
      if (B === void 0)
        break;
      E.count == 0 ? (E.storeIndex = B, E.count = 1) : E.storeIndex + E.count == B ? E.count++ : (E = { op: "restore", index: u, storeIndex: B, count: 1 }, g.push(E)), u++;
    }
  }
  return g;
  function K(c, E, B) {
    let he = new Ge();
    for (let de = E; de < B; de++)
      he.add(c[de], de);
    return he;
  }
}
var J;
class Ge {
  constructor() {
    S(this, J, /* @__PURE__ */ new Map());
  }
  // Add a value to a key
  add(e, t) {
    let i = a(this, J).get(e);
    i ? i.push(t) : a(this, J).set(e, [t]);
  }
  delete(e, t) {
    let i = a(this, J).get(e);
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
    let t = a(this, J).get(e);
    if (!(!t || t.length == 0))
      return t.shift();
  }
  // Check if have a key
  has(e) {
    return a(this, J).has(e);
  }
}
J = new WeakMap();
var w, Ie, Ee, H, ne, se, re, tt, ke, it, Me, nt, Be, st, qe, ie;
const ue = class ue {
  constructor(e) {
    S(this, w);
    S(this, H);
    S(this, ne);
    S(this, se);
    S(this, re);
    var t, i;
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = (t = b.document) == null ? void 0 : t.createComment(" enter foreach block "), this.tailSentinal = (i = b.document) == null ? void 0 : i.createComment(" leave foreach block "), this.itemConstructor.isSingleRoot ? (m(this, H, x(this, w, nt)), m(this, se, x(this, w, st)), m(this, ne, x(this, w, Be)), m(this, re, x(this, w, qe))) : (m(this, H, x(this, w, tt)), m(this, se, x(this, w, it)), m(this, ne, x(this, w, ke)), m(this, re, x(this, w, Me)));
  }
  static integrate(e, t) {
    let i = {
      itemConstructor: t.compileTemplate(e.template),
      template: {
        items: e.items,
        condition: e.condition,
        itemKey: e.itemKey
      }
    }, n;
    return e.empty && (n = [new Q(e.empty, t)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: i,
      nodes: n
    };
  }
  static transform(e) {
    if (e.foreach === void 0)
      return e;
    let t;
    return e.foreach instanceof Function || Array.isArray(e.foreach) ? (t = {
      type: ue,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: ue,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = ue.transform(e[t - 1])), e[t - 1].type === ue && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, i) {
    let n = { outer: this.outer };
    if (i == 0 && t == 0) {
      let o = this.observableItems[e], h = [o], d = null;
      this.itemKey && (n.model = o, d = [this.itemKey.call(o, o, n)]), x(this, w, ie).call(this, h, d, e, 0, 1);
    } else {
      let o = null, h = this.observableItems.slice(e, e + i);
      this.itemKey && (o = h.map((d) => (n.model = d, this.itemKey.call(d, d, n)))), i && t ? x(this, w, Ie).call(this, e, t, h, o) : t != 0 ? a(this, se).call(this, e, t) : i != 0 && a(this, H).call(this, h, o, e, 0, i), x(this, w, Ee).call(this);
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
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), a(this, se).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, i = null;
    if (this.observableItems || this.condition && (e = e.filter((n) => (t.model = n, this.condition.call(n, n, t)))), this.itemKey && (i = e.map((n) => (t.model = n, this.itemKey.call(n, n, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, a(this, H).call(this, e, i, 0, 0, e.length), x(this, w, Ee).call(this);
      return;
    }
    this.observableItems || x(this, w, Ie).call(this, 0, this.itemDoms.length, e, i);
  }
  render(e) {
    e.write("<!-- enter foreach block -->");
    for (let t = 0; t < this.itemDoms.length; t++)
      this.itemDoms[t].render(e);
    e.write("<!-- leave foreach block -->");
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
  get isAttached() {
    var e;
    return ((e = this.tailSentinal) == null ? void 0 : e.parentNode) != null;
  }
};
w = new WeakSet(), Ie = function(e, t, i, n) {
  let o = e + t, h;
  e == 0 && t == this.itemDoms.length ? h = this.itemDoms : h = this.itemDoms.slice(e, o);
  let d;
  if (n ? d = vt(h.map((c) => c.context.key), n) : i.length > h.length ? d = [{
    op: "insert",
    index: h.length,
    count: i.length - h.length
  }] : i.length < h.length ? d = [{
    op: "delete",
    index: i.length,
    count: h.length - i.length
  }] : d = [], d.length == 0) {
    x(this, w, ie).call(this, i, n, e, 0, t);
    return;
  }
  let p = [], y = [], g = {
    insert: v,
    delete: l,
    store: D,
    restore: K
  }, u = 0;
  for (let c of d)
    c.index > u && (x(this, w, ie).call(this, i, n, e + u, u, c.index - u), u = c.index), g[c.op].call(this, c);
  u < i.length && x(this, w, ie).call(this, i, n, e + u, u, i.length - u);
  for (let c = y.length - 1; c >= 0; c--)
    y[c].destroy();
  x(this, w, Ee).call(this);
  function v(c) {
    u += c.count;
    let E = Math.min(y.length, c.count);
    E && (a(this, ne).call(this, c.index + e, y.splice(0, E)), x(this, w, ie).call(this, i, n, c.index + e, c.index, E)), E < c.count && a(this, H).call(this, i, n, c.index + e + E, c.index + E, c.count - E);
  }
  function l(c) {
    y.push(...a(this, re).call(this, c.index + e, c.count));
  }
  function D(c) {
    p.push(...a(this, re).call(this, c.index + e, c.count));
  }
  function K(c) {
    u += c.count, a(this, ne).call(this, c.index + e, p.slice(c.storeIndex, c.storeIndex + c.count)), x(this, w, ie).call(this, i, n, c.index + e, c.index, c.count);
  }
}, Ee = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.isAttached && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.isAttached)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, H = new WeakMap(), ne = new WeakMap(), se = new WeakMap(), re = new WeakMap(), tt = function(e, t, i, n, o) {
  let h = [];
  for (let d = 0; d < o; d++) {
    let p = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: i + d
    };
    h.push(this.itemConstructor(p));
  }
  x(this, w, ke).call(this, i, h);
}, ke = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let i = [];
    t.forEach((o) => i.push(...o.rootNodes));
    let n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNodes[0] : n = this.tailSentinal, n.before(...i);
  }
}, it = function(e, t) {
  let i = x(this, w, Me).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    i[n].destroy();
}, Me = function(e, t) {
  let i = this.isAttached;
  for (let n = 0; n < t; n++)
    if (i) {
      let o = this.itemDoms[e + n].rootNodes;
      for (let h = 0; h < o.length; h++)
        o[h].remove();
    }
  return this.itemDoms.splice(e, t);
}, nt = function(e, t, i, n, o) {
  let h = [];
  for (let d = 0; d < o; d++) {
    let p = {
      outer: this.outer,
      model: e[n + d],
      key: t == null ? void 0 : t[n + d],
      index: i + d
    };
    h.push(this.itemConstructor(p));
  }
  x(this, w, Be).call(this, i, h);
}, Be = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let i = t.map((o) => o.rootNode), n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNode : n = this.tailSentinal, n.before(...i);
  }
}, st = function(e, t) {
  let i = x(this, w, qe).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    i[n].destroy();
}, qe = function(e, t) {
  let i = this.isAttached;
  for (let n = 0; n < t; n++)
    i && this.itemDoms[e + n].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, ie = function(e, t, i, n, o) {
  for (let h = 0; h < o; h++) {
    let d = this.itemDoms[i + h];
    d.context.key = t == null ? void 0 : t[n + h], d.context.index = i + h, d.context.model = e[n + h], d.rebind(), d.update();
  }
};
let Oe = ue;
var q, U, F, oe, T, ae, pe, W, G;
const fe = class fe {
  constructor(e) {
    S(this, q);
    S(this, U);
    S(this, F);
    // either #content, or if #content is a function the return value from the function
    S(this, oe);
    S(this, T);
    S(this, ae);
    S(this, pe);
    S(this, W);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    S(this, G, !0);
    var t, i;
    m(this, q, e.context), m(this, pe, e.nodes[1]), m(this, oe, (t = b.document) == null ? void 0 : t.createTextNode("")), m(this, ae, (i = b.document) == null ? void 0 : i.createTextNode("")), m(this, T, []), m(this, G, e.data.ownsContent ?? !0), e.nodes[0] ? this.content = e.nodes[0]() : this.content = e.data.content;
  }
  static integrate(e, t) {
    let i = null;
    e.content && typeof e.content == "object" && (i = e.content, delete e.content);
    let n = {
      isSingleRoot: !1,
      wantsUpdate: !0,
      data: {
        ownsContent: e.ownsContent ?? !0,
        content: e.content
      },
      nodes: [
        i ? new Q(i, t) : null,
        e.placeholder ? new Q(e.placeholder, t) : null
      ]
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, n;
  }
  static transform(e) {
    return e instanceof Function && !Re(e) ? {
      type: fe,
      content: e
    } : (e.type == "embed-slot" && (e.type = fe), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = fe.transform(e[t - 1]), e[t - 1].type === fe && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      a(this, oe),
      ...a(this, T),
      a(this, ae)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return a(this, G);
  }
  set ownsContent(e) {
    m(this, G, e);
  }
  get content() {
    return a(this, U);
  }
  set content(e) {
    m(this, U, e), a(this, U) instanceof Function ? this.replaceContent(a(this, U).call(a(this, q).model, a(this, q).model, a(this, q))) : this.replaceContent(a(this, U));
  }
  update() {
    a(this, U) instanceof Function && this.replaceContent(a(this, U).call(a(this, q).model, a(this, q).model, a(this, q)));
  }
  bind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, F)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, W) && ((t = (e = a(this, F)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  get isAttached() {
    var e;
    return ((e = a(this, oe)) == null ? void 0 : e.parentNode) != null;
  }
  replaceContent(e) {
    var t, i;
    if (!(e == a(this, F) || !e && a(this, W))) {
      if (this.isAttached) {
        let n = a(this, oe).nextSibling;
        for (; n != a(this, ae); ) {
          let o = n.nextSibling;
          n.remove(), n = o;
        }
      }
      if (m(this, T, []), a(this, G) && ((i = (t = a(this, F)) == null ? void 0 : t.destroy) == null || i.call(t)), m(this, F, e), m(this, W, !1), !e)
        a(this, pe) && (m(this, F, a(this, pe).call(this, a(this, q))), m(this, W, !0), m(this, T, a(this, F).rootNodes));
      else if (e.rootNodes !== void 0)
        m(this, T, e.rootNodes);
      else if (Array.isArray(e))
        m(this, T, e);
      else if (b.Node !== void 0 && e instanceof b.Node)
        m(this, T, [e]);
      else if (e instanceof M) {
        let n = b.document.createElement("span");
        n.innerHTML = e.html, m(this, T, [...n.childNodes]);
      } else if (typeof e == "string")
        m(this, T, [b.document.createTextNode(e)]);
      else if (e.render)
        m(this, T, []);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      this.isAttached && a(this, ae).before(...a(this, T));
    }
  }
  destroy() {
    var e, t;
    a(this, G) && ((t = (e = a(this, F)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
  render(e) {
    var t, i;
    a(this, F) && ((i = (t = a(this, F)).render) == null || i.call(t, e));
  }
};
q = new WeakMap(), U = new WeakMap(), F = new WeakMap(), oe = new WeakMap(), T = new WeakMap(), ae = new WeakMap(), pe = new WeakMap(), W = new WeakMap(), G = new WeakMap();
let Ae = fe;
class Ue {
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
ee(Ue, "plugins", [
  Oe,
  Ae,
  _e
]);
class Q {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e, t) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = Ue.transform(e), Re(e) && (e = { type: e }), this.template = e, Re(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof M) {
      if (this.kind = "html", this.html = e.html, b.document) {
        let i = b.document.createElement("div");
        i.innerHTML = e.html, this.nodes = [...i.childNodes], this.nodes.forEach((n) => n.remove());
      }
    } else e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (e.$ && !e.content && (e.content = e.$, delete e.$), this.integrated = this.template.type.integrate(this.template, t)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof M) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((i) => {
        i._ && !i.type && (i.type = i._, delete i._);
      }), Ue.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((i) => new Q(i, t))) : this.childNodes = [];
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
function Nt(r, e) {
  let t = 1, i = 1, n = [], o = null, h = new Q(r, e), d = /* @__PURE__ */ new Map();
  return {
    code: y(h, !0).toString(),
    isSingleRoot: h.isSingleRoot,
    refs: n
  };
  function y(g, u) {
    let v = {
      emit_text_node: de,
      emit_html_node: ot,
      emit_dynamic_text_node: at,
      emit_comment_node: lt,
      emit_fragment_node: ct,
      emit_element_node: ut,
      emit_integrated_node: ht,
      emit_component_node: dt
    }, l = new je();
    l.create = l.addFunction("create").code, l.bind = l.addFunction("bind").code, l.update = l.addFunction("update").code, l.unbind = l.addFunction("unbind").code, l.destroy = l.addFunction("destroy").code;
    let D;
    u && (D = l.addFunction("rebind").code);
    let K = /* @__PURE__ */ new Map();
    u && (o = l, o.code.append("let model = context.model;"), o.code.append("let document = env.document;")), l.code.append("create();"), l.code.append("bind();"), l.code.append("update();"), he(g);
    for (let s of g.enumLocalNodes())
      pt(s);
    l.bind.closure.isEmpty || (l.create.append("bind();"), l.destroy.closure.addProlog().append("unbind();"));
    let c = [];
    return g.isSingleRoot && c.push(`  get rootNode() { return ${g.spreadDomNodes()}; },`), u ? (c.push("  context,"), g == h && d.forEach((s, f) => c.push(`  get ${f}() { return ${s}; },`)), l.getFunction("bind").isEmpty ? D.append("model = context.model") : (D.append("if (model != context.model)"), D.braced(() => {
      D.append("unbind();"), D.append("model = context.model"), D.append("bind();");
    })), c.push("  rebind,")) : (c.push("  bind,"), c.push("  unbind,")), l.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${g.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${g.isSingleRoot},`,
      ...c,
      "};"
    ]), l;
    function E(s) {
      s.template.export ? o.addLocal(s.name) : l.addLocal(s.name);
    }
    function B() {
      l.update.temp_declared || (l.update.temp_declared = !0, l.update.append("let temp;"));
    }
    function he(s) {
      s.name = `n${t++}`, v[`emit_${s.kind}_node`](s);
    }
    function de(s) {
      E(s), l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function ot(s) {
      s.nodes.length != 0 && (E(s), s.nodes.length == 1 ? (l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`), n.push(s.nodes[0])) : (l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`), n.push(s.nodes)));
    }
    function at(s) {
      E(s);
      let f = `p${i++}`;
      l.addLocal(f), l.create.append(`${s.name} = helpers.createTextNode("");`), B(), l.update.append(`temp = ${V(n.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${f} = ${V(n.length)});`), n.push(s.template);
    }
    function lt(s) {
      if (E(s), s.template.text instanceof Function) {
        let f = `p${i++}`;
        l.addLocal(f), l.create.append(`${s.name} = document.createComment("");`), B(), l.update.append(`temp = ${V(n.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name}.nodeValue = ${f} = temp;`), n.push(s.template.text);
      } else
        l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function ht(s) {
      let f = [], L = !1;
      if (s.integrated.nodes)
        for (let $ = 0; $ < s.integrated.nodes.length; $++) {
          let N = s.integrated.nodes[$];
          if (!N) {
            f.push(null);
            continue;
          }
          N.name = `n${t++}`;
          let _ = y(N, !1);
          _.getFunction("bind").isEmpty || (L = !0);
          let Je = `${N.name}_constructor_${$ + 1}`, mt = l.addFunction(Je, []);
          _.appendTo(mt.code), f.push(Je);
        }
      s.integrated.wantsUpdate && l.update.append(`${s.name}.update()`), L && (l.bind.append(`${s.name}.bind()`), l.unbind.append(`${s.name}.unbind()`));
      let C = -1;
      s.integrated.data && (C = n.length, n.push(s.integrated.data)), E(s), l.create.append(
        `${s.name} = new refs[${n.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${C}]` : "null"},`,
        `  nodes: [ ${f.join(", ")} ],`,
        "});"
      ), n.push(s.template.type);
      for (let $ of Object.keys(s.template))
        if (!Ce(s, $))
          throw new Error(`Unknown element template key: ${$}`);
    }
    function dt(s) {
      E(s), l.create.append(`${s.name} = new refs[${n.length}]();`), n.push(s.template.type);
      let f = new Set(s.template.type.slots ?? []), L = s.template.update === "auto", C = !1;
      for (let $ of Object.keys(s.template)) {
        if (Ce(s, $) || $ == "update")
          continue;
        if (f.has($)) {
          if (s.template[$] === void 0)
            continue;
          let _ = new Q(s.template[$], e);
          he(_), _.isSingleRoot ? l.create.append(`${s.name}${te($)}.content = ${_.name};`) : l.create.append(`${s.name}${te($)}.content = [${_.spreadDomNodes()}];`);
          continue;
        }
        let N = typeof s.template[$];
        if (N == "string" || N == "number" || N == "boolean")
          l.create.append(`${s.name}${te($)} = ${JSON.stringify(s.template[$])}`);
        else if (N === "function") {
          L && !C && (C = `${s.name}_mod`, l.update.append(`let ${C} = false;`));
          let _ = `p${i++}`;
          l.addLocal(_);
          let Pe = n.length;
          B(), l.update.append(`temp = ${V(Pe)};`), l.update.append(`if (temp !== ${_})`), L && (l.update.append("{"), l.update.append(`  ${C} = true;`)), l.update.append(`  ${s.name}${te($)} = ${_} = temp;`), L && l.update.append("}"), n.push(s.template[$]);
        } else {
          let _ = s.template[$];
          _ instanceof Ke && (_ = _.value), l.create.append(`${s.name}${te($)} = refs[${n.length}];`), n.push(_);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (l.update.append(`if (${V(n.length)})`), l.update.append(`  ${s.name}.update();`), n.push(s.template.update)) : L ? C && (l.update.append(`if (${C})`), l.update.append(`  ${s.name}.update();`)) : l.update.append(`${s.name}.update();`));
    }
    function ct(s) {
      ze(s);
    }
    function ut(s) {
      var C;
      let f = l.current_xmlns, L = s.template.xmlns;
      L === void 0 && s.template.type == "svg" && (L = "http://www.w3.org/2000/svg"), L == null && (L = l.current_xmlns), E(s), L ? (l.current_xmlns = L, l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(L)}, ${JSON.stringify(s.template.type)});`)) : l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let $ of Object.keys(s.template))
        if (!Ce(s, $)) {
          if ($ == "id") {
            z(s.template.id, (N) => `${s.name}.setAttribute("id", ${N});`);
            continue;
          }
          if ($ == "class") {
            z(s.template.class, (N) => `${s.name}.setAttribute("class", ${N});`);
            continue;
          }
          if ($.startsWith("class_")) {
            let N = De($.substring(6));
            z(s.template[$], (_) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if ($ == "style") {
            z(s.template.style, (N) => `${s.name}.setAttribute("style", ${N});`);
            continue;
          }
          if ($.startsWith("style_")) {
            let N = De($.substring(6));
            z(s.template[$], (_) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if ($ == "display") {
            if (s.template.display instanceof Function)
              l.addLocal(`${s.name}_prev_display`), z(s.template[$], (N) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${N}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              l.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              l.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if ($.startsWith("attr_")) {
            let N = $.substring(5);
            if (N == "style" || N == "class" || N == "id")
              throw new Error(`Incorrect attribute: use '${N}' instead of '${$}'`);
            l.current_xmlns || (N = De(N)), z(s.template[$], (_) => `${s.name}.setAttribute(${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if ($ == "text") {
            s.template.text instanceof Function ? z(s.template.text, (N) => `helpers.setElementText(${s.name}, ${N})`) : s.template.text instanceof M && l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${$}`);
        }
      ze(s), (C = s.childNodes) != null && C.length && l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), l.current_xmlns = f;
    }
    function ze(s) {
      if (s.childNodes)
        for (let f = 0; f < s.childNodes.length; f++)
          he(s.childNodes[f]);
    }
    function Ce(s, f) {
      if (ft(f))
        return !0;
      if (f == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (d.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return d.set(s.template.export, s.name), !0;
      }
      if (f == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (K.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return K.set(s.template.bind, !0), l.bind.append(`model${te(s.template.bind)} = ${s.name};`), l.unbind.append(`model${te(s.template.bind)} = null;`), !0;
      }
      if (f.startsWith("on_")) {
        let L = f.substring(3);
        if (!(s.template[f] instanceof Function))
          throw new Error(`event handler for '${f}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let C = `${s.name}_ev${s.listenerCount}`;
        return l.addLocal(C), l.create.append(`${C} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(L)}, refs[${n.length}]);`), n.push(s.template[f]), !0;
      }
      return f == "debug_create" ? (typeof s.template[f] == "function" ? (l.create.append(`if (${V(n.length)})`), l.create.append("  debugger;"), n.push(s.template[f])) : s.template[f] && l.create.append("debugger;"), !0) : f == "debug_update" ? (typeof s.template[f] == "function" ? (l.update.append(`if (${V(n.length)})`), l.update.append("  debugger;"), n.push(s.template[f])) : s.template[f] && l.update.append("debugger;"), !0) : f == "debug_render";
    }
    function ft(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function V(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function z(s, f) {
      if (s instanceof Function) {
        let L = `p${i++}`;
        l.addLocal(L), f(), B(), l.update.append(`temp = ${V(n.length)};`), l.update.append(`if (temp !== ${L})`), l.update.append(`  ${f(L + " = temp")};`), n.push(s);
      } else
        l.create.append(f(JSON.stringify(s)));
    }
    function pt(s) {
      if ((s.isComponent || s.isIntegrated) && l.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let f = 0; f < s.listenerCount; f++)
          l.destroy.append(`${s.name}_ev${f + 1}?.();`), l.destroy.append(`${s.name}_ev${f + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || l.destroy.append(`${s.name} = null;`);
    }
  }
}
let St = 1;
function rt(r, e) {
  e = e ?? {}, e.compileTemplate = rt;
  let t = Nt(r, e), i = new Function("env", "refs", "helpers", "context", t.code), n = function(o) {
    return o || (o = {}), o.$instanceId = St++, i(b, t.refs, et, o ?? {});
  };
  return n.isSingleRoot = t.isSingleRoot, n;
}
let b = null;
var Z;
class Et extends EventTarget {
  constructor() {
    super();
    S(this, Z, 0);
    this.browser = !1;
  }
  enterLoading() {
    ce(this, Z)._++, a(this, Z) == 1 && this.dispatchEvent(new Event("loading"));
  }
  leaveLoading() {
    ce(this, Z)._--, a(this, Z) == 0 && this.dispatchEvent(new Event("loaded"));
  }
  get loading() {
    return a(this, Z) != 0;
  }
  async load(t) {
    this.enterLoading();
    try {
      return await t();
    } finally {
      this.leaveLoading();
    }
  }
}
Z = new WeakMap();
class xt extends Et {
  constructor() {
    super(), this.browser = !0, this.document = document, this.compileTemplate = rt, this.window = window, this.requestAnimationFrame = window.requestAnimationFrame.bind(window), this.Node = Node;
  }
}
function _t(r) {
  b = r;
}
typeof document < "u" && _t(new xt());
let Ze = [], xe = [], be = null;
class qt {
  static declare(e) {
    Ze.push(e), xe.push(e), b.browser && b.requestAnimationFrame(Lt);
  }
  static get all() {
    return Ze.join(`
`);
  }
}
function Lt() {
  xe.length != 0 && (be == null && (be = document.createElement("style")), be.innerHTML += xe.join(`
`), xe = [], be.parentNode || document.head.appendChild(be));
}
let we = [], Fe = !1;
function Ve(r, e) {
  r && (e = e ?? 0, e != 0 && (Fe = !0), we.push({
    callback: r,
    order: e
  }), we.length == 1 && b.requestAnimationFrame(function() {
    let t = we;
    Fe && (t.sort((i, n) => n.order - i.order), Fe = !1), we = [];
    for (let i = t.length - 1; i >= 0; i--)
      t[i].callback();
  }));
}
function At(r) {
  we.length == 0 ? r() : Ve(r, Number.MAX_SAFE_INTEGER);
}
class Ct {
  static compile() {
    return b.compileTemplate(...arguments);
  }
}
var R, X;
const P = class P extends EventTarget {
  constructor() {
    super();
    S(this, R);
    S(this, X, 0);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return Ct.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    a(this, R) || m(this, R, new this.constructor.compiledTemplate({ model: this }));
  }
  get dom() {
    return a(this, R) || this.init(), a(this, R);
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
    a(this, R) && (this.invalid || (this.invalid = !0, P.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && Ve(() => {
      for (let i = 0; i < this._invalidComponents.length; i++)
        this._invalidComponents[i].validate();
      this._invalidComponents = [];
    }, P.nextFrameOrder);
  }
  update() {
    a(this, R) && (this.invalid = !1, this.dom.update());
  }
  async load(t) {
    ce(this, X)._++, a(this, X) == 1 && (this.invalidate(), b.enterLoading(), this.dispatchEvent(new Event("loading")));
    try {
      return await t();
    } finally {
      ce(this, X)._--, a(this, X) == 0 && (this.invalidate(), this.dispatchEvent(new Event("loaded")), b.leaveLoading());
    }
  }
  get loading() {
    return a(this, X) != 0;
  }
  set loading(t) {
    throw new Error("setting Component.loading not supported, use load() function");
  }
  render(t) {
    this.dom.render(t);
  }
  destroy() {
    a(this, R) && (a(this, R).destroy(), m(this, R, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    a(this, R) && this.rootNodes.forEach((t) => t.remove());
  }
};
R = new WeakMap(), X = new WeakMap(), ee(P, "_compiledTemplate"), ee(P, "nextFrameOrder", -100), ee(P, "_invalidComponents", []), ee(P, "template", {});
let Xe = P;
class Ut {
  static embed(e) {
    return {
      type: "embed-slot",
      content: e
    };
  }
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
    return new M(e);
  }
}
var Y;
const Le = class Le extends Array {
  constructor() {
    super(...arguments);
    S(this, Y, []);
  }
  static from() {
    return new Le(...arguments);
  }
  addListener(t) {
    a(this, Y).push(t);
  }
  removeListener(t) {
    let i = a(this, Y).indexOf(fn);
    i >= 0 && a(this, Y).splice(i, 1);
  }
  fire(t, i, n) {
    (i != 0 || n != 0) && a(this, Y).forEach((o) => o(t, i, n));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, Y).forEach((i) => i(t, 0, 0));
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
    return new Le(...t);
  }
};
Y = new WeakMap();
let Ye = Le;
function Tt(r) {
  let e = "^", t = r.length, i;
  for (let o = 0; o < t; o++) {
    i = !0;
    let h = r[o];
    if (h == "?")
      e += "[^\\/]";
    else if (h == "*")
      e += "[^\\/]+";
    else if (h == ":") {
      o++;
      let d = o;
      for (; o < t && n(r[o]); )
        o++;
      let p = r.substring(d, o);
      if (p.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let y = "[^\\/]+";
      if (r[o] == "(") {
        o++, d = o;
        let g = 0;
        for (; o < t; ) {
          if (r[o] == "(")
            g++;
          else if (r[o] == ")") {
            if (g == 0)
              break;
            g--;
          }
          o++;
        }
        if (o >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        y = r.substring(d, o), o++;
      }
      if (o < t && r[o] == "*" || r[o] == "+") {
        let g = r[o];
        o++, r[o] == "/" ? (e += `(?<${p}>(?:${y}\\/)${g})`, o++) : g == "*" ? e += `(?<${p}>(?:${y}\\/)*(?:${y})?\\/?)` : e += `(?<${p}>(?:${y}\\/)*(?:${y})\\/?)`, i = !1;
      } else
        e += `(?<${p}>${y})`;
      o--;
    } else h == "/" ? (e += "\\" + h, o == r.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(h) >= 0 ? (e += "\\" + h, i = h != "/") : e += h;
  }
  return i && (e += "\\/?"), e += "$", e;
  function n(o) {
    return o >= "a" && o <= "z" || o >= "A" && o <= "Z" || o >= "0" && o <= "9" || o == "_" || o == "$";
  }
}
class jt {
  constructor(e, t) {
    this.el = e, this.targetClass = t, this.entered = !1, this.pendingTransitions = [], this.detecting = !1, this.transitioning = !1, this.el.addEventListener("transitionend", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitioncancel", this.onTransitionEndOrCancel.bind(this)), this.el.addEventListener("transitionrun", this.onTransitionRun.bind(this));
  }
  onTransitionEndOrCancel(e) {
    let t = !1;
    for (let i = 0; i < this.pendingTransitions.length; i++) {
      let n = this.pendingTransitions[i];
      n.target == e.target && n.propertyName == e.propertyName && (this.pendingTransitions.splice(i, 1), t = !0);
    }
    t && this.pendingTransitions.length == 0 && this.onTransitionsFinished();
  }
  onTransitionRun(e) {
    this.detecting && this.pendingTransitions.push({
      target: e.target,
      propertyName: e.propertyName
    });
  }
  detectTransitions() {
    this.transitioning = !0, this.detecting = !0, this.pendingTransitions = [], requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      this.detecting = !1, this.pendingTransitions.length == 0 && this.onTransitionsFinished();
    })));
  }
  onTransitionsFinished() {
    this.el.classList.remove(`${this.targetClass}-start-enter`), this.el.classList.remove(`${this.targetClass}-start-leave`), this.el.classList.remove(`${this.targetClass}-enter`), this.el.classList.remove(`${this.targetClass}-leave`), this.entered ? this.el.classList.add(this.targetClass) : this.el.classList.remove(this.targetClass), this.transitioning = !1;
  }
  enter(e) {
    if (e) {
      (this.transitioning || !this.entered) && (this.entered = !0, this.onTransitionsFinished());
      return;
    }
    this.entered || (this.entered = !0, this.detectTransitions(), this.el.classList.add(this.targetClass, `${this.targetClass}-enter`, `${this.targetClass}-start-enter`), requestAnimationFrame(() => requestAnimationFrame(() => {
      this.el.classList.remove(`${this.targetClass}-start-enter`);
    })));
  }
  leave(e) {
    if (e) {
      (this.transitioning || this.entered) && (this.entered = !1, this.onTransitionsFinished());
      return;
    }
    this.entered && (this.entered = !1, this.detectTransitions(), this.el.classList.add(`${this.targetClass}-leave`, `${this.targetClass}-start-leave`), requestAnimationFrame(() => requestAnimationFrame(() => {
      this.el.classList.remove(`${this.targetClass}-start-leave`);
    })));
  }
  toggle(e) {
    this.entered ? this.leave() : this.enter();
  }
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
var ve, O, k, le, me, ge;
class Vt {
  constructor(e, t) {
    S(this, ve);
    ee(this, "urlMapper");
    // The current route
    S(this, O, null);
    // The route currently being switched to
    S(this, k, null);
    S(this, le, []);
    S(this, me, []);
    S(this, ge, !1);
    m(this, ve, e), e && (this.navigate = e.navigate.bind(e), this.replace = e.navigate.bind(e), this.back = e.back.bind(e)), t && this.register(t);
  }
  start() {
    return a(this, ve).start(this);
  }
  internalize(e) {
    var t;
    return ((t = this.urlMapper) == null ? void 0 : t.internalize(e)) ?? new URL(e);
  }
  externalize(e) {
    var t;
    return ((t = this.urlMapper) == null ? void 0 : t.externalize(e)) ?? new URL(e);
  }
  get current() {
    return a(this, O);
  }
  get pending() {
    return a(this, k);
  }
  addEventListener(e, t) {
    a(this, le).push({ event: e, handler: t });
  }
  removeEventListener(e, t) {
    let i = a(this, le).findIndex((n) => n.event == e && n.handler == t);
    i >= 0 && a(this, le).splice(i, 1);
  }
  async dispatchEvent(e, t, i, n) {
    for (let o of a(this, le))
      if (o.event == e) {
        let h = o.handler(i, n);
        if (t && await Promise.resolve(h) == !1)
          return !1;
      }
    return !0;
  }
  // Load a URL with state
  async load(e, t, i) {
    var o, h, d;
    let n = a(this, O);
    if (((o = a(this, O)) == null ? void 0 : o.url.pathname) == e.pathname && a(this, O).url.search == e.search) {
      let p = (d = (h = a(this, O).handler).hashChange) == null ? void 0 : d.call(h, a(this, O), i);
      p !== void 0 ? i = p : i = Object.assign({}, a(this, O), i);
    }
    if (i = Object.assign(i, {
      current: !1,
      url: e,
      pathname: e.pathname,
      state: t
    }), m(this, k, i), !i.match && (i = await this.matchUrl(e, t, i), !i))
      return null;
    try {
      await this.tryLoad(i) !== !0 && m(this, k, null);
    } catch (p) {
      throw this.dispatchCancelEvents(n, i), p;
    }
    return a(this, k) != i ? (this.dispatchCancelEvents(n, i), null) : (m(this, k, null), i);
  }
  dispatchCancelEvents(e, t) {
    var i, n, o, h, d;
    (o = (i = a(this, O)) == null ? void 0 : (n = i.handler).cancelLeave) == null || o.call(n, e, t), (d = (h = t.handler).cancelEnter) == null || d.call(h, e, t), this.dispatchEvent("cancel", !1, e, t);
  }
  // Fires the sequence of events associated with loading a route
  // 
  // event => mayLeave        |
  // old route => mayLeave    |  Async and cancellable
  // new route => mayEnter    |
  // event => mayEnter        |
  // 
  // event => didLeave        |
  // old route => didLeave    |  Sync and non-cancellable
  // new route => didEnter    |
  // event => didEnter        |
  //
  async tryLoad(e) {
    var n, o, h, d, p, y, g, u;
    let t = a(this, O), i;
    if (!(t && (!await this.dispatchEvent("mayLeave", !0, t, e) || e != a(this, k) || (i = (o = (n = t.handler).mayLeave) == null ? void 0 : o.call(n, t, e), await Promise.resolve(i) === !1) || e != a(this, k))) && (i = (d = (h = e.handler).mayEnter) == null ? void 0 : d.call(h, t, e), await Promise.resolve(i) !== !1 && e == a(this, k) && await this.dispatchEvent("mayEnter", !0, t, e) && e == a(this, k)))
      return t && (t.current = !1), e.current = !0, m(this, O, e), t && (this.dispatchEvent("didLeave", !1, t, e), (y = t == null ? void 0 : (p = t.handler).didLeave) == null || y.call(p, t, e)), (u = (g = e.handler).didEnter) == null || u.call(g, t, e), this.dispatchEvent("didEnter", !1, t, e), !0;
  }
  async matchUrl(e, t, i) {
    a(this, ge) && (a(this, me).sort((n, o) => (n.order ?? 0) - (o.order ?? 0)), m(this, ge, !1));
    for (let n of a(this, me)) {
      if (n.pattern && (i.match = i.pathname.match(n.pattern), !i.match))
        continue;
      let o = await Promise.resolve(n.match(i));
      if (o === !0 || o == i)
        return i.handler = n, i;
      if (o === null)
        return null;
    }
    return i.handler = {}, i;
  }
  register(e) {
    Array.isArray(e) || (e = [e]);
    for (let t of e)
      typeof t.pattern == "string" && (t.pattern = new RegExp(Tt(t.pattern))), a(this, me).push(t);
    m(this, ge, !0);
  }
}
ve = new WeakMap(), O = new WeakMap(), k = new WeakMap(), le = new WeakMap(), me = new WeakMap(), ge = new WeakMap();
var ye, I, $e;
class zt {
  constructor() {
    S(this, ye, 0);
    S(this, I);
    S(this, $e, !1);
  }
  async start(e) {
    m(this, I, e), b.document.body.addEventListener("click", (o) => {
      let h = o.target.closest("a");
      if (h) {
        let d = h.getAttribute("href"), p = new URL(d, b.window.location);
        if (p.origin == b.window.location.origin) {
          try {
            p = a(this, I).internalize(p);
          } catch {
            return;
          }
          if (this.navigate(p))
            return o.preventDefault(), !0;
        }
      }
    }), b.window.addEventListener("popstate", async (o) => {
      if (a(this, $e)) {
        m(this, $e, !1);
        return;
      }
      let h = a(this, ye) + 1, d = a(this, I).internalize(b.window.location), p = o.state ?? { sequence: this.current.state.sequence + 1 };
      await this.load(d, p, { navMode: "pop" }) || h == a(this, ye) && (m(this, $e, !0), b.window.history.go(this.current.state.sequence - p.sequence));
    });
    let t = a(this, I).internalize(b.window.location), i = b.window.history.state ?? { sequence: 0 }, n = await this.load(t, i, { navMode: "start" });
    return b.window.history.replaceState(i, null), n;
  }
  get current() {
    return a(this, I).current;
  }
  async load(e, t, i) {
    return ce(this, ye)._++, await a(this, I).load(e, t, i);
  }
  back() {
    this.current.state.sequence == 0 ? (this.replace("/"), this.load("/", { sequence: 0 }, { navMode: "replace" })) : b.window.history.back();
  }
  replace(e) {
    typeof e == "string" && (e = new URL(e, a(this, I).internalize(b.window.location))), this.current.pathname = e.pathname, this.current.url = e, b.window.history.replaceState(
      this.current.state,
      "",
      a(this, I).externalize(e)
    );
  }
  async navigate(e) {
    typeof e == "string" && (e = new URL(e, a(this, I).internalize(b.window.location)));
    let t = await this.load(
      e,
      { sequence: this.current.state.sequence + 1 },
      { navMode: "push" }
    );
    return t && (b.window.history.pushState(
      t.state,
      "",
      a(this, I).externalize(e)
    ), t);
  }
}
ye = new WeakMap(), I = new WeakMap(), $e = new WeakMap();
class Pt {
  constructor(e) {
    if (this.options = e, this.options.base && (!this.options.base.startsWith("/") || !this.options.base.endsWith("/")))
      throw new Error(`UrlMapper base '${this.options.base}' must start and end with '/'`);
  }
  internalize(e) {
    if (this.options.base) {
      if (!e.pathname.startsWith(this.options.base))
        throw new Error(`Can't internalize url '${e}'`);
      e = new URL(e), e.pathname = e.pathname.substring(this.options.base.length - 1);
    }
    if (this.options.hash) {
      let t = e.hash.substring(1);
      t.startsWith("/") || (t = "/" + t), e = new URL(`${e.origin}${t}`);
    }
    return e;
  }
  externalize(e) {
    return this.options.hash && (e = new URL(`${e.origin}/#${e.pathname}${e.search}${e.hash}`)), this.options.base && (e = new URL(e), e.pathname = this.options.base.slice(0, -1) + e.pathname), e;
  }
}
var j, A;
class Jt {
  constructor(e) {
    S(this, j);
    S(this, A, {});
    m(this, j, e), b.window.history.scrollRestoration && (b.window.history.scrollRestoration = "manual");
    let t = b.window.sessionStorage.getItem("codeonly-view-states");
    t && m(this, A, JSON.parse(t)), e.addEventListener("mayLeave", (i, n) => (this.captureViewState(), !0)), e.addEventListener("mayEnter", (i, n) => {
      n.viewState = a(this, A)[n.state.sequence];
    }), e.addEventListener("didEnter", (i, n) => {
      if (n.navMode == "push") {
        for (let o of Object.keys(a(this, A)))
          parseInt(o) > n.state.sequence && delete a(this, A)[o];
        this.saveViewStates();
      }
      wt(b, () => {
        Ve(() => {
          var o, h;
          if (n.handler.restoreViewState ? n.handler.restoreViewState(n.viewState, n) : a(this, j).restoreViewState ? (h = (o = a(this, j)).restoreViewState) == null || h.call(o, n.viewState, n) : Qe.set(n.viewState), b.browser) {
            let d = document.getElementById(n.url.hash.substring(1));
            d == null || d.scrollIntoView();
          }
        });
      });
    }), b.window.addEventListener("beforeunload", (i) => {
      this.captureViewState();
    });
  }
  captureViewState() {
    var t, i;
    let e = a(this, j).current;
    e && (e.handler.captureViewState ? a(this, A)[e.state.sequence] = e.handler.captureViewState(e) : a(this, j).captureViewState ? a(this, A)[e.state.sequence] = (i = (t = a(this, j)).captureViewState) == null ? void 0 : i.call(t, e) : a(this, A)[e.state.sequence] = Qe.get()), this.saveViewStates();
  }
  saveViewStates() {
    b.window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(a(this, A)));
  }
}
j = new WeakMap(), A = new WeakMap();
export {
  xt as BrowserEnvironment,
  Ke as CloakedValue,
  Xe as Component,
  Qe as DocumentScrollPosition,
  Ae as EmbedSlot,
  Et as EnvironmentBase,
  Oe as ForEachBlock,
  Ut as Html,
  M as HtmlString,
  _e as IfBlock,
  Ye as ObservableArray,
  Vt as Router,
  qt as Style,
  Ct as Template,
  jt as Transition,
  Pt as UrlMapper,
  Jt as ViewStateRestoration,
  zt as WebHistoryRouterDriver,
  Rt as areSetsEqual,
  Ot as binarySearch,
  De as camel_to_dash,
  Bt as cloak,
  It as compareStrings,
  kt as compareStringsI,
  $t as deepEqual,
  b as env,
  Mt as html,
  Se as htmlEncode,
  Ft as inplace_filter_array,
  Re as is_constructor,
  te as member,
  Ve as nextFrame,
  At as postNextFrame,
  _t as setEnvironment,
  Tt as urlPattern,
  wt as whenLoaded
};
