// Good info here: https://fernandobasso.github.io/javascript/unit-testing-vue-vuetify-with-jest-and-vue-test-utils.html
import Vue from 'vue';

Vue.config.productionTip = false;

global.rendering = async function() {
    var scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;

    await new Promise(function(resolve) {
        scheduler(resolve);
    });

    await Vue.nextTick();
};

global.dumpContent = function(instance) {
    expect(instance.html()).toBe('');
};

global.dummyComponent = function(name='whatever', initObj={}, type='div') {
    // use render function instead of 'template: ' b/c Vue runtime load lacks template compiler
    return Vue.component(name, { render: (h)=> { return h(type, initObj, []); }});
};

global.spyOnConsole = function() {
    if (global.consoleSpies) {
        return global.consoleSpies;
    }
    global.consoleSpies = [
        jest.spyOn(console, 'warn').mockImplementation(),
        jest.spyOn(console, 'error').mockImplementation(),
        jest.spyOn(console, 'log').mockImplementation()
    ];
    return global.consoleSpies;
};

global.clearConsoleSpies = function() {
    global.consoleSpies.forEach(function(spy) {
        spy.mockRestore();
    });
};
