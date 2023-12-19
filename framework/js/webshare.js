// VERSION 23.14

const shareData = {
    title: "📗 librus.app",
    text: "❤️ Love one another 🎓 and educate yourselves.",
    url: "https://librus.app",
};

const btn = document.querySelector("#webshare");
const resultPara = document.querySelector(".result");

// Share must be triggered by "user activation"
btn.addEventListener("click", async () => {
    try {
        await navigator.share(shareData);
        resultPara.textContent = "Shared successfully!";
    } catch (err) {
        resultPara.textContent = "Share error";
    }
});