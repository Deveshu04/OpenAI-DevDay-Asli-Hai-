(function () {
  const root = document.documentElement;
  const FONTS = {
    bn: "Noto+Sans+Bengali", as: "Noto+Sans+Bengali", ta: "Noto+Sans+Tamil", te: "Noto+Sans+Telugu",
    kn: "Noto+Sans+Kannada", ml: "Noto+Sans+Malayalam", gu: "Noto+Sans+Gujarati", pa: "Noto+Sans+Gurmukhi", od: "Noto+Sans+Oriya",
  };
  const LINKS = {
    tel1930: '<a href="tel:1930"><strong>1930</strong></a>',
    cyber: '<a href="https://cybercrime.gov.in">cybercrime.gov.in</a>',
    github: '<a href="https://github.com/Deveshu04/OpenAI-DevDay-Asli-Hai-">GitHub</a>',
  };
  const cache = {};
  const listeners = [];
  let strings = {};
  let fallback = {};
  let loaded = false;
  let pending = 0;

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {}
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }

  function load(lang) {
    if (!root.hasAttribute("data-i18n-page")) return Promise.resolve({});
    if (!cache[lang]) {
      cache[lang] = fetch(`i18n/${lang}.json?v=7`).then((res) => (res.ok ? res.json() : {})).catch(() => ({}));
    }
    return cache[lang];
  }

  function t(key, vars) {
    let text = strings[key] ?? fallback[key] ?? key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
    return text;
  }

  function loadFont(lang) {
    if (!FONTS[lang] || document.getElementById("font-" + lang)) return;
    const link = document.createElement("link");
    link.id = "font-" + lang;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${FONTS[lang]}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }

  async function applyLang(lang) {
    const ticket = ++pending;
    root.dataset.lang = lang;
    root.lang = lang === "od" ? "or" : lang;
    loadFont(lang);
    const [dict, english] = await Promise.all([load(lang), load("en")]);
    if (ticket !== pending) return;
    strings = dict;
    fallback = english;

    if (root.dataset.i18nTitle) document.title = t(root.dataset.i18nTitle);
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = escapeHtml(t(el.dataset.i18nHtml)).replace(/\{(\w+)\}/g, (match, name) => LINKS[name] || match);
    });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-i18n-label]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
    document.querySelectorAll("[data-lang-select]").forEach((select) => {
      [...select.options].forEach((option) => {
        // Each language also shows its name in the page's language, unless that's the same word or isn't translated.
        const local = t("lang." + option.value);
        option.dataset.local = local.startsWith("lang.") || local === option.textContent.trim() ? "" : local;
      });
      select.value = lang;
    });

    loaded = true;
    root.classList.remove("i18n-pending");
    listeners.forEach((fn) => fn(lang));
  }

  // Replaces each native <select> with a list that shows every language in its own script, in rows big enough to
  // tap, with the keyboard behaviour of a native select. The hidden <select> stays the source of truth: other scripts
  // keep reading, setting and listening to it as before.
  function buildPicker(select, index) {
    const valueProp = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
    const listId = `pick-list-${index}`;
    const label = document.getElementById(select.getAttribute("aria-labelledby") || "")
      || (select.id && document.querySelector(`label[for="${select.id}"]`));

    const wrap = document.createElement("div");
    wrap.className = "lang-menu";
    const button = document.createElement("button");
    button.type = "button";
    button.id = `pick-button-${index}`;
    button.className = "lang-button";
    button.setAttribute("role", "combobox");
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", listId);
    button.innerHTML = '<svg class="globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>'
      + '<span class="lang-current"></span><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    const current = button.querySelector(".lang-current");

    const list = document.createElement("ul");
    list.className = "lang-list";
    list.id = listId;
    list.setAttribute("role", "listbox");
    list.tabIndex = -1;
    list.hidden = true;
    if (label) {
      if (!label.id) label.id = `pick-label-${index}`;
      button.setAttribute("aria-labelledby", label.id);
      list.setAttribute("aria-labelledby", label.id);
      if (label.htmlFor) label.htmlFor = button.id;
    }

    wrap.append(button, list);
    select.after(wrap);
    select.hidden = true;
    select.setAttribute("aria-hidden", "true");
    select.tabIndex = -1;

    let items = [];
    let active = 0;
    let typed = "";
    let typedAt = 0;
    const isOpen = () => button.getAttribute("aria-expanded") === "true";
    const nameOf = (option) => option.dataset.native || option.textContent.trim();

    function refresh() {
      const chosen = select.selectedOptions[0];
      current.textContent = chosen ? nameOf(chosen) : "";
      current.lang = chosen ? chosen.lang : "";
      items.forEach((item) => item.setAttribute("aria-selected", String(item.dataset.value === select.value)));
    }

    function rebuild() {
      items = [...select.options].map((option, n) => {
        const item = document.createElement("li");
        item.id = `${listId}-${n}`;
        item.setAttribute("role", "option");
        item.dataset.value = option.value;
        const name = document.createElement("span");
        name.className = "lang-native";
        name.lang = option.lang;
        name.textContent = nameOf(option);
        const local = document.createElement("span");
        local.className = "lang-local";
        local.textContent = option.dataset.local || "";
        item.append(name, local);
        return item;
      });
      list.replaceChildren(...items);
      refresh();
    }

    function setActive(i) {
      active = Math.min(items.length - 1, Math.max(0, i));
      items.forEach((item, n) => item.classList.toggle("active", n === active));
      button.setAttribute("aria-activedescendant", items[active].id);
      items[active].scrollIntoView({ block: "nearest" });
    }

    function open(at) {
      if (!items.length) return;
      list.hidden = false;
      button.setAttribute("aria-expanded", "true");
      wrap.classList.remove("align-left");
      if (list.getBoundingClientRect().left < 8) wrap.classList.add("align-left");
      setActive(at ?? Math.max(0, select.selectedIndex));
    }

    function close() {
      list.hidden = true;
      button.setAttribute("aria-expanded", "false");
      button.removeAttribute("aria-activedescendant");
    }

    function choose(i) {
      close();
      button.focus();
      if (!items[i] || items[i].dataset.value === select.value) return;
      select.value = items[i].dataset.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function typeAhead(key) {
      const now = Date.now();
      typed = now - typedAt > 700 ? key : typed + key;
      typedAt = now;
      const words = (item) => `${item.textContent} ${item.dataset.value}`.toLowerCase().split(/[\s()]+/);
      const from = typed.length === 1 ? active + 1 : active;
      for (let n = 0; n < items.length; n++) {
        const i = (from + n) % items.length;
        if (words(items[i]).some((w) => w.startsWith(typed))) return setActive(i);
      }
    }

    const printable = (event) => event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey;
    button.addEventListener("click", () => (isOpen() ? close() : open()));
    button.addEventListener("keydown", (event) => {
      const key = event.key;
      if (!isOpen()) {
        if (["ArrowDown", "ArrowUp", "Enter", " "].includes(key)) { event.preventDefault(); open(); }
        else if (key === "Home" || key === "End") { event.preventDefault(); open(key === "Home" ? 0 : items.length - 1); }
        else if (printable(event)) { open(); typeAhead(key.toLowerCase()); }
        return;
      }
      const moves = { ArrowDown: 1, ArrowUp: -1, PageDown: 5, PageUp: -5 };
      if (key in moves) { event.preventDefault(); setActive(active + moves[key]); }
      else if (key === "Home" || key === "End") { event.preventDefault(); setActive(key === "Home" ? 0 : items.length - 1); }
      else if (key === "Enter" || key === " ") { event.preventDefault(); choose(active); }
      else if (key === "Escape") { event.preventDefault(); close(); }
      else if (key === "Tab") { choose(active); }
      else if (printable(event)) { typeAhead(key.toLowerCase()); }
    });
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      const item = event.target.closest("[role=option]");
      if (item) choose(items.indexOf(item));
    });
    list.addEventListener("mousemove", (event) => {
      const item = event.target.closest("[role=option]");
      if (item && items.indexOf(item) !== active) setActive(items.indexOf(item));
    });
    document.addEventListener("click", (event) => { if (isOpen() && !wrap.contains(event.target)) close(); });
    button.addEventListener("blur", () => { if (isOpen()) close(); });

    // Other scripts fill and set these selects from code, so follow both without them knowing about the picker.
    Object.defineProperty(select, "value", {
      configurable: true,
      get() { return valueProp.get.call(this); },
      set(value) { valueProp.set.call(this, value); refresh(); },
    });
    select.addEventListener("change", refresh);
    new MutationObserver(rebuild).observe(select, { childList: true, subtree: true, characterData: true, attributes: true });
    rebuild();
  }

  function applySize(large) {
    root.classList.toggle("large-text", large);
    document.querySelectorAll("[data-text-size]").forEach((btn) => btn.setAttribute("aria-pressed", String(large)));
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-text-size]")) {
      const large = !root.classList.contains("large-text");
      save("asli-text", large ? "large" : "normal");
      applySize(large);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-lang-select]")) {
      save(root.dataset.langKey || "asli-lang", event.target.value);
      applyLang(event.target.value);
    }
  });

  window.asli = {
    lang: () => root.dataset.lang,
    t,
    load,
    onLang: (fn) => {
      listeners.push(fn);
      if (loaded) fn(root.dataset.lang);
    },
  };

  document.querySelectorAll("select").forEach(buildPicker);
  applySize(root.classList.contains("large-text"));
  applyLang(root.dataset.lang || "en");
})();
