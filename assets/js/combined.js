// PERSIST MODE 01 START
const EL_body2 = document.querySelector("#col2-body");
const ELS_textAlign = document.querySelectorAll(".textAlign");
localStorage.textAlign = localStorage.textAlign || "left"; // Read or default to left
function changeAlign() {
    EL_body2.style.textAlign = `${localStorage.textAlign}`;
}
// Change size on subsequent page load
changeAlign();
// PERSIST MODE 01 END
// PERSIST MODE 07-08-09 START
const EL_body4 = document.querySelector("#col2-body");
const ELS_bground = document.querySelectorAll(".bground");
localStorage.backgroundColor = localStorage.backgroundColor || "transparent"; // Read or default to transparent
function changeBground() {
    EL_body4.style.backgroundColor = localStorage.backgroundColor
};
// Change size on subsequent page load
changeBground();
// PERSIST MODE 07-08-09 END
let contrastMode = localStorage.getItem("contrast");
if (contrastMode === "dark") {
    darkMode(); // set state of darkMode on page load
}
// PERSIST MODE 02-03-04 START
const EL_body3 = document.querySelector("#col2-body");
const ELS_fontFamily = document.querySelectorAll(".fontFamily");
localStorage.fontFamily = localStorage.fontFamily || "Roboto Serif"; // Read or default to serif
function changeFamily() {
    EL_body3.style.fontFamily = `${localStorage.fontFamily}`;
}
// Change size on subsequent page load
changeFamily();
// PERSIST MODE 02-03-04 END
// LINE HEIGHT START
const EL_body1 = document.querySelector("#col2-body");
const ELS_lineHeight = document.querySelectorAll(".lineHeight");
localStorage.lineHeight = localStorage.lineHeight || 24; // Read or default to 16px
function changeHeight() {
    EL_body1.style.lineHeight = `${localStorage.lineHeight}px`;
}
ELS_lineHeight.forEach(el => el.addEventListener("click", function () {
    localStorage.lineHeight = parseInt(localStorage.lineHeight) + parseInt(el.value);
    changeHeight();
}));
// Change height on subsequent page load
changeHeight();
// LINE HEIGHT END
// FONT SIZER START
const EL_body = document.querySelector("#col2-body");
const ELS_fontSize = document.querySelectorAll(".fontSize");
localStorage.fontSize = localStorage.fontSize || 16; // Read or default to 16px
function changeSize() {
    EL_body.style.fontSize = `${localStorage.fontSize}px`;
}
ELS_fontSize.forEach(el => el.addEventListener("click", function () {
    localStorage.fontSize = parseInt(localStorage.fontSize) + parseInt(el.value);
    changeSize();
}));
// Change size on subsequent page load
changeSize();
// FONT SIZER END
// DARK MODE START
function darkMode() {
    var elementA = document.body;
    elementA.classList.add("dark-mode");
    var elementB = document.getElementById("col2-dm-btn");
    elementB.classList.add("hide");
    var elementC = document.getElementById("col2-lm-btn");
    elementC.classList.remove("hide");
    localStorage.setItem("contrast", "dark");
}
function lightMode() {
    var elementD = document.body;
    elementD.classList.remove("dark-mode");
    var elementE = document.getElementById("col2-lm-btn");
    elementE.classList.add("hide");
    var elementF = document.getElementById("col2-dm-btn");
    elementF.classList.remove("hide");
    localStorage.setItem("contrast", "light");
}
// DARK MODE END
// EXT LINKS START
window.onload = function () {
    /* onload code */
    var extLinks = document.querySelectorAll(
        "a[href^='https://en'], a[href^='https://maps'], a[href^='https://www']");
    var host = window.location.hostname;
    var isInternalLink = link => new URL(link).hostname === host;
    extLinks.forEach(link => {
        if (isInternalLink(link)) return;
        link.setAttribute("target", "ext");
        link.setAttribute("rel", "noopener");
    });
};
// EXT LINKS END
// FULLSCREEN START
var elem = document.documentElement;
// OPEN FULLSCREEN  
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
    var elementG = document.getElementById("col2-fs-btn");
    elementG.classList.toggle("hide");
    var elementH = document.getElementById("col2-ns-btn");
    elementH.classList.toggle("show");
}
// CLOSE FULLSCREEN  
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
    var elementI = document.getElementById("col2-ns-btn");
    elementI.classList.toggle("show");
    var elementJ = document.getElementById("col2-fs-btn");
    elementJ.classList.toggle("hide");
}
var elem = document.documentElement;
// FULLSCREEN END
// HYPO ALERT START
function hypoAlert() {
    alert("If the annotation panel doesn't deploy with a click on the topmost button, drag it toward the middle of the page.");
}
// HYPO ALERT END
// MENU START
// MENU ON 
function menuOn() {
    document.getElementById("col1-body").style.display = 'inline-block';
    document.getElementById("col2-menu-on").style.display = 'none';
    document.getElementById("col2-menu-off").style.display = 'inline-block';
}
// MENU OFF 
function menuOff() {
    document.getElementById("col1-body").style.display = 'none';
    document.getElementById("col2-menu-off").style.display = 'none';
    document.getElementById("col2-menu-on").style.display = 'inline-block';
}
// MENU END
// STRING REPLACE 1 START
var links, x, le;
links = document.getElementsByClassName('w');
for (x = 0, le = links.length; x < le; x++) {
    links[x].href = "https://en.m.wikipedia.org/wiki" + (links[x].pathname);
}
// STRING REPLACE 1 END
// STRING REPLACE 2 START
var links, y, le;
links = document.getElementsByClassName('d');
for (y = 0, le = links.length; y < le; y++) {
    links[y].href = "https://en.m.wiktionary.org/wiki" + (links[y].pathname);
}
// STRING REPLACE 2 END
// STRING REPLACE 3 START
var links, z, le;
links = document.getElementsByClassName('l');
for (z = 0, le = links.length; z < le; z++) {
    links[z].href = "https://www.luzespirita.org.br/index.php?lisPage=enciclopedia&item=" + (links[z].pathname.slice(1));
}
// STRING REPLACE 3 END
// STRING REPLACE 4 START
var links, k, le;
links = document.getElementsByClassName('m');
for (k = 0, le = links.length; k < le; k++) {
    links[k].href = "https://maps.google.com/maps?hl=en&t=k&z=12&ie=UTF8&iwloc=B&output=embed&q=" + (links[k].pathname.slice(1));
}
// STRING REPLACE 4 END
// STRING REPLACE 5 START
var links, u, le;
links = document.getElementsByClassName('v');
for (u = 0, le = links.length; u < le; u++) {
    links[u].href = "https://www.youtube.com/embed/" + (links[u].pathname.slice(1)) + (links[u].search);
}
// STRING REPLACE 5 END
// STRING REPLACE 6 START
var links, b, le;
links = document.getElementsByClassName('b');
for (b = 0, le = links.length; b < le; b++) {
    links[b].href = "https://www.bible.com/pt/bible/212/" + (links[b].pathname);
}
// STRING REPLACE 6 END
// TOOLS START
// SHOW MENU
function function00() {
    var element00 = document.getElementById("vert-tools-buttons");
    element00.classList.toggle("hide");
}
//---------------------------------------------------
function function01() {
    localStorage.setItem("textAlign", "justify");
    var element01 = document.getElementById("col2-body");
    element01.classList.add("ta-justify");
}
//---------------------------------------------------
function function02() {
    localStorage.setItem("fontFamily", "Roboto Serif");
    var element02 = document.getElementById("col2-body");
    element02.classList.remove("ff-sans");
    element02.classList.remove("ff-mono");
    element02.classList.add("ff-serif");
}
//---------------------------------------------------
function function03() {
    localStorage.setItem("fontFamily", "sans");
    var element03 = document.getElementById("col2-body");
    element03.classList.remove("ff-serif");
    element03.classList.remove("ff-mono");
    element03.classList.add("ff-sans");
}
//---------------------------------------------------
function function04() {
    localStorage.setItem("fontFamily", "mono");
    var element04 = document.getElementById("col2-body");
    element04.classList.remove("ff-serif");
    element04.classList.remove("ff-sans");
    element04.classList.add("ff-mono");
}
//---------------------------------------------------
function function05() {
    localStorage.setItem("lineHeight", "narrow");
    var element05 = document.getElementById("col2-body");
    element05.classList.remove("lh-wide");
    element05.classList.add("lh-narrow");
}
//---------------------------------------------------
function function06() {
    localStorage.setItem("lineHeight", "wide");
    var element06 = document.getElementById("col2-body");
    element06.classList.remove("lh-narrow");
    element06.classList.add("lh-wide");
}
//---------------------------------------------------
function function07() {
    localStorage.setItem("backgroundColor", "#ffff001a");
    var element07 = document.getElementById("col2-body");
    element07.classList.remove("bg-green");
    element07.classList.remove("bg-pink");
    element07.classList.add("bg-yellow");
}
//---------------------------------------------------
function function08() {
    localStorage.setItem("backgroundColor", "#00ff001a");
    var element08 = document.getElementById("col2-body");
    element08.classList.remove("bg-yellow");
    element08.classList.remove("bg-pink");
    element08.classList.add("bg-green");
}
//---------------------------------------------------
function function09() {
    localStorage.setItem("backgroundColor", "#ff00001a");
    var element09 = document.getElementById("col2-body");
    element09.classList.remove("bg-yellow");
    element09.classList.remove("bg-green");
    element09.classList.add("bg-pink");
}
//---------------------------------------------------
function functionReset() {
    localStorage.removeItem("fontSize");
    localStorage.removeItem("textAlign");
    localStorage.removeItem("fontFamily");
    localStorage.removeItem("lineHeight");
    localStorage.removeItem("backgroundColor");
    localStorage.removeItem("textDecoration");
    var element10 = document.getElementById("col2-body");
    element10.classList.remove("justify");
    element10.classList.remove("ff-se");
    element10.classList.remove("ff-sa");
    element10.classList.remove("ff-mo");
    element10.classList.remove("lh-narrow");
    element10.classList.remove("lh-wide");
    element10.classList.remove("bg-yellow");
    element10.classList.remove("bg-green");
    element10.classList.remove("bg-pink");
    element10.classList.remove("none");
}
//---------------------------------------------------
// TOOLS END
// VERSION 24.1.4
// WEBSHARE START
function webShare() {
    navigator.share(shareData);
}
const shareData = {
    title: "📗 librus.app",
    text: "❤️ Love one another and 🎓 instruct yourselves!",
    url: "https://librus.app",
};
// WEBSHARE END
// SUMMARY DETAILS ONE AT A TIME
document.querySelectorAll('details').forEach((D, _, A) => {
    D.ontoggle = _ => { if (D.open) A.forEach(d => { if (d != D) d.open = false }) }
})
// LABEL ON OFF
// LABEL START
function labelOff() {
    var element = document.querySelector("#col2-menu-on > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-menu-off > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-dm-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-lm-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-fs-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-ns-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link1-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link2-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link3-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link4-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#tools-menu > span");
    element.classList.toggle("hide");
    var element = document.querySelector("#decreasetext > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#increasetext > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#decreaselineheight > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#increaselineheight > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-se-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-sa-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-mo-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-ye-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-gr-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-pi-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ta-ju-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ra-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#webshare > span.label")
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-loff-btn");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-lon-btn");
    element.classList.toggle("hide");
    localStorage.setItem("label", "none");
}
function labelOn() {
    var element = document.querySelector("#col2-menu-on > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-menu-off > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-dm-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-lm-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-fs-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-ns-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link1-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link2-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link3-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#col3-link4-a > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#tools-menu > span");
    element.classList.toggle("hide");
    var element = document.querySelector("#decreasetext > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#increasetext > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#decreaselineheight > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#increaselineheight > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-se-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-sa-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ff-mo-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-ye-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-gr-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#bc-pi-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ta-ju-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#ra-btn > span.label");
    element.classList.toggle("hide");
    var element = document.querySelector("#webshare > span.label")
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-loff-btn");
    element.classList.toggle("hide");
    var element = document.querySelector("#col2-lon-btn");
    element.classList.toggle("hide");
    localStorage.setItem("label", "block");
}
let labelVisibility = localStorage.getItem("label");
if (labelVisibility === "none") {
    labelOff(); // set state of label visibility on page load
}
// LABEL END