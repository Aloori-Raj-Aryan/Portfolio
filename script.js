const yearSpan = document.getElementById("year");
const menuButton = document.querySelector(".menu-btn");
const nav = document.querySelector(".nav");

if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}
