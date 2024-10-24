var dt = Object.defineProperty;
var qe = (r) => {
  throw TypeError(r);
};
var ht = (r, e, t) => e in r ? dt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[e] = t;
var re = (r, e, t) => ht(r, typeof e != "symbol" ? e + "" : e, t), ve = (r, e, t) => e.has(r) || qe("Cannot " + t);
var a = (r, e, t) => (ve(r, e, "read from private field"), t ? t.call(r) : e.get(r)), S = (r, e, t) => e.has(r) ? qe("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(r) : e.set(r, t), y = (r, e, t, i) => (ve(r, e, "write to private field"), i ? i.call(r, t) : e.set(r, t), t), x = (r, e, t) => (ve(r, e, "access private method"), t);
function Nt(r, e) {
  for (let t = 0; t < r.length; t++)
    e(r[t], t) || (r.splice(t, 1), t--);
}
function Se(r) {
  return r.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function _e(r) {
  return r instanceof Function && !!r.prototype && !!r.prototype.constructor;
}
function vt(r, e) {
  if (r === e) return !0;
  if (r.size !== e.size) return !1;
  for (const t of r) if (!e.has(t)) return !1;
  return !0;
}
function ut(r, e) {
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
    if (!Object.hasOwn(e, n) || !ut(r[n], e[n]))
      return !1;
  return !0;
}
function St(r, e, t) {
  let i = 0, n = r.length - 1;
  for (; i <= n; ) {
    let o = Math.floor((i + n) / 2), d = r[o], h = e(d, t);
    if (h == 0)
      return o;
    h < 0 ? i = o + 1 : n = o - 1;
  }
  return -1 - i;
}
function xt(r, e) {
  return r < e ? -1 : r > e ? 1 : 0;
}
function _t(r, e) {
  return r = r.toLowerCase(), e = e.toLowerCase(), r < e ? -1 : r > e ? 1 : 0;
}
let ct = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;
function Z(r) {
  return r.match(ct) ? `.${r}` : `[${JSON.stringify(r)}]`;
}
class I {
  constructor(e) {
    this.html = e;
  }
}
function Tt(r) {
  return new I(r);
}
class Pe {
  constructor(e) {
    this.value = e;
  }
}
function Ct(r) {
  return new Pe(r);
}
function me() {
  let r = [], e = "";
  function t(...m) {
    for (let p = 0; p < m.length; p++) {
      let c = m[p];
      c.lines ? r.push(...c.lines.map(($) => e + $)) : Array.isArray(c) ? r.push(...c.filter(($) => $ != null).map(($) => e + $)) : r.push(...c.split(`
`).map(($) => e + $));
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
  function d(m) {
    t("{"), i(), m(this), n(), t("}");
  }
  function h(...m) {
    let p = {
      pos: this.lines.length
    };
    return this.append(m), p.headerLineCount = this.lines.length - p.pos, p;
  }
  function w(m, ...p) {
    this.lines.length == m.pos + m.headerLineCount ? this.lines.splice(m.pos, m.headerLineCount) : this.append(p);
  }
  return {
    append: t,
    enterCollapsibleBlock: h,
    leaveCollapsibleBlock: w,
    indent: i,
    unindent: n,
    braced: d,
    toString: o,
    lines: r,
    get isEmpty() {
      return r.length == 0;
    }
  };
}
class Ie {
  constructor() {
    this.code = me(), this.code.closure = this, this.functions = [], this.locals = [], this.prologs = [], this.epilogs = [];
  }
  get isEmpty() {
    return this.code.isEmpty && this.locals.length == 0 && this.functions.every((e) => e.code.isEmpty) && this.prologs.every((e) => e.isEmpty) && this.epilogs.every((e) => e.isEmpty);
  }
  addProlog() {
    let e = me();
    return this.prologs.push(e), e;
  }
  addEpilog() {
    let e = me();
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
      code: new Ie()
    };
    return this.functions.push(i), i.code;
  }
  getFunction(e) {
    var t;
    return (t = this.functions.find((i) => i.name == e)) == null ? void 0 : t.code;
  }
  toString() {
    let e = me();
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
function ge(r) {
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
class We {
  static rawText(e) {
    return e instanceof I ? e.html : ge(e);
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
    return e instanceof I ? t = e.html : t = ge(e), t = t.trim(), t.endsWith(";") || (t += ";"), t;
  }
  static rawNamedStyle(e, t) {
    if (!t)
      return "";
    let i;
    return t instanceof I ? i = t.html : i = ge(t), i = i.trim(), i += ";", `${e}:${i}`;
  }
  // Create either a text node from a string, or
  // a SPAN from an HtmlString
  static createTextNode(e) {
    if (e instanceof I) {
      let t = document.createElement("SPAN");
      return t.innerHTML = e.html, t;
    } else
      return document.createTextNode(e);
  }
  // Set either the inner text of an element to a string
  // or the inner html to a HtmlString
  static setElementText(e, t) {
    t instanceof I ? e.innerHTML = t.html : e.innerText = t;
  }
  // Set a node to text or HTML, replacing the 
  // node if it doesn't match the supplied text.
  static setNodeText(e, t) {
    if (t instanceof I) {
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
    function o(d) {
      return n(e(), d);
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
function Ae(r) {
  let e = function() {
    var i;
    let t = (i = C.document) == null ? void 0 : i.createComment(r);
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
        n.write(`<!--${ge(r)}-->`);
      }
    };
  };
  return e.isSingleRoot = !0, e;
}
class be {
  static integrate(e, t) {
    let i = [], n = [], o = !1, d = !0;
    for (let h = 0; h < e.branches.length; h++) {
      let w = e.branches[h], m = {};
      if (i.push(m), w.condition instanceof Function ? (m.condition = w.condition, o = !1) : w.condition !== void 0 ? (m.condition = () => w.condition, o = !!w.condition) : (m.condition = () => !0, o = !0), w.template !== void 0) {
        let p = new G(w.template, t);
        p.isSingleRoot || (d = !1), m.nodeIndex = n.length, n.push(p);
      }
    }
    return delete e.branches, o || i.push({
      condition: () => !0
    }), {
      isSingleRoot: d,
      wantsUpdate: !0,
      nodes: n,
      data: i
    };
  }
  static transform(e) {
    if (e.if === void 0)
      return e;
    let t = {
      type: be,
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
          type: be,
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
      t.nodeIndex !== void 0 ? this.branch_constructors.push(e.nodes[t.nodeIndex]) : this.branch_constructors.push(Ae(" IfBlock placeholder "));
    this.activeBranchIndex = -1, this.activeBranch = Ae(" IfBlock placeholder ")();
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
      this.activeBranchIndex = t, this.activeBranch = this.branch_constructors[t](), We.replaceMany(i.rootNodes, this.activeBranch.rootNodes), i.destroy();
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
function ft(r, e) {
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
  let d = r.length - o, h = e.length - o, w = z(e, n, h), m = null, p = [], c = n, $ = n;
  for (; c < h; ) {
    for (; c < h && r[$] == e[c]; )
      w.delete(e[c], c), c++, $++;
    let u = c, v = $;
    for (; $ < d && !w.has(r[$]); )
      $++;
    if ($ > v) {
      p.push({ op: "delete", index: u, count: $ - v });
      continue;
    }
    for (m || (m = z(r, c, d)); c < h && !m.has(e[c]); )
      w.delete(e[c], c), c++;
    if (c > u) {
      p.push({ op: "insert", index: u, count: c - u });
      continue;
    }
    break;
  }
  if (c == h)
    return p;
  let l = 0, F = new Ve();
  for (; $ < d; ) {
    let u = $;
    for (; $ < d && !w.has(r[$]); )
      $++;
    if ($ > u) {
      p.push({ op: "delete", index: c, count: $ - u });
      continue;
    }
    for (; $ < d && w.consume(r[$]) !== void 0; )
      F.add(r[$], l++), $++;
    $ > u && p.push({ op: "store", index: c, count: $ - u });
  }
  for (; c < h; ) {
    let u = c;
    for (; c < h && !F.has(e[c]); )
      c++;
    if (c > u) {
      p.push({ op: "insert", index: u, count: c - u });
      continue;
    }
    let v = { op: "restore", index: c, count: 0 };
    for (p.push(v); c < h; ) {
      let R = F.consume(e[c]);
      if (R === void 0)
        break;
      v.count == 0 ? (v.storeIndex = R, v.count = 1) : v.storeIndex + v.count == R ? v.count++ : (v = { op: "restore", index: c, storeIndex: R, count: 1 }, p.push(v)), c++;
    }
  }
  return p;
  function z(u, v, R) {
    let ne = new Ve();
    for (let se = v; se < R; se++)
      ne.add(u[se], se);
    return ne;
  }
}
var J;
class Ve {
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
var b, Ce, ye, U, Y, Q, K, Ge, Ee, ze, Le, Ze, De, Xe, Fe, X;
const oe = class oe {
  constructor(e) {
    S(this, b);
    S(this, U);
    S(this, Y);
    S(this, Q);
    S(this, K);
    var t, i;
    this.itemConstructor = e.data.itemConstructor, this.outer = e.context, this.items = e.data.template.items, this.condition = e.data.template.condition, this.itemKey = e.data.template.itemKey, this.emptyConstructor = e.nodes.length ? e.nodes[0] : null, this.itemDoms = [], this.headSentinal = (t = C.document) == null ? void 0 : t.createComment(" enter foreach block "), this.tailSentinal = (i = C.document) == null ? void 0 : i.createComment(" leave foreach block "), this.itemConstructor.isSingleRoot ? (y(this, U, x(this, b, Ze)), y(this, Q, x(this, b, Xe)), y(this, Y, x(this, b, De)), y(this, K, x(this, b, Fe))) : (y(this, U, x(this, b, Ge)), y(this, Q, x(this, b, ze)), y(this, Y, x(this, b, Ee)), y(this, K, x(this, b, Le)));
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
    return e.empty && (n = [new G(e.empty, t)]), delete e.template, delete e.items, delete e.condition, delete e.itemKey, delete e.empty, {
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
      type: oe,
      template: e,
      items: e.foreach
    }, delete e.foreach) : (t = Object.assign({}, e.foreach, {
      type: oe,
      template: e
    }), delete e.foreach), t;
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1].foreach !== void 0 && (e[t - 1] = oe.transform(e[t - 1])), e[t - 1].type === oe && !e[t - 1].else && (delete e[t].else, e[t - 1].empty = e[t], e.splice(t, 1), t--));
  }
  onObservableUpdate(e, t, i) {
    let n = { outer: this.outer };
    if (i == 0 && t == 0) {
      let o = this.observableItems[e], d = [o], h = null;
      this.itemKey && (n.model = o, h = [this.itemKey.call(o, o, n)]), x(this, b, X).call(this, d, h, e, 0, 1);
    } else {
      let o = null, d = this.observableItems.slice(e, e + i);
      this.itemKey && (o = d.map((h) => (n.model = h, this.itemKey.call(h, h, n)))), i && t ? x(this, b, Ce).call(this, e, t, d, o) : t != 0 ? a(this, Q).call(this, e, t) : i != 0 && a(this, U).call(this, d, o, e, 0, i), x(this, b, ye).call(this);
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
    this.items instanceof Function ? e = this.items.call(this.outer.model, this.outer.model, this.outer) : e = this.items, e = e ?? [], this.observableItems != null && this.observableItems != e && this.observableItems.removeListener(this._onObservableUpdate), Array.isArray(e) && e.isObservable && this.observableItems != e && (this._onObservableUpdate = this.onObservableUpdate.bind(this), this.observableItems = e, this.observableItems.addListener(this._onObservableUpdate), a(this, Q).call(this, 0, this.itemDoms.length), this.itemsLoaded = !1);
    let t = {
      outer: this.outer
    }, i = null;
    if (this.observableItems || this.condition && (e = e.filter((n) => (t.model = n, this.condition.call(n, n, t)))), this.itemKey && (i = e.map((n) => (t.model = n, this.itemKey.call(n, n, t)))), !this.itemsLoaded) {
      this.itemsLoaded = !0, a(this, U).call(this, e, i, 0, 0, e.length), x(this, b, ye).call(this);
      return;
    }
    this.observableItems || x(this, b, Ce).call(this, 0, this.itemDoms.length, e, i);
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
b = new WeakSet(), Ce = function(e, t, i, n) {
  let o = e + t, d;
  e == 0 && t == this.itemDoms.length ? d = this.itemDoms : d = this.itemDoms.slice(e, o);
  let h;
  if (n ? h = ft(d.map((u) => u.context.key), n) : i.length > d.length ? h = [{
    op: "insert",
    index: d.length,
    count: i.length - d.length
  }] : i.length < d.length ? h = [{
    op: "delete",
    index: i.length,
    count: d.length - i.length
  }] : h = [], h.length == 0) {
    x(this, b, X).call(this, i, n, e, 0, t);
    return;
  }
  let w = [], m = [], p = {
    insert: $,
    delete: l,
    store: F,
    restore: z
  }, c = 0;
  for (let u of h)
    u.index > c && (x(this, b, X).call(this, i, n, e + c, c, u.index - c), c = u.index), p[u.op].call(this, u);
  c < i.length && x(this, b, X).call(this, i, n, e + c, c, i.length - c);
  for (let u = m.length - 1; u >= 0; u--)
    m[u].destroy();
  x(this, b, ye).call(this);
  function $(u) {
    c += u.count;
    let v = Math.min(m.length, u.count);
    v && (a(this, Y).call(this, u.index + e, m.splice(0, v)), x(this, b, X).call(this, i, n, u.index + e, u.index, v)), v < u.count && a(this, U).call(this, i, n, u.index + e + v, u.index + v, u.count - v);
  }
  function l(u) {
    m.push(...a(this, K).call(this, u.index + e, u.count));
  }
  function F(u) {
    w.push(...a(this, K).call(this, u.index + e, u.count));
  }
  function z(u) {
    c += u.count, a(this, Y).call(this, u.index + e, w.slice(u.storeIndex, u.storeIndex + u.count)), x(this, b, X).call(this, i, n, u.index + e, u.index, u.count);
  }
}, ye = function() {
  if (this.itemDoms.length == 0)
    !this.emptyDom && this.emptyConstructor && (this.emptyDom = this.emptyConstructor(), this.isAttached && this.tailSentinal.before(...this.emptyDom.rootNodes)), this.emptyDom && this.emptyDom.update();
  else if (this.emptyDom) {
    if (this.isAttached)
      for (var e of this.emptyDom.rootNodes)
        e.remove();
    this.emptyDom.destroy(), this.emptyDom = null;
  }
}, U = new WeakMap(), Y = new WeakMap(), Q = new WeakMap(), K = new WeakMap(), Ge = function(e, t, i, n, o) {
  let d = [];
  for (let h = 0; h < o; h++) {
    let w = {
      outer: this.outer,
      model: e[n + h],
      key: t == null ? void 0 : t[n + h],
      index: i + h
    };
    d.push(this.itemConstructor(w));
  }
  x(this, b, Ee).call(this, i, d);
}, Ee = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let i = [];
    t.forEach((o) => i.push(...o.rootNodes));
    let n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNodes[0] : n = this.tailSentinal, n.before(...i);
  }
}, ze = function(e, t) {
  let i = x(this, b, Le).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    i[n].destroy();
}, Le = function(e, t) {
  let i = this.isAttached;
  for (let n = 0; n < t; n++)
    if (i) {
      let o = this.itemDoms[e + n].rootNodes;
      for (let d = 0; d < o.length; d++)
        o[d].remove();
    }
  return this.itemDoms.splice(e, t);
}, Ze = function(e, t, i, n, o) {
  let d = [];
  for (let h = 0; h < o; h++) {
    let w = {
      outer: this.outer,
      model: e[n + h],
      key: t == null ? void 0 : t[n + h],
      index: i + h
    };
    d.push(this.itemConstructor(w));
  }
  x(this, b, De).call(this, i, d);
}, De = function(e, t) {
  if (this.itemDoms.splice(e, 0, ...t), this.isAttached) {
    let i = t.map((o) => o.rootNode), n;
    e + t.length < this.itemDoms.length ? n = this.itemDoms[e + t.length].rootNode : n = this.tailSentinal, n.before(...i);
  }
}, Xe = function(e, t) {
  let i = x(this, b, Fe).call(this, e, t);
  for (let n = i.length - 1; n >= 0; n--)
    i[n].destroy();
}, Fe = function(e, t) {
  let i = this.isAttached;
  for (let n = 0; n < t; n++)
    i && this.itemDoms[e + n].rootNode.remove();
  return this.itemDoms.splice(e, t);
}, X = function(e, t, i, n, o) {
  for (let d = 0; d < o; d++) {
    let h = this.itemDoms[i + d];
    h.context.key = t == null ? void 0 : t[n + d], h.context.index = i + d, h.context.model = e[n + d], h.rebind(), h.update();
  }
};
let Te = oe;
var B, M, O, ee, D, te, ae, H, P;
const le = class le {
  constructor(e) {
    S(this, B);
    S(this, M);
    S(this, O);
    // either #content, or if #content is a function the return value from the function
    S(this, ee);
    S(this, D);
    S(this, te);
    S(this, ae);
    S(this, H);
    // When ownsContent to false old content
    // wont be `destroy()`ed
    S(this, P, !0);
    var t, i;
    y(this, B, e.context), y(this, ae, e.nodes[1]), y(this, ee, (t = C.document) == null ? void 0 : t.createTextNode("")), y(this, te, (i = C.document) == null ? void 0 : i.createTextNode("")), y(this, D, []), y(this, P, e.data.ownsContent ?? !0), e.nodes[0] ? this.content = e.nodes[0]() : this.content = e.data.content;
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
        i ? new G(i, t) : null,
        e.placeholder ? new G(e.placeholder, t) : null
      ]
    };
    return delete e.content, delete e.placeholder, delete e.ownsContent, n;
  }
  static transform(e) {
    return e instanceof Function && !_e(e) ? {
      type: le,
      content: e
    } : (e.type == "embed-slot" && (e.type = le), e);
  }
  static transformGroup(e) {
    for (let t = 1; t < e.length; t++)
      e[t].else !== void 0 && (e[t - 1] = le.transform(e[t - 1]), e[t - 1].type === le && !e[t - 1].placeholder && (delete e[t].else, e[t - 1].placeholder = e[t], e.splice(t, 1), t--));
  }
  get rootNodes() {
    return [
      a(this, ee),
      ...a(this, D),
      a(this, te)
    ];
  }
  get isSingleRoot() {
    return !1;
  }
  get ownsContent() {
    return a(this, P);
  }
  set ownsContent(e) {
    y(this, P, e);
  }
  get content() {
    return a(this, M);
  }
  set content(e) {
    y(this, M, e), a(this, M) instanceof Function ? this.replaceContent(a(this, M).call(a(this, B).model, a(this, B).model, a(this, B))) : this.replaceContent(a(this, M));
  }
  update() {
    a(this, M) instanceof Function && this.replaceContent(a(this, M).call(a(this, B).model, a(this, B).model, a(this, B)));
  }
  bind() {
    var e, t;
    a(this, H) && ((t = (e = a(this, O)) == null ? void 0 : e.bind) == null || t.call(e));
  }
  unbind() {
    var e, t;
    a(this, H) && ((t = (e = a(this, O)) == null ? void 0 : e.unbind) == null || t.call(e));
  }
  get isAttached() {
    var e;
    return ((e = a(this, ee)) == null ? void 0 : e.parentNode) != null;
  }
  replaceContent(e) {
    var t, i;
    if (!(e == a(this, O) || !e && a(this, H))) {
      if (this.isAttached) {
        let n = a(this, ee).nextSibling;
        for (; n != a(this, te); ) {
          let o = n.nextSibling;
          n.remove(), n = o;
        }
      }
      if (y(this, D, []), a(this, P) && ((i = (t = a(this, O)) == null ? void 0 : t.destroy) == null || i.call(t)), y(this, O, e), y(this, H, !1), !e)
        a(this, ae) && (y(this, O, a(this, ae).call(this, a(this, B))), y(this, H, !0), y(this, D, a(this, O).rootNodes));
      else if (e.rootNodes !== void 0)
        y(this, D, e.rootNodes);
      else if (Array.isArray(e))
        y(this, D, e);
      else if (C.Node !== void 0 && e instanceof C.Node)
        y(this, D, [e]);
      else if (e instanceof I) {
        let n = C.document.createElement("span");
        n.innerHTML = e.html, y(this, D, [...n.childNodes]);
      } else if (typeof e == "string")
        y(this, D, [C.document.createTextNode(e)]);
      else if (e.render)
        y(this, D, []);
      else
        throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
      this.isAttached && a(this, te).before(...a(this, D));
    }
  }
  destroy() {
    var e, t;
    a(this, P) && ((t = (e = a(this, O)) == null ? void 0 : e.destroy) == null || t.call(e));
  }
  render(e) {
    var t, i;
    a(this, O) && ((i = (t = a(this, O)).render) == null || i.call(t, e));
  }
};
B = new WeakMap(), M = new WeakMap(), O = new WeakMap(), ee = new WeakMap(), D = new WeakMap(), te = new WeakMap(), ae = new WeakMap(), H = new WeakMap(), P = new WeakMap();
let Oe = le;
class ke {
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
re(ke, "plugins", [
  Te,
  Oe,
  be
]);
class G {
  // Constructs a new TemplateNode
  // - name: the variable name for this node (eg: "n1")
  // - template: the user supplied template object this node is derived from
  constructor(e, t) {
    if (Array.isArray(e) && (e = { $: e }), e._ && !e.type && (e.type = e._, delete e._), e = ke.transform(e), _e(e) && (e = { type: e }), this.template = e, _e(e.type))
      e.type.integrate ? this.kind = "integrated" : this.kind = "component";
    else if (typeof e == "string")
      this.kind = "text";
    else if (e instanceof I) {
      if (this.kind = "html", this.html = e.html, C.document) {
        let i = C.document.createElement("div");
        i.innerHTML = e.html, this.nodes = [...i.childNodes], this.nodes.forEach((n) => n.remove());
      }
    } else e instanceof Function ? this.kind = "dynamic_text" : e.type === "comment" ? this.kind = "comment" : e.type === void 0 ? this.kind = "fragment" : this.kind = "element";
    if (this.kind === "integrated" && (e.$ && !e.content && (e.content = e.$, delete e.$), this.integrated = this.template.type.integrate(this.template, t)), this.kind == "element" && e.$ && !e.text && (typeof e.$ == "string" || e.$ instanceof I) && (e.text = e.$, delete e.$), this.kind == "element" || this.kind == "fragment")
      e.$ && !e.childNodes && (e.childNodes = e.$, delete e.$), e.childNodes ? (Array.isArray(e.childNodes) ? e.childNodes = e.childNodes.flat() : e.childNodes = [e.childNodes], e.childNodes.forEach((i) => {
        i._ && !i.type && (i.type = i._, delete i._);
      }), ke.transformGroup(e.childNodes), this.childNodes = this.template.childNodes.map((i) => new G(i, t))) : this.childNodes = [];
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
function pt(r, e) {
  let t = 1, i = 1, n = [], o = null, d = new G(r, e), h = /* @__PURE__ */ new Map();
  return {
    code: m(d, !0).toString(),
    isSingleRoot: d.isSingleRoot,
    refs: n
  };
  function m(p, c) {
    let $ = {
      emit_text_node: se,
      emit_html_node: Ke,
      emit_dynamic_text_node: et,
      emit_comment_node: tt,
      emit_fragment_node: st,
      emit_element_node: rt,
      emit_integrated_node: it,
      emit_component_node: nt
    }, l = new Ie();
    l.create = l.addFunction("create").code, l.bind = l.addFunction("bind").code, l.update = l.addFunction("update").code, l.unbind = l.addFunction("unbind").code, l.destroy = l.addFunction("destroy").code;
    let F;
    c && (F = l.addFunction("rebind").code);
    let z = /* @__PURE__ */ new Map();
    c && (o = l, o.code.append("let model = context.model;"), o.code.append("let document = Environment.document;")), l.code.append("create();"), l.code.append("bind();"), l.code.append("update();"), ne(p);
    for (let s of p.enumLocalNodes())
      lt(s);
    l.bind.closure.isEmpty || (l.create.append("bind();"), l.destroy.closure.addProlog().append("unbind();"));
    let u = [];
    return p.isSingleRoot && u.push(`  get rootNode() { return ${p.spreadDomNodes()}; },`), c ? (u.push("  context,"), p == d && h.forEach((s, f) => u.push(`  get ${f}() { return ${s}; },`)), l.getFunction("bind").isEmpty ? F.append("model = context.model") : (F.append("if (model != context.model)"), F.braced(() => {
      F.append("unbind();"), F.append("model = context.model"), F.append("bind();");
    })), u.push("  rebind,")) : (u.push("  bind,"), u.push("  unbind,")), l.code.append([
      "return { ",
      "  update,",
      "  destroy,",
      `  get rootNodes() { return [ ${p.spreadDomNodes()} ]; },`,
      `  isSingleRoot: ${p.isSingleRoot},`,
      ...u,
      "};"
    ]), l;
    function v(s) {
      s.template.export ? o.addLocal(s.name) : l.addLocal(s.name);
    }
    function R() {
      l.update.temp_declared || (l.update.temp_declared = !0, l.update.append("let temp;"));
    }
    function ne(s) {
      s.name = `n${t++}`, $[`emit_${s.kind}_node`](s);
    }
    function se(s) {
      v(s), l.create.append(`${s.name} = document.createTextNode(${JSON.stringify(s.template)});`);
    }
    function Ke(s) {
      s.nodes.length != 0 && (v(s), s.nodes.length == 1 ? (l.create.append(`${s.name} = refs[${n.length}].cloneNode(true);`), n.push(s.nodes[0])) : (l.create.append(`${s.name} = refs[${n.length}].map(x => x.cloneNode(true));`), n.push(s.nodes)));
    }
    function et(s) {
      v(s);
      let f = `p${i++}`;
      l.addLocal(f), l.create.append(`${s.name} = helpers.createTextNode("");`), R(), l.update.append(`temp = ${A(n.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name} = helpers.setNodeText(${s.name}, ${f} = ${A(n.length)});`), n.push(s.template);
    }
    function tt(s) {
      if (v(s), s.template.text instanceof Function) {
        let f = `p${i++}`;
        l.addLocal(f), l.create.append(`${s.name} = document.createComment("");`), R(), l.update.append(`temp = ${A(n.length)};`), l.update.append(`if (temp !== ${f})`), l.update.append(`  ${s.name}.nodeValue = ${f} = temp;`), n.push(s.template.text);
      } else
        l.create.append(`${s.name} = document.createComment(${JSON.stringify(s.template.text)});`);
    }
    function it(s) {
      let f = [], E = !1;
      if (s.integrated.nodes)
        for (let g = 0; g < s.integrated.nodes.length; g++) {
          let N = s.integrated.nodes[g];
          if (!N) {
            f.push(null);
            continue;
          }
          N.name = `n${t++}`;
          let _ = m(N, !1);
          _.getFunction("bind").isEmpty || (E = !0);
          let Me = `${N.name}_constructor_${g + 1}`, at = l.addFunction(Me, []);
          _.appendTo(at.code), f.push(Me);
        }
      s.integrated.wantsUpdate && l.update.append(`${s.name}.update()`), E && (l.bind.append(`${s.name}.bind()`), l.unbind.append(`${s.name}.unbind()`));
      let L = -1;
      s.integrated.data && (L = n.length, n.push(s.integrated.data)), v(s), l.create.append(
        `${s.name} = new refs[${n.length}]({`,
        "  context,",
        `  data: ${s.integrated.data ? `refs[${L}]` : "null"},`,
        `  nodes: [ ${f.join(", ")} ],`,
        "});"
      ), n.push(s.template.type);
      for (let g of Object.keys(s.template))
        if (!Ne(s, g))
          throw new Error(`Unknown element template key: ${g}`);
    }
    function nt(s) {
      v(s), l.create.append(`${s.name} = new refs[${n.length}]();`), n.push(s.template.type);
      let f = new Set(s.template.type.slots ?? []), E = s.template.update === "auto", L = !1;
      for (let g of Object.keys(s.template)) {
        if (Ne(s, g) || g == "update")
          continue;
        if (f.has(g)) {
          if (s.template[g] === void 0)
            continue;
          let _ = new G(s.template[g], e);
          ne(_), _.isSingleRoot ? l.create.append(`${s.name}${Z(g)}.content = ${_.name};`) : l.create.append(`${s.name}${Z(g)}.content = [${_.spreadDomNodes()}];`);
          continue;
        }
        let N = typeof s.template[g];
        if (N == "string" || N == "number" || N == "boolean")
          l.create.append(`${s.name}${Z(g)} = ${JSON.stringify(s.template[g])}`);
        else if (N === "function") {
          E && !L && (L = `${s.name}_mod`, l.update.append(`let ${L} = false;`));
          let _ = `p${i++}`;
          l.addLocal(_);
          let Be = n.length;
          R(), l.update.append(`temp = ${A(Be)};`), l.update.append(`if (temp !== ${_})`), E && (l.update.append("{"), l.update.append(`  ${L} = true;`)), l.update.append(`  ${s.name}${Z(g)} = ${_} = temp;`), E && l.update.append("}"), n.push(s.template[g]);
        } else {
          let _ = s.template[g];
          _ instanceof Pe && (_ = _.value), l.create.append(`${s.name}${Z(g)} = refs[${n.length}];`), n.push(_);
        }
      }
      s.template.update && (typeof s.template.update == "function" ? (l.update.append(`if (${A(n.length)})`), l.update.append(`  ${s.name}.update();`), n.push(s.template.update)) : E ? L && (l.update.append(`if (${L})`), l.update.append(`  ${s.name}.update();`)) : l.update.append(`${s.name}.update();`));
    }
    function st(s) {
      Re(s);
    }
    function rt(s) {
      var L;
      let f = l.current_xmlns, E = s.template.xmlns;
      E === void 0 && s.template.type == "svg" && (E = "http://www.w3.org/2000/svg"), E == null && (E = l.current_xmlns), v(s), E ? (l.current_xmlns = E, l.create.append(`${s.name} = document.createElementNS(${JSON.stringify(E)}, ${JSON.stringify(s.template.type)});`)) : l.create.append(`${s.name} = document.createElement(${JSON.stringify(s.template.type)});`);
      for (let g of Object.keys(s.template))
        if (!Ne(s, g)) {
          if (g == "id") {
            V(s.template.id, (N) => `${s.name}.setAttribute("id", ${N});`);
            continue;
          }
          if (g == "class") {
            V(s.template.class, (N) => `${s.name}.setAttribute("class", ${N});`);
            continue;
          }
          if (g.startsWith("class_")) {
            let N = Se(g.substring(6));
            V(s.template[g], (_) => `helpers.setNodeClass(${s.name}, ${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if (g == "style") {
            V(s.template.style, (N) => `${s.name}.setAttribute("style", ${N});`);
            continue;
          }
          if (g.startsWith("style_")) {
            let N = Se(g.substring(6));
            V(s.template[g], (_) => `helpers.setNodeStyle(${s.name}, ${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if (g == "display") {
            if (s.template.display instanceof Function)
              l.addLocal(`${s.name}_prev_display`), V(s.template[g], (N) => `${s.name}_prev_display = helpers.setNodeDisplay(${s.name}, ${N}, ${s.name}_prev_display)`);
            else if (typeof s.template.display == "string")
              l.create.append(`${s.name}.style.display = '${s.template.display}';`);
            else if (s.template.display === !1 || s.template.display === null || s.template.display === void 0)
              l.create.append(`${s.name}.style.display = 'none';`);
            else if (s.template.display !== !0)
              throw new Error("display property must be set to string, true, false, or null");
            continue;
          }
          if (g.startsWith("attr_")) {
            let N = g.substring(5);
            if (N == "style" || N == "class" || N == "id")
              throw new Error(`Incorrect attribute: use '${N}' instead of '${g}'`);
            l.current_xmlns || (N = Se(N)), V(s.template[g], (_) => `${s.name}.setAttribute(${JSON.stringify(N)}, ${_})`);
            continue;
          }
          if (g == "text") {
            s.template.text instanceof Function ? V(s.template.text, (N) => `helpers.setElementText(${s.name}, ${N})`) : s.template.text instanceof I && l.create.append(`${s.name}.innerHTML = ${JSON.stringify(s.template.text.html)};`), typeof s.template.text == "string" && l.create.append(`${s.name}.innerText = ${JSON.stringify(s.template.text)};`);
            continue;
          }
          throw new Error(`Unknown element template key: ${g}`);
        }
      Re(s), (L = s.childNodes) != null && L.length && l.create.append(`${s.name}.append(${s.spreadChildDomNodes()});`), l.current_xmlns = f;
    }
    function Re(s) {
      if (s.childNodes)
        for (let f = 0; f < s.childNodes.length; f++)
          ne(s.childNodes[f]);
    }
    function Ne(s, f) {
      if (ot(f))
        return !0;
      if (f == "export") {
        if (typeof s.template.export != "string")
          throw new Error("'export' must be a string");
        if (h.has(s.template.export))
          throw new Error(`duplicate export name '${s.template.export}'`);
        return h.set(s.template.export, s.name), !0;
      }
      if (f == "bind") {
        if (typeof s.template.bind != "string")
          throw new Error("'bind' must be a string");
        if (z.has(s.template.export))
          throw new Error(`duplicate bind name '${s.template.bind}'`);
        return z.set(s.template.bind, !0), l.bind.append(`model${Z(s.template.bind)} = ${s.name};`), l.unbind.append(`model${Z(s.template.bind)} = null;`), !0;
      }
      if (f.startsWith("on_")) {
        let E = f.substring(3);
        if (!(s.template[f] instanceof Function))
          throw new Error(`event handler for '${f}' is not a function`);
        s.listenerCount || (s.listenerCount = 0), s.listenerCount++;
        let L = `${s.name}_ev${s.listenerCount}`;
        return l.addLocal(L), l.create.append(`${L} = helpers.addEventListener(() => model, ${s.name}, ${JSON.stringify(E)}, refs[${n.length}]);`), n.push(s.template[f]), !0;
      }
      return f == "debug_create" ? (typeof s.template[f] == "function" ? (l.create.append(`if (${A(n.length)})`), l.create.append("  debugger;"), n.push(s.template[f])) : s.template[f] && l.create.append("debugger;"), !0) : f == "debug_update" ? (typeof s.template[f] == "function" ? (l.update.append(`if (${A(n.length)})`), l.update.append("  debugger;"), n.push(s.template[f])) : s.template[f] && l.update.append("debugger;"), !0) : f == "debug_render";
    }
    function ot(s) {
      return s == "type" || s == "childNodes" || s == "xmlns";
    }
    function A(s) {
      return `refs[${s}].call(model, model, context)`;
    }
    function V(s, f) {
      if (s instanceof Function) {
        let E = `p${i++}`;
        l.addLocal(E), f(), R(), l.update.append(`temp = ${A(n.length)};`), l.update.append(`if (temp !== ${E})`), l.update.append(`  ${f(E + " = temp")};`), n.push(s);
      } else
        l.create.append(f(JSON.stringify(s)));
    }
    function lt(s) {
      if ((s.isComponent || s.isIntegrated) && l.destroy.append(`${s.name}.destroy();`), s.listenerCount)
        for (let f = 0; f < s.listenerCount; f++)
          l.destroy.append(`${s.name}_ev${f + 1}?.();`), l.destroy.append(`${s.name}_ev${f + 1} = null;`);
      s.kind == "html" && s.nodes.length == 0 || l.destroy.append(`${s.name} = null;`);
    }
  }
}
let mt = 1;
function Ye(r, e) {
  e = e ?? {}, e.compileTemplate = Ye;
  let t = pt(r, e), i = new Function("Environment", "refs", "helpers", "context", t.code), n = function(o) {
    return o || (o = {}), o.$instanceId = mt++, i(C, t.refs, We, o ?? {});
  };
  return n.isSingleRoot = t.isSingleRoot, n;
}
let C = {};
typeof document < "u" && (C.document = document, C.compileTemplate = Ye);
typeof window < "u" && (C.window = window, C.requestAnimationFrame = window.requestAnimationFrame.bind(window));
typeof Node < "u" && (C.Node = Node);
function Et(r) {
  C = r;
}
let je = [], $e = [], ce = null;
class Lt {
  static declare(e) {
    je.push(e), $e.push(e), C.document && C.requestAnimationFrame(gt);
  }
  static get all() {
    return je.join(`
`);
  }
}
function gt() {
  $e.length != 0 && (ce == null && (ce = document.createElement("style")), ce.innerHTML += $e.join(`
`), $e = [], ce.parentNode || document.head.appendChild(ce));
}
let fe = [], xe = !1;
function Qe(r, e) {
  r && (e = e ?? 0, e != 0 && (xe = !0), fe.push({
    callback: r,
    order: e
  }), fe.length == 1 && C.requestAnimationFrame(function() {
    let t = fe;
    xe && (t.sort((i, n) => n.order - i.order), xe = !1), fe = [];
    for (let i = t.length - 1; i >= 0; i--)
      t[i].callback();
  }));
}
function Dt(r) {
  fe.length == 0 ? r() : Qe(r, Number.MAX_SAFE_INTEGER);
}
class yt {
  static compile() {
    return C.compileTemplate(...arguments);
  }
}
var k, ie, de;
const j = class j extends EventTarget {
  constructor() {
    super();
    S(this, k);
    S(this, ie, !1);
    S(this, de, !1);
    this.update = this.update.bind(this), this.invalidate = this.invalidate.bind(this);
  }
  static get compiledTemplate() {
    return this._compiledTemplate || (this._compiledTemplate = this.compileTemplate()), this._compiledTemplate;
  }
  static compileTemplate() {
    return yt.compile(this.template);
  }
  static get isSingleRoot() {
    return this.compiledTemplate.isSingleRoot;
  }
  init() {
    a(this, k) || y(this, k, new this.constructor.compiledTemplate({ model: this }));
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
    a(this, k) && (this.invalid || (this.invalid = !0, j.invalidate(this)));
  }
  validate() {
    this.invalid && this.update();
  }
  static invalidate(t) {
    this._invalidComponents.push(t), this._invalidComponents.length == 1 && Qe(() => {
      for (let i = 0; i < this._invalidComponents.length; i++)
        this._invalidComponents[i].validate();
      this._invalidComponents = [];
    }, j.nextFrameOrder);
  }
  update() {
    a(this, k) && (this.invalid = !1, this.dom.update(), a(this, de) && !a(this, ie) && (y(this, de, !1), this.dispatchEvent(new Event("loaded"))));
  }
  render(t) {
    this.dom.render(t);
  }
  destroy() {
    a(this, k) && (a(this, k).destroy(), y(this, k, null));
  }
  mount(t) {
    return typeof t == "string" && (t = document.querySelector(t)), t.append(...this.rootNodes), this;
  }
  unmount() {
    a(this, k) && this.rootNodes.forEach((t) => t.remove());
  }
  get loading() {
    return a(this, ie);
  }
  set loading(t) {
    t != a(this, ie) && (y(this, ie, t), t && y(this, de, !0), this.invalidate());
  }
};
k = new WeakMap(), ie = new WeakMap(), de = new WeakMap(), re(j, "_compiledTemplate"), re(j, "nextFrameOrder", -100), re(j, "_invalidComponents", []), re(j, "template", {});
let Je = j;
class Ft {
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
    return new I(e);
  }
}
var W;
const we = class we extends Array {
  constructor() {
    super(...arguments);
    S(this, W, []);
  }
  static from() {
    return new we(...arguments);
  }
  addListener(t) {
    a(this, W).push(t);
  }
  removeListener(t) {
    let i = a(this, W).indexOf(fn);
    i >= 0 && a(this, W).splice(i, 1);
  }
  fire(t, i, n) {
    (i != 0 || n != 0) && a(this, W).forEach((o) => o(t, i, n));
  }
  touch(t) {
    t >= 0 && t < this.length && a(this, W).forEach((i) => i(t, 0, 0));
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
    return new we(...t);
  }
};
W = new WeakMap();
let Ue = we;
function $t(r) {
  let e = "^", t = r.length, i;
  for (let o = 0; o < t; o++) {
    i = !0;
    let d = r[o];
    if (d == "?")
      e += "[^\\/]";
    else if (d == "*")
      e += "[^\\/]+";
    else if (d == ":") {
      o++;
      let h = o;
      for (; o < t && n(r[o]); )
        o++;
      let w = r.substring(h, o);
      if (w.length == 0)
        throw new Error("syntax error in url pattern: expected id after ':'");
      let m = "[^\\/]+";
      if (r[o] == "(") {
        o++, h = o;
        let p = 0;
        for (; o < t; ) {
          if (r[o] == "(")
            p++;
          else if (r[o] == ")") {
            if (p == 0)
              break;
            p--;
          }
          o++;
        }
        if (o >= t)
          throw new Error("syntax error in url pattern: expected ')'");
        m = r.substring(h, o), o++;
      }
      if (o < t && r[o] == "*" || r[o] == "+") {
        let p = r[o];
        o++, r[o] == "/" ? (e += `(?<${w}>(?:${m}\\/)${p})`, o++) : p == "*" ? e += `(?<${w}>(?:${m}\\/)*(?:${m})?\\/?)` : e += `(?<${w}>(?:${m}\\/)*(?:${m})\\/?)`, i = !1;
      } else
        e += `(?<${w}>${m})`;
      o--;
    } else d == "/" ? (e += "\\" + d, o == r.length - 1 && (e += "?")) : ".$^{}[]()|*+?\\/".indexOf(d) >= 0 ? (e += "\\" + d, i = d != "/") : e += d;
  }
  return i && (e += "\\/?"), e += "$", e;
  function n(o) {
    return o >= "a" && o <= "z" || o >= "A" && o <= "Z" || o >= "0" && o <= "9" || o == "_" || o == "$";
  }
}
class He {
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
var q, pe, T, he, ue;
class bt extends EventTarget {
  constructor() {
    super(...arguments);
    S(this, q, {});
    // Prefix for all url matching
    S(this, pe);
    // The current route
    S(this, T);
    S(this, he, []);
    S(this, ue, !1);
  }
  start() {
    let t = window.sessionStorage.getItem("codeonly-view-states");
    t && y(this, q, JSON.parse(t)), this.load(window.location.pathname, window.history.state ?? { sequence: 0 }), window.history.replaceState(a(this, T).state, null), document.body.addEventListener("click", (i) => {
      let n = i.target.closest("a");
      if (n) {
        let o = n.getAttribute("href");
        this.navigate(o) && i.preventDefault();
      }
    }), window.addEventListener("popstate", (i) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage(), this.load(document.location.pathname, i.state);
    }), window.addEventListener("beforeunload", (i) => {
      this.captureCurrentViewState(), this.saveViewStatesToLocalStorage();
    }), window.history.scrollRestoration && (window.history.scrollRestoration = "manual");
  }
  saveViewStatesToLocalStorage() {
    window.sessionStorage.setItem("codeonly-view-states", JSON.stringify(a(this, q)));
  }
  captureCurrentViewState() {
    a(this, T) && (a(this, q)[a(this, T).state.sequence] = a(this, T).handler.captureViewState());
  }
  get prefix() {
    return a(this, pe);
  }
  set prefix(t) {
    y(this, pe, t);
  }
  get current() {
    return a(this, T);
  }
  navigate(t) {
    if (!t.startsWith("/") || this.prefix && t != this.prefix && !t.startsWith(this.prefix + "/"))
      return null;
    this.captureCurrentViewState();
    for (let n of Object.keys(a(this, q)))
      parseInt(n) > a(this, T).state.sequence && delete a(this, q)[n];
    this.saveViewStatesToLocalStorage();
    let i = this.load(t, { sequence: a(this, T).state.sequence + 1 });
    return i ? (window.history.pushState(i.state, null, t), !0) : null;
  }
  replace(t) {
    var i;
    a(this, T).url = t, this.prefix && (t = this.prefix + t), a(this, T).originalUrl = t, a(this, T).match = (i = a(this, T).handler.pattern) == null ? void 0 : i.match(a(this, T).url), window.history.replaceState(a(this, T).state, null, t);
  }
  load(t, i) {
    var d, h, w, m, p, c;
    let n = this.matchUrl(t, i);
    if (!n)
      return null;
    (w = (d = a(this, T)) == null ? void 0 : (h = d.handler).leave) == null || w.call(h, a(this, T)), y(this, T, n);
    let o = new Event("navigate");
    return o.route = n, this.dispatchEvent(o), (m = n.page) != null && m.loading ? n.page.addEventListener("loaded", () => {
      var $, l;
      a(this, T) == n && ((l = ($ = n.handler).restoreViewState) == null || l.call($, n.viewState));
    }, { once: !0 }) : (c = (p = n.handler).restoreViewState) == null || c.call(p, n.viewState), n;
  }
  matchUrl(t, i) {
    a(this, ue) && (a(this, he).sort((o, d) => (o.order ?? 0) - (d.order ?? 0)), y(this, ue, !1));
    let n = {
      url: t,
      state: i,
      viewState: a(this, q)[i.sequence],
      originalUrl: t
    };
    if (this.prefix) {
      if (!t.startsWith(this.prefix))
        return null;
      n.url = t.substring(this.prefix.length);
    }
    for (let o of a(this, he)) {
      if (o.pattern && (n.match = n.url.match(o.pattern), !n.match))
        continue;
      let d = o.match(n);
      if (d === !0 || d == n)
        return n.handler = o, n;
      if (d === null)
        return null;
    }
    return n.handler = {}, n;
  }
  back() {
    if (a(this, T).state.sequence == 0) {
      let t = ((this == null ? void 0 : this.prefix) ?? "") + "/";
      this.load(t, { sequence: 0 }), window.history.replaceState(a(this, T).state, null, t);
    } else
      window.history.back();
  }
  register(t) {
    typeof t.pattern == "string" && (t.pattern = $t(t.pattern)), t.captureViewState === void 0 && t.restoreViewState === void 0 && (t.captureViewState = He.get, t.restoreViewState = He.set), a(this, he).push(t), y(this, ue, !0);
  }
}
q = new WeakMap(), pe = new WeakMap(), T = new WeakMap(), he = new WeakMap(), ue = new WeakMap();
let Ot = new bt();
class kt {
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
export {
  Pe as CloakedValue,
  Je as Component,
  He as DocumentScrollPosition,
  Oe as EmbedSlot,
  C as Environment,
  Te as ForEachBlock,
  Ft as Html,
  I as HtmlString,
  be as IfBlock,
  Ue as ObservableArray,
  bt as Router,
  Lt as Style,
  yt as Template,
  kt as Transition,
  vt as areSetsEqual,
  St as binarySearch,
  Se as camel_to_dash,
  Ct as cloak,
  xt as compareStrings,
  _t as compareStringsI,
  ut as deepEqual,
  Tt as html,
  ge as htmlEncode,
  Nt as inplace_filter_array,
  _e as is_constructor,
  Z as member,
  Qe as nextFrame,
  Dt as postNextFrame,
  Ot as router,
  Et as setEnvironment,
  $t as urlPattern
};
