// ==UserScript==
// @name         404PageRevival
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @description  Redirects 404 page not found to the according page in the Wayback Machine
// @author       Daniel Duong
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     MATERIAL_ICON https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined
// @license      MIT

// ==/UserScript==

const infoBarContainerStyle = 'position: absolute; min-width: 450px; width: 100vw; height: 40px; top: 0; left: 0; background-color: #333; ' +
    'margin-bottom: 20px; z-index: 9999; display: flex; align-items: center; padding-left: 10%; box-sizing: ' +
    'border-box; font-family: open-sans; justify-content: space-between; font-size: 20px; '
const buttonStyle = "position: relative; min-width: fit-content; height: 80%; background-color: orange; vertical-align: " +
    "center; display: inline-flex; justify-content: center; align-items: center; border-radius: 15px; border: none; " +
    "color: white; font-size: 20px; padding: 10px; margin-left: auto; margin-right: 5%; cursor: pointer; overflow: hidden; white-space: nowrap; font-family: Arial !important; text-transform: none !important; font-weight: 500 !important; ";
const textStyle = `color: white; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin-right: 1%; margin-bottom: 0; margin-top: 0; font-family: Arial !important; text-transform: none !important; font-size: 20px !important; font-weight: 500 !important;`;

const WAYBACK_ENDPORT = "http://archive.org/wayback/available?url=";
const ARCHIVED_SNAPSHOTS = "archived_snapshots";
const CLOSEST = "closest";
const URL = "url";

let infobarCreated = false;

(async function() {
    'use strict';
    const iconCSS = GM_getResourceText("MATERIAL_ICON");
    GM_addStyle(iconCSS);

    if (await is404Page(window.location.href)) {
        try {

            let savedURL = await hasSavedVersion(window.location.href);
            if (savedURL) {
                infobarCreated = true;
                createInfoBar("Click on the button to redirect to the Wayback Machine", "Redirect to internet archive", () => window.location.href=savedURL, true);
            } else {
                createInfoBar("No archive of page found on the Wayback Machine", null, null, false);
            }
        } catch(err) {
            createInfoBar("Something went wrong...", null, null, false);
        }


    }



})();

async function is404Page(url) {
    try {
        const options = {
            url: url
        }


        const {status} = await GM.xmlHttpRequest(options);

        const errorCodes = [404, 408, 410, 451, 500, 502, 503, 509, 520, 521, 523, 524, 525, 526];


        return errorCodes.includes(status);
    } catch (err) {
        return false;
    }


}

async function hasSavedVersion(currentURL) {
    try {

        const options = {
            method: 'GET',
            url: WAYBACK_ENDPORT + currentURL,
            headers: {
                "Content-type": "application/json"
            },
            responseType: 'JSON'
        };

        let res = await GM.xmlHttpRequest(options);
        let archive = await res.response;

        if (Object.keys(archive[ARCHIVED_SNAPSHOTS]).length === 0) {

            return false;
        } else {

            return archive[ARCHIVED_SNAPSHOTS][CLOSEST][URL];

        }
    } catch(err) {
        throw err;

    }


}

const buttonNode = document.createElement('button');

function createInfoBar(infoBarText, buttonTextContent, onBtnClick, createButton) {

    const bodyElement = document.querySelector('body');
    const infoBarContainerNode = document.createElement("div");

    const infoBarTextNode = document.createElement("div");

    infoBarTextNode.textContent = infoBarText;
    infoBarTextNode.setAttribute('style', textStyle);
    infoBarContainerNode.appendChild(infoBarTextNode);

    if (createButton) {
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
