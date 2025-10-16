document.addEventListener("DOMContentLoaded", () => {
    const studentInfoDiv = document.getElementById("student-info");
    const fineTableBody = document.getElementById("fine-table-body");

    // Fetch logged-in student details and fines
    fetch("/student-fines")
        .then(res => res.json())
        .then(data => {
            if (data.student && data.fines) {
                // Display student information
                studentInfoDiv.innerHTML = `
                    <p><strong>Name:</strong> ${data.student.name}</p>
                    <p><strong>Registration Number:</strong> ${data.student.reg_no}</p>
                    
                `;

                // Display fines records
                data.fines.forEach(fine => {
                    const row = document.createElement("tr");
                    row.id = `fine-row-${fine.fine_id}`;  // Set a unique ID for each row
                    row.innerHTML = `
                        <td>${fine.staff_name}</td>
                        <td>₹${fine.amount}</td>
                        <td>${fine.reason}</td>
                        <td><button class="pay-btn" onclick="payFine(${fine.fine_id}, this)">Pay Now</button></td>
                    `;
                    fineTableBody.appendChild(row);
                });
            }
        })
        .catch(err => {
            console.error("Failed to load student fines:", err);
        });
});

// Function to handle paying a fine and removing the row
function payFine(fineId, button) {
    fetch(`/pay-fine/${fineId}`, {
        method: "POST",
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Fine paid successfully!");

            // Remove the row from the table
            const row = button.closest('tr'); // Find the closest row to the clicked button
            row.remove();  // Remove the row from the DOM
        } else {
            alert("Error paying fine. Please try again.");
        }
    })
    .catch(err => {
        console.error("Error paying fine:", err);
        alert("Error paying fine. Please try again.");
    });
}
