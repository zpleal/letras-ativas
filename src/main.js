
const $ = (name) => document.getElementById(name);

const DEFAULT_SELECTIONS = {
    radios: {
        mode: "trace" ,
        fullscreen: "yes"
    },
    values: {
        panel: null,
        size: 50,
        color: "#16264c"
    }
};


let gamePanel = null;

window.addEventListener("load",() => {
    const configsDialog = $('configsDialog');

    gamePanel = new GamePanel({});

    fetch("panels.js")
        .then( response => response.json())
        .then( configs  => populateImagesPanel(configs))
        .catch( console.log );

    $('openConfigs').onclick = () => configsDialog.style.display = 'block';
    $('ok').onclick = () => {

        doFullScreen();

        // gamePanel.imageURL = getRadioValue('panel');
        gamePanel.imageURL = $('panel').value;
        gamePanel.color    = $('color').value;
        gamePanel.size     = $('size').value;
        gamePanel.mode     = getRadioValue('mode');
        
        configsDialog.style.display = 'none';

        saveSelections();
    };
    $('cancel').onclick = () => {
        configsDialog.style.display = 'none';
    }

});

window.addEventListener('resize',() => {
    if(gamePanel) 
        gamePanel.readjust();
});

function doFullScreen() {
    if (screenfull.isEnabled) {
        const fullscreen = getRadioValue('fullscreen');

        switch(fullscreen) {
            case 'yes': 
                if (! screenfull.isFullscreen) {
                    const body = document.querySelector('body');
                    screenfull.request(body,{ navigationUI: "hide" });
                }
                break;
            case 'no':   
                if (screenfull.isFullscreen)
                    screenfull.exit()
                break;
                default: 
                    console.log('invalid fullscreen value: '+fullscreen);
        }
    }   else
        console.log('fullscreen disabled');

}


/*
function doFullScreen() {
    const fullscreen = getRadioValue('fullscreen');
    switch(fullscreen) {
        case 'yes': 
            if(! document.fullscreenElement)
                document.documentElement.requestFullscreen({ navigationUI: "hide" });
        break;
        case 'no':   
            if(document.fullscreenElement)
                document.exitFullscreen();
        break;
        default: console.log('invalid fullscreen value: '+fullscreen);
    }
}
*/

const SELECTIONS_KEY = "active letters selections";


function saveSelections() {
    const selections = { radios: {}, values: {} };

    for(const name in DEFAULT_SELECTIONS.radios)
        selections.radios[name] = getRadioValue(name);
    
    for(const id in DEFAULT_SELECTIONS.values)
        selections.values[id] = $(id).value;

    localStorage.setItem(SELECTIONS_KEY,JSON.stringify(selections));
}

function restoreSelections() {
    const saved = localStorage.getItem(SELECTIONS_KEY);
    const selections = saved ? JSON.parse(saved) : DEFAULT_SELECTIONS;

    for(const name in DEFAULT_SELECTIONS.radios)
        setRadioValue(name,selections.radios[name]);
    
    for(const id in DEFAULT_SELECTIONS.values)
        $(id).value = selections.values[id];
}

function setRadioValue(name,value) {
    const radios = document.querySelectorAll('input[name="'+name+'"]');

    for (const radio of radios) {
        if (radio.value === value) 
            radio.checked = true;
    }
}

function getRadioValue(name) {
    const radios = document.querySelectorAll('input[name="'+name+'"]');

    for (const radio of radios) {
        if (radio.checked) 
            return radio.value;
    }
}

function populateImagesPanel(panelStruct) {
    const panel = $('panel');

    populateOn(panel,panelStruct);

    panel.onclick = (event) => {
        const value  = panel.value;
        const option = panel.querySelector(`option[value="${value}"]`);

        option.selected = true;
    }; 

    restoreSelections();
}    

function populateOn(parent,panelStruct) {
    for(const label in panelStruct) {
        const value  = panelStruct[label];
        const isLeaf = typeof value === "string";
        const type   = isLeaf ? "option" : "optgroup"
        const element = document.createElement(type);

        element.label = label;
        parent.appendChild(element);

        if(isLeaf)
            element.value = value;
        else
            populateOn(element,value);
    }
}


/*
function populateImagesPanel(configs) {
    const panels = $('panels');
    let first = true;

    for(let {image,title} of configs.panels) {
        const id    = "panel-"+title+"-"+image;
        const input = document.createElement("input");
        const label = document.createElement("label");

        input.setAttribute("type","radio");
        input.setAttribute("id",id);
        input.setAttribute("name","panel");
        input.setAttribute("value",image);

        if(first) {
            input.setAttribute("checked",true);
            first = false;
        }

        label.setAttribute("for",id);
        label.appendChild(document.createTextNode(title));
        
        panels.appendChild(input);
        panels.appendChild(label);

        panels.appendChild(document.createElement("br"));
    }
}
*/