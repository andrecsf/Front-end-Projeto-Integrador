const progress = document.getElementById("progress");
const percentText = document.getElementById("percent");

let percent = 60;

progress.style.width = percent + "%";
percentText.innerText = percent + "%";