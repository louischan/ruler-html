'use strict';

const allowedUnits = ['cm', 'inch'];
const [minPpi, maxPpi] = [50 * window.devicePixelRatio, 200 * window.devicePixelRatio];
const config = {
    ppi: 60 * window.devicePixelRatio,
    unit: 'cm',
};

const mainView = document.querySelector('.mainView');
const configBtn = document.querySelector('#configBtn')
const configPanel = document.querySelector('#configPanel');
const densitySlider = configPanel.querySelector('#densitySlider');
const densityInput = configPanel.querySelector('#densityInput');
const unitInputs = configPanel.querySelectorAll('input[name=unit]');
const defaultConfig = {...config};

function renderGrid() {
    let pxPerLength, svgUnitsPerLength, ruler;
    if (config.unit == 'inch') {
        pxPerLength = config.ppi;
        svgUnitsPerLength = 160;
        ruler = document.querySelector('#inch-ruler');
    } else {
        pxPerLength = config.ppi / 2.54;
        svgUnitsPerLength = 100;
        ruler = document.querySelector('#cm-ruler');
    }
    document.querySelector(`.ruler:not(#${ruler.id})`).classList.add('hidden');
    ruler.classList.remove('hidden');

    const realPxPerLength = pxPerLength / window.devicePixelRatio;

    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    const lw = w / realPxPerLength;
    const lh = h / realPxPerLength;
    const vw = lw * svgUnitsPerLength;
    const vh = lh * svgUnitsPerLength;
    mainView.setAttribute('viewBox', `0 0 ${vw} ${vh}`);
    ruler.querySelector('.scaleX').setAttribute('width', vw);
    ruler.querySelector('.scaleY').setAttribute('width', vh);

    const flw = Math.ceil(lw);
    const flh = Math.ceil(lh);
    for (let i = 1; i <= flw; i++) {
        if (ruler.querySelector(`.number-x-${i}`)) continue;
        let newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        newText.textContent = i;
        newText.setAttributeNS(null, 'x', i * svgUnitsPerLength);
        newText.setAttributeNS(null, 'y', 110);
        newText.setAttributeNS(null, 'class', `number number-x-${i}`);
        ruler.appendChild(newText);
    }

    for (let i = 1; i <= flh; i++) {
        if (ruler.querySelector(`.number-y-${i}`)) continue;
        if (i == 1 && config.unit == 'cm') continue;
        let newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        newText.textContent = i;
        newText.setAttributeNS(null, 'x', 90);
        newText.setAttributeNS(null, 'y', i * svgUnitsPerLength + 20);
        newText.setAttributeNS(null, 'transform', `rotate(-90, 90, ${i * svgUnitsPerLength})`);
        newText.setAttributeNS(null, 'class', `number number-y-${i}`);
        ruler.appendChild(newText);
    }
}

function validateConfig() {
    if (isNaN(config.ppi)) {
        config.ppi = defaultConfig.ppi;
    } else if (config.ppi < minPpi) {
        config.ppi = minPpi;
    } else if (config.ppi > maxPpi) {
        config.ppi = maxPpi;
    }
    if (!allowedUnits.includes(config.unit)) {
        config.unit = defaultConfig.unit;
    }
}

function syncInputValues() {
    densitySlider.value = config.ppi;
    densityInput.value = Math.round(config.ppi);
    Array.from(unitInputs).find(input => input.value === config.unit).checked = true;
}

function setHashValue() {
    let param = '';
    for (const key in config) {
        if (config[key] === defaultConfig[key]) continue;
        param += `&${encodeURIComponent(key)}=${encodeURIComponent(config[key])}`;
    }
    location.replace('#' + param.substr(1));
}

function getHashValue() {
    location.hash.substr(1).split('&').forEach(param => {
        const [key, value] = param.split('=').map(decodeURIComponent);
        if (key in config && value !== undefined) {
            config[key] = value;
        }
    });
    configUpdated(false);
}

function configUpdated(updateHash = true) {
    validateConfig();
    if (updateHash) setHashValue();
    syncInputValues();
    renderGrid();
}

densitySlider.addEventListener('input', e => {
    config.ppi = e.target.value;
    configUpdated(false);
});

densitySlider.addEventListener('change', e => {
    config.ppi = e.target.value;
    configUpdated();
});

densityInput.addEventListener('change', e => {
    config.ppi = e.target.value;
    configUpdated();
});

unitInputs.forEach(input =>
    input.addEventListener('change', e => {
        config.unit = e.target.value;
        configUpdated();
    }
));

configBtn.addEventListener('click', e => {
    e.currentTarget.classList.toggle('is-active');
    configPanel.classList.toggle('is-active');
});

window.addEventListener('resize', e => {
    renderGrid();
    setTimeout(() => window.scrollTo(0, 1), 500);
});

densitySlider.setAttribute('min', minPpi);
densitySlider.setAttribute('max', maxPpi);
getHashValue();
if (location.hash.substr(1) == '') {
    configBtn.click();
}
mainView.classList.remove('hidden');
