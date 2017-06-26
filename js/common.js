requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../game'
    }
});

function loadLevels() {
    return Promise.reject();
}

function extend(base, props = {}) {
    const result = class extends base {};
    Object.defineProperties(result.prototype, props);
    return result;
}