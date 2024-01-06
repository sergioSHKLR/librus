// VER 23.12.24

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