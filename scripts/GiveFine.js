const fineForm = document.getElementById('issueFineForm');
const fineMessage = document.getElementById('fineMessage');
const studentTableBody = document.getElementById('studentTableBody');

document.addEventListener("DOMContentLoaded", () => {
    const reasonSelect = document.getElementById("reason");

    fetch("/fine-reasons")
        .then(res => res.json())
        .then(data => {
            data.reasons.forEach(reason => {
                const option = document.createElement("option");
                option.value = reason;
                option.textContent = reason;
                reasonSelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Failed to load fine reasons:", err);
        });
});

// Fetching students currently borrowing books
fetch('/students-with-current-borrows')
    .then(response => response.json())
    .then(data => {
        const students = data.studentsWithCurrentBorrows;

        students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.reg_no}</td>
                <td>${student.name}</td>
                <td>${student.title}</td>
                <td>${student.borrow_date}</td>
                <td>${student.return_date}</td>
            `;
            studentTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error fetching students:', error);
    });

// Handle fine form submission
fineForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const regNo = document.getElementById('reg_no').value.trim();
    const reason = document.getElementById('reason').value;

    if (regNo === '' || reason === '') {
        fineMessage.textContent = "Please enter registration number and select a reason.";
        fineMessage.style.color = "red";
    } else {
        // Send fine data to the server
        fetch('/issue-fine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reg_no: regNo,
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Fine issued successfully.") {
                fineMessage.textContent = "Fine issued successfully!";
                fineMessage.style.color = "lightgreen";
                fineForm.reset();
            } else {
                fineMessage.textContent = data.message || "Error issuing fine. Please try again.";
                fineMessage.style.color = "red";
            }
        })
        .catch(error => {
            fineMessage.textContent = "Error issuing fine. Please try again.";
            fineMessage.style.color = "red";
            console.error('Error issuing fine:', error);
        });
    }
});
