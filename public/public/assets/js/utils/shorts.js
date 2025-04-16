const fetchJSON = async (url) => (await fetch(url)).json();
const goTo = (path) => window.location.href = path;

const cl = {
    g: console.log,
    e: console.error,
    w: console.warn,
};

const DOMUtils = {
    getElement: (id) => document.getElementById(id),
    setValue: (id, value) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        element.value = value;
    },
    setStylesById: (id, styles) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        if (typeof styles !== "object" || styles === null) return;
        Object.assign(element.style, styles);
    },
    setStylesByClass: (className, styles) => {
        const elements = document.getElementsByClassName(className);
        if (!elements.length) return console.warn(`No elements found with class "${className}"`);
        if (typeof styles !== "object" || styles === null) return;
        Array.from(elements).forEach(element => Object.assign(element.style, styles));
    },
    createElement: (tag, attributes = {}) => {
        const element = document.createElement(tag);
        for (let [key, value] of Object.entries(attributes)) {
            if (key === "style" && typeof value === "object") {
                Object.assign(element.style, value);
            } else if (key === "text") {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        }
        return element;
    },
    createElementNS: (namespace, tag, attributes = {}) => {
        const element = document.createElementNS(namespace, tag);
        for (let [key, value] of Object.entries(attributes)) {
            if (key === "text") {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        }
        return element;
    },
    setInnerHTML: (id, content) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        element.innerHTML = content;
    },
    appendChildTo: (parentId, child) => {
        const parent = document.getElementById(parentId);
        if (!parent) return console.warn(`Parent element with ID "${parentId}" not found!`);
        if (!(child instanceof HTMLElement)) return console.warn(`Child must be a valid HTML element`);
        parent.appendChild(child);
    },
    toggleClassById: (id, className) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        element.classList.toggle(className);
    },
    addEventListener: (element, event, handler) => {
        if (!element) return console.warn("Invalid element for event listener.");
        element.addEventListener(event, handler);
    },
    setTextContent: (id, text) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        element.textContent = text;
    }
    ,
    addEventListenerById: (id, event, handler) => {
        const element = document.getElementById(id);
        if (!element) return console.warn(`Element with ID "${id}" not found!`);
        element.addEventListener(event, handler);
    }
};
