const form = document.getElementById('addBookForm');
const message = document.getElementById('message');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const isbn = document.getElementById('isbn').value.trim();
    const name = document.getElementById('name').value.trim();
    const category = document.getElementById('category').value.trim();
    const publisher = document.getElementById('publisher').value.trim();
    const author = document.getElementById('author').value.trim();
    const copies = document.getElementById('copies').value.trim();  // Get copies value

    if (isbn && name && category && publisher && author && copies) {
        // Sending the form data to the server
        fetch('/add-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isbn,
                name,
                category,
                publisher,
                author,
                copies: parseInt(copies)  // Make sure copies is a number
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                message.textContent = data.message || "Book added successfully!";
                message.style.color = "lightgreen";
                form.reset();
            } else {
                message.textContent = data.message || "Error adding book.";
                message.style.color = "red";
            }
        })
        .catch(error => {
            message.textContent = "Something went wrong, please try again.";
            message.style.color = "red";
        });
    } else {
        message.textContent = "Enter all fields first";
        message.style.color = "red";
    }
});
