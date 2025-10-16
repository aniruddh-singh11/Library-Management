document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

function fetchBooks() {
    fetch('/browse-book')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayBooks(data.books);
            } else {
                alert("Failed to fetch books.");
            }
        })
        .catch(err => {
            console.error("Error fetching books:", err);
            alert("Error loading books.");
        });
}

function displayBooks(books) {
    const container = document.getElementById('book-list');  // Corrected ID to 'book-list'
    container.innerHTML = '';  // Clear existing table rows

    books.forEach(book => {
        const row = document.createElement('tr');  // Create a new table row

        const title = document.createElement('td');
        title.textContent = book.title;

        const isbn = document.createElement('td');
        isbn.textContent = book.ISBN;

        const author = document.createElement('td');
        author.textContent = book.author;

        const category = document.createElement('td');
        category.textContent = book.category;

        const borrowBtnCell = document.createElement('td');
        const borrowBtn = document.createElement('button');
        borrowBtn.textContent = "Borrow";
        borrowBtn.onclick = () => borrowBook(book.title);
        borrowBtn.classList.add('borrow-row-btn');  // Add the 'borrow-row-btn' class

        borrowBtnCell.appendChild(borrowBtn);

        row.appendChild(title);
        row.appendChild(isbn);
        row.appendChild(author);
        row.appendChild(category);
        row.appendChild(borrowBtnCell);

        container.appendChild(row);  // Append row to table body
    });
}


function borrowBook(title) {
    fetch('/borrow-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.success) fetchBooks();
    })
    .catch(err => {
        console.error("Borrow error:", err);
        alert("Error processing borrow request.");
    });
}
