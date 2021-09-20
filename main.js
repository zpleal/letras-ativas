
$ = (name) => document.getElementById(name);

let gamePanel = null;

window.addEventListener("load",() => {
    const configsDialog = $('configsDialog');

    gamePanel = new GamePanel({});

    populateImagesPanel();

    $('openConfigs').onclick = () => configsDialog.style.display = 'block';
    $('ok').onclick = () => {

        doFullScreen();

        gamePanel.imageURL = getRadioValue('panel');
        gamePanel.mode = getRadioValue('mode');
        
        configsDialog.style.display = 'none';
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


function getRadioValue(name) {
    const radios = document.querySelectorAll('input[name="'+name+'"]');

    for (const radio of radios) {
        if (radio.checked) 
            return radio.value;
    }
}

function populateImagesPanel() {
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