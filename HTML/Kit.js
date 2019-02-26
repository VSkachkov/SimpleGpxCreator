var $ = function (name, s, p, to, n) {
	return new O(name, s, p, to, n).o;
};

class O {
	constructor(name, s, p, to, n) {
		let t = to || document.body;
		if (t) {
			this.o = document.createElement(name);
			if (p)
				this.add(this.o, p);
			if (s)
				this.add(this.o.style, s);
			if (n)
				t.insertAdjacentHTML("beforeEnd", "<br/>".repeat(n));
			t.appendChild(this.o);
		}
	}
	add(o, text) {
		let pp = text.split(";");
		if (pp.length === 0)
			return;
		for (let i = 0; i < pp.length; i++) {
			if (pp[i] === "")
				continue;
			var p = pp[i].split("=");
			if (p.length < 2)
				return;
			o[p[0]] = p[1];
		}
	}

	static getHtml(o) { return o.innerHTML; }
	static html(text, to) {
		if (!to)
			to = document.body;
		if (to)
			to.insertAdjacentHTML("beforeEnd", text);
	}
	static query(s) { return document.querySelector(s); }
	static addText(text, to) {
		let o = document.createTextNode(text);
		if (!to)
			to = document.body;
		to.appendChild(o);
		return o;
	}
	static getAll(o) {
		let s = "[";
		for (let p in o)
			s += o[p] + ", ";
		s = s.substr(0, s.length - 2);
		s += "]";
		return s;
	}

}
