// js for dark mode
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-theme");
  const body = document.body;

  // Check if Dark Mode  enabled
  if (localStorage.getItem("darkMode") === "enabled") {
    body.classList.add("dark-mode");
    toggle.checked = true;
  }

  // Toggle Dark Mode
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      body.classList.add("dark-mode");
      localStorage.setItem("darkMode", "enabled");
    } else {
      body.classList.remove("dark-mode");
      localStorage.setItem("darkMode", "disabled");
    }
  });
});

$("form").on("submit", (ev) => {
  const postData = JSON.stringify({
    name: $("#user-name").val(),
    email: $("#user-email").val(),
    age: $("#user-age").val(),
  });
  ev.preventDefault();
  fetch("https://makeup-lib.vercel.app/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
    },
    body: postData,
  });
});
