
window.addEventListener("load",() => {
    const paper     = document.getElementById('paper');
    const reset     = document.getElementById('reset');
    const text      = document.getElementById('text');
    const family    = document.getElementById('family');
    const size      = document.getElementById('size');
    const browsers  = document.getElementById('browsers');
    const dBrowsers = document.getElementById('d-browsers');
    const bOk       = document.getElementById('b-ok');
    const show      = document.getElementById('show');
    const dStrokes  = document.getElementById('d-strokes');
    const sOk       = document.getElementById('s-ok');

    const tracer = new LetterTracer({
        parent: paper,
        text: text.value,
        fontFamily: family.value,
        fontSize: size.value
    });

    reset.onclick     = () => tracer.reset();  
    text.onchange     = () => tracer.text = text.value;
    family.onchange   = () => tracer.fontFamily = family.value;
    size.onchange     = () => tracer.fontSize = size.value;
    browsers.onclick  = () => dBrowsers.style.display = 'block';
    bOk.onclick       = () => dBrowsers.style.display = 'none';
    show.onclick      = () => { dStrokes.style.display = 'block'; showStrokes(tracer); };
    sOk.onclick       = () => dStrokes.style.display = 'none';
});

function showStrokes(tracer) {
    const strokes = document.getElementById('strokes');
    const table   = document.createElement("table");
    const thead   = document.createElement("thead");
    const tbody   = document.createElement("tbody");
    const tr      = document.createElement("tr");
    const start   = tracer.strokes.length > 0 ? tracer.strokes[0].points[0].time.getTime() : 0;
   
    table.setAttribute("rules","all");
    table.setAttribute("frame","box");
    table.setAttribute("cellpadding","2");

    for(let header of [ 'stroke', 'x', 'y', 'time', 'type','pressure', 'tilt','tilt x','tilt y']) 
        addCell(tr,"th",header);
    thead.appendChild(tr);
    table.appendChild(thead);
    table.appendChild(tbody);

    let count = 0; 

    for(let stroke of tracer.strokes) {
        let first = true;
        for(let point of stroke.points) {
            const tr    = document.createElement("tr");

            if(first) {
                const len = stroke.points.length;
                addCell(tr,"td",count++,len);
                first = false;                                                                                                                                                                                          
            }
            addCell(tr,"td",parseFloat(point.x).toFixed(2));
            addCell(tr,"td",parseFloat(point.y).toFixed(2));
            addCell(tr,"td",point.time.getTime() - start);
            addCell(tr,"td",point.type);
            addCell(tr,"td",parseFloat(point.pressure).toFixed(2));
            addCell(tr,"td",(point.tilt ? parseFloat(point.tilt).toFixed(2) : "?"));
            addCell(tr,"td",(point.tiltX ? parseFloat(point.tiltX).toFixed(2) : "?"));
            addCell(tr,"td",(point.tiltY ? parseFloat(point.tiltY).toFixed(2) : "?"));      
            tbody.appendChild(tr);
        }
    }
/*
    const tbs = tbody.style;

    tbs.display = "block";
    tbs.overflow = "auto";
    tbs.height = "80vh";
*/
    strokes.innerHTML = "";
    strokes.appendChild(table);
}

function addCell(tr,type,text,span) {
    const td  = document.createElement(type);
    const txt = document.createTextNode(text);

    if(span)
        td.setAttribute("rowspan",span);

    td.appendChild(txt);
    tr.appendChild(td);
}