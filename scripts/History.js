document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("history-body");

    if (!tbody) {
        console.error("Element with ID 'history-body' not found.");
        return;
    }

    fetch("/borrow-history", {
        method: "GET",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        tbody.innerHTML = "";

        if (data.success && data.history.length > 0) {
            data.history.forEach(entry => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${entry.title}</td>
                    <td>${entry.ISBN}</td>
                    <td>${entry.copy_no}</td>
                    <td>${entry.borrow_date}</td>
                    <td>${entry.return_date}</td>
                    <td>${entry.status}</td>
                `;

                tbody.appendChild(row);
            });
        } else {
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="6">No borrowing history found.</td>`;
            tbody.appendChild(row);
        }
    })
    .catch(error => {
        console.error("Error fetching borrow history:", error);
    });
});
