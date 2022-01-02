#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');

function getName(pathname) {
    const base = path.basename(pathname);
    const ext  = path.extname(pathname);

    if(ext === "")
        return base;
    else {
        const pos = base.indexOf(ext);

        return pos < 0 ? base : base.substring(0,pos);
    }
}

function list(parent) {
    const conf = {};

    fs.readdirSync(parent).forEach( (pathname) => {
        const full = parent+"/"+pathname;
        const stat = fs.lstatSync(full);
        const name = getName(pathname);

        if(stat.isDirectory()) {
            conf[name] = list(full);
        } else if(stat.isFile()) {
            conf[name] = full;
        } else {
            // ignore
        }
    });
    return conf;
}

console.log('Content-type: application/json');
console.log('');
console.log(JSON.stringify(list('panels')));
