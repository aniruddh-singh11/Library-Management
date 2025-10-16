document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const regNo = document.getElementById("reg_no").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.createElement("p");
    message.style.color = "red";

    if (regNo === "" || password === "") {
        message.textContent = "Please fill in both the registration number and password.";
        document.querySelector(".login-container").appendChild(message);
    } else {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reg_no: regNo, password: password })
        });

        const result = await response.json();

        if (result.success) {
            window.location.href = "Browse.html";
        } else {
            message.textContent = result.message;
            document.querySelector(".login-container").appendChild(message);
        }
    }
});
