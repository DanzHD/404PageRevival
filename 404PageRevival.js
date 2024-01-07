

// ==UserScript==
// @name         404PageRevival
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Redirects 404 page not found to the according page in the Wayback Machine
// @author       Daniel Duong
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// @licence      MIT
// ==/UserScript==

const infoBarContainerStyle = 'position: fixed; width: 100%;height: 40px; top: 0; background-color: #333; ' +
    'margin-bottom: 20px; z-index: 9999; display: flex; align-items: center; padding-left: 20px; box-sizing: ' +
    'border-box; font-family: open-sans; justify-content: space-between;'
const buttonStyle = "width: fit-content; height: 80%; background-color: orange; vertical-align: " +
    "center; display: inline-flex; justify-content: center; align-items: center; border-radius: 15px; border: none; " +
    "color: white; font-size: 12px; padding: 10px; margin-left: auto; margin-right: 20px; cursor: pointer;";
const textStyle = "color: white;";


let httpMetaTag = document.createElement('meta');
httpMetaTag.setAttribute('http-equiv', "Content-Security-Policy");
httpMetaTag.setAttribute('content', "upgrade-insecure-requests");
document.getElementsByTagName('head')[0].appendChild(httpMetaTag);

let googleIconLinkTag = document.createElement('link');
googleIconLinkTag.setAttribute('rel', 'stylesheet');
googleIconLinkTag.setAttribute('href', "https://fonts.googleapis.com/css2?family=Material+Symbols+" +
    "Outlined:opsz,wght,FILL,GRAD@24,400,0,0");
document.getElementsByTagName('head')[0].appendChild(googleIconLinkTag);



const WAYBACK_ENDPORT = "http://archive.org/wayback/available?url=";
const ARCHIVED_SNAPSHOTS = "archived_snapshots";
const CLOSEST = "closest";
const URL = "url";

(async function() {
    'use strict';
    if (await is404Page(window.location.href)) {
        createInfoBar("This page is missing. Do you want to check for a saved version on the Wayback Machine?",
            "Check for saved version", () => hasSavedVersion(window.location.href),
            true);

    }


})();

async function is404Page(url) {

    const res = await fetch(url, { method: 'head'})
    const errorCodes = [404, 408, 410, 451, 500, 502, 503, 509, 520, 521, 523, 524, 525, 526];

    return errorCodes.includes(res.status);


}

async function hasSavedVersion(currentURL) {

    const options = {
        headers: {
            "Content-type": "application/json"
        }
    };

    let res = await fetch(WAYBACK_ENDPORT + currentURL, options);
    let archive = await res.json();

    if (Object.keys(archive[ARCHIVED_SNAPSHOTS]).length === 0) {
        removeInfoBar();
        createInfoBar("No saved version of this page has been found on the Wayback machine",
            null, null, false);
        return false;
    } else {
        window.location.href = archive[ARCHIVED_SNAPSHOTS][CLOSEST][URL];

    }


}

function createInfoBar(infoBarText, buttonTextContent, onBtnClick, createButton) {

    const bodyElement = document.querySelector('body');
    const infoBarContainerNode = document.createElement("div");

    const infoBarTextNode = document.createElement("p");

    infoBarTextNode.textContent = infoBarText;
    infoBarTextNode.setAttribute('style', textStyle);
    infoBarContainerNode.appendChild(infoBarTextNode);

    if (createButton) {
        const buttonNode = document.createElement('button');
        buttonNode.setAttribute('style', buttonStyle);
        buttonNode.textContent = buttonTextContent;
        buttonNode.addEventListener('click', onBtnClick);
        infoBarContainerNode.appendChild(buttonNode);


    }


    const closeInfoBar = document.createElement('span');
    closeInfoBar.className = "material-symbols-outlined";
    closeInfoBar.textContent = "close";
    closeInfoBar.addEventListener('click', removeInfoBar);
    closeInfoBar.setAttribute('color', 'white');
    closeInfoBar.style['margin-right'] = "10%";
    closeInfoBar.style.color = 'white';
    closeInfoBar.style.cursor = 'pointer';
    infoBarContainerNode.appendChild(closeInfoBar);

    infoBarContainerNode.setAttribute('style', infoBarContainerStyle);
    bodyElement.insertBefore(infoBarContainerNode, bodyElement.firstChild);


}

function removeInfoBar() {
    const bodyElement = document.querySelector('body');
    bodyElement.removeChild(bodyElement.firstChild);

}
