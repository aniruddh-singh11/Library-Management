document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("return-body");
    const messageDiv = document.getElementById("message");

    const showMessage = (msg, success = true) => {
        messageDiv.textContent = msg;
        messageDiv.style.color = success ? "green" : "red";
        messageDiv.style.marginBottom = "15px";
    };

    if (!tbody) {
        console.error("Element with ID 'return-body' not found.");
        return;
    }

    fetch("http://localhost:3000/current-borrows", {
        method: "GET",
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        tbody.innerHTML = "";

        if (data.success && data.currentBorrows.length > 0) {
            data.currentBorrows.forEach(book => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${book.title}</td>
                    <td>${book.ISBN}</td>
                    <td>${book.copy_no}</td>
                    <td>${book.borrow_date}</td>
                    <td>${book.return_date}</td>
                    <td><button class="return-button" data-isbn="${book.ISBN}" data-copy="${book.copy_no}">Return</button></td>
                `;

                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="6">No currently borrowed books found.</td>`;
            tbody.appendChild(row);
        }
    })
    .catch(error => {
        console.error("Error fetching current borrows:", error);
        showMessage("Failed to load borrowed books.", false);
    });

    tbody.addEventListener("click", (e) => {
        if (e.target.classList.contains("return-button")) {
            const ISBN = e.target.dataset.isbn;
            const copy_no = e.target.dataset.copy;

            fetch("http://localhost:3000/return-book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ ISBN, copy_no })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage("Book returned successfully.");
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showMessage("Error: " + data.message, false);
                }
            })
            .catch(error => {
                console.error("Error returning book:", error);
                showMessage("An error occurred. Please try again.", false);
            });
        }
    });
});
