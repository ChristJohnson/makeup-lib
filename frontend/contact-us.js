// js for dark mode
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // apply Dark Mode enabled
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
  }
});

document.getElementById("contact-form").addEventListener("submit", (ev) => {
  ev.preventDefault();

  const postData = JSON.stringify({
    email: $("#contact-email").val(),
    message: $("#contact-message").val(),
  });

  fetch("https://makeup-lib.vercel.app/api/contactme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
    body: postData,
  });
});
