document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the staff ID and password from the form
    const staff_id = document.getElementById("staff_id").value;
    const password = document.getElementById("password").value;

    // Send login data to the server
    fetch("http://localhost:3000/loginStaff", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            staff_id: staff_id,
            password: password,
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.success) {
            // Redirect to the staff dashboard if login is successful
            window.location.href = "GiveFine.html"; // Redirect to your staff dashboard or another page
        } else {
            // Display an error message if login failed
            alert(data.message);
        }
    })
    .catch((error) => {
        console.error("Error during login:", error);
        alert("An error occurred while trying to log in.");
    });
});
