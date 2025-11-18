document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".logic-btn");
    buttons.forEach((btn, index) => {
        btn.style.opacity = 0;
        btn.style.transform = "translateY(30px)";
        setTimeout(() => {
            btn.style.transition = "all 0.6s ease-out";
            btn.style.opacity = 1;
            btn.style.transform = "translateY(0)";
        }, index * 150);
    });
});
