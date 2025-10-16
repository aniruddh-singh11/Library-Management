const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 3000;

app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../")));

app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true
}));

const db = new sqlite3.Database(path.join(__dirname, "../Library.db"), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
        process.exit(1); 
    } else {
        console.log("Connected to the Library database.");
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../LoginStudent.html"));
});

app.get("/loginStaff", (req, res) => {
    res.sendFile(path.join(__dirname, "../LoginStaff.html"));
});

app.post("/login", (req, res) => {
    const { reg_no, password } = req.body;
    if (!reg_no || !password) {
        return res.status(400).json({ success: false, message: "Missing registration number or password." });
    }

    const query = `SELECT * FROM Student WHERE reg_no = ?`;
    db.get(query, [reg_no], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: "Registration number not found." });
        }
        if (row.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }

        req.session.reg_no = reg_no;
        return res.json({ success: true });
    });
});

app.post("/loginStaff", (req, res) => {
    const { staff_id, password } = req.body;
    if (!staff_id || !password) {
        return res.status(400).json({ success: false, message: "Missing staff ID or password." });
    }

    const query = `SELECT * FROM Staff WHERE staff_id = ?`;
    db.get(query, [staff_id], (err, row) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!row) {
            return res.status(404).json({ success: false, message: "Staff ID not found." });
        }
        if (row.password !== password) {
            return res.status(401).json({ success: false, message: "Incorrect password." });
        }

        req.session.staff_id = staff_id;

        return res.json({ success: true });
    });
});

app.get('/browse-book', (req, res) => {
    const query = `
        SELECT DISTINCT b.title, b.ISBN, a.name AS author, bs.category_name AS category
        FROM Book b
        JOIN Author a ON b.author_id = a.author_id
        JOIN Book_Shelf bs ON b.category_id = bs.category_id
        WHERE b.availability_status = 'y'
    `;

    db.all(query, [], (err, books) => {
        if (err) {
            console.error("Error fetching books:", err.message);
            return res.status(500).json({ success: false, message: "Error fetching books." });
        }

        return res.json({ success: true, books });
    });
});

app.post("/borrow-book", (req, res) => {
    const { title } = req.body;
    const reg_no = req.session.reg_no;

    if (!reg_no) return res.status(401).json({ success: false, message: "You must be logged in to borrow books." });
    if (!title) return res.status(400).json({ success: false, message: "Missing book title." });

    const getBookQuery = `SELECT ISBN, copy_no FROM Book WHERE title = ? AND availability_status = 'y' LIMIT 1`;

    db.get(getBookQuery, [title], (err, book) => {
        if (err) {
            console.error("Error fetching book:", err.message);
            return res.status(500).json({ success: false, message: "Database error." });
        }
        if (!book) return res.status(404).json({ success: false, message: "No available copies of the book." });

        const { ISBN, copy_no } = book;
        const getBorrowIdQuery = `SELECT MAX(borrow_id) AS max_id FROM Borrows`;

        db.get(getBorrowIdQuery, [], (err, row) => {
            if (err) {
                console.error("Error generating borrow ID:", err.message);
                return res.status(500).json({ success: false, message: "Error generating borrow ID." });
            }

            const borrow_id = row.max_id ? row.max_id + 1 : 1;
            const today = new Date();
            const borrow_date = today.toISOString().split('T')[0];
            const returnDateObj = new Date(today);
            returnDateObj.setDate(today.getDate() + 7);
            const return_date = returnDateObj.toISOString().split('T')[0];

            const insertBorrow = `INSERT INTO Borrows (borrow_id, reg_no, ISBN, copy_no, borrow_date, return_date, status)
                                  VALUES (?, ?, ?, ?, ?, ?, 'borrowed')`;

            db.run(insertBorrow, [borrow_id, reg_no, ISBN, copy_no, borrow_date, return_date], function (err) {
                if (err) {
                    let msg = "Failed to insert borrow record.";
                    if (err.message.includes("outstanding fines") || err.message.includes("Cannot borrow more than 3 books")) {
                        msg = err.message;
                    }
                    console.error("Insert borrow failed:", err.message);
                    return res.status(500).json({ success: false, message: msg });
                }
                

                const updateBook = `UPDATE Book SET availability_status = 'n' WHERE ISBN = ? AND copy_no = ?`;

                db.run(updateBook, [ISBN, copy_no], function (err) {
                    if (err) {
                        console.error("Failed to update book availability:", err.message);
                        return res.status(500).json({ success: false, message: "Failed to update book availability." });
                    }
                    return res.json({ success: true, message: "Book borrowed successfully." });
                });
            });
        });
    });
});


app.get("/borrow-history", (req, res) => {
    console.log("Session at /borrow-history:", req.session);

    const reg_no = req.session.reg_no;
    if (!reg_no) return res.status(401).json({ success: false, message: "Not logged in." });

    const query = `
        SELECT DISTINCT b.title, br.ISBN, br.copy_no, br.borrow_date, br.return_date, br.status
        FROM Borrows br
        JOIN Book b ON br.ISBN = b.ISBN
        WHERE br.reg_no = ?
        ORDER BY br.borrow_date DESC;
    `;

    db.all(query, [reg_no], (err, rows) => {
        if (err) {
            console.error("Failed to fetch borrowing history:", err.message);
            return res.status(500).json({ success: false, message: "Failed to fetch borrowing history." });
        }
        return res.json({ success: true, history: rows });
    });
});

app.get("/current-borrows", (req, res) => {
    const reg_no = req.session.reg_no;
    if (!reg_no) {
        return res.status(401).json({ success: false, message: "Not logged in." });
    }

    const query = `
        SELECT title, ISBN, copy_no, borrow_date, return_date
        FROM CurrentBorrowsView
        WHERE reg_no = ?
        ORDER BY borrow_date DESC;
    `;

    db.all(query, [reg_no], (err, rows) => {
        if (err) {
            console.error("Failed to fetch current borrows:", err.message);
            return res.status(500).json({ success: false, message: "Failed to fetch current borrows." });
        }
        return res.json({ success: true, currentBorrows: rows });
    });
});

app.post("/return-book", (req, res) => {
    const { ISBN, copy_no } = req.body;
    const reg_no = req.session.reg_no;

    if (!reg_no) return res.status(401).json({ success: false, message: "Not logged in." });
    if (!ISBN || !copy_no) return res.status(400).json({ success: false, message: "Missing book details." });

    const updateBorrowQuery = `
        UPDATE Borrows
        SET status = 'returned'
        WHERE reg_no = ? AND ISBN = ? AND copy_no = ? AND status = 'borrowed'
    `;

    const updateBookQuery = `
        UPDATE Book
        SET availability_status = 'y'
        WHERE ISBN = ? AND copy_no = ?
    `;

    db.run(updateBorrowQuery, [reg_no, ISBN, copy_no], function(err) {
        if (err) {
            console.error("Error updating borrow record:", err.message);
            return res.status(500).json({ success: false, message: "Error updating borrow record." });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "No matching borrow record found." });
        }

        db.run(updateBookQuery, [ISBN, copy_no], function(err) {
            if (err) {
                console.error("Error updating book availability:", err.message);
                return res.status(500).json({ success: false, message: "Error updating book availability." });
            }

            return res.json({ success: true, message: "Book returned successfully." });
        });
    });
});

app.post("/add-book", (req, res) => {
    // Log the received data for debugging
    console.log("Received data:", req.body);

    const { isbn, name, category, publisher, author, copies } = req.body;

    // Check if all required fields are present
    if (!isbn || !name || !category || !publisher || !author || !copies) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    // Check if copies is a valid number
    if (isNaN(copies) || copies <= 0) {
        return res.status(400).json({ success: false, message: "Invalid number of copies." });
    }

    // Check if category exists
    const checkCategory = `SELECT category_id FROM Book_Shelf WHERE category_name = ?`;
    db.get(checkCategory, [category], (err, categoryRow) => {
        if (err) return res.status(500).json({ success: false, message: "Error checking category." });
        if (!categoryRow) return res.status(400).json({ success: false, message: "Category does not exist." });

        // Check if publisher exists
        const checkPublisher = `SELECT publisher_id FROM Publisher WHERE name = ?`;
        db.get(checkPublisher, [publisher], (err, publisherRow) => {
            if (err) return res.status(500).json({ success: false, message: "Error checking publisher." });
            if (!publisherRow) return res.status(400).json({ success: false, message: "Publisher does not exist." });

            const category_id = categoryRow.category_id;
            const publisher_id = publisherRow.publisher_id;

            // Check if author exists
            const checkAuthor = `SELECT author_id FROM Author WHERE name = ?`;
            db.get(checkAuthor, [author], (err, authorRow) => {
                if (err) return res.status(500).json({ success: false, message: "Error checking author." });

                // Function to insert author and then insert book
                const insertAuthorAndContinue = (author_id) => {
                    const getMaxCopy = `SELECT MAX(copy_no) AS max_copy FROM Book WHERE ISBN = ?`;
                    db.get(getMaxCopy, [isbn], (err, row) => {
                        if (err) return res.status(500).json({ success: false, message: "Error checking existing copies." });

                        let startCopy = row && row.max_copy ? row.max_copy + 1 : 1;
                        const insertStmt = db.prepare(`INSERT INTO Book (ISBN, title, category_id, publisher_id, author_id, copy_no, availability_status) VALUES (?, ?, ?, ?, ?, ?, 'y')`);
                        for (let i = 0; i < copies; i++) {
                            insertStmt.run([isbn, name, category_id, publisher_id, author_id, startCopy + i]);
                        }

                        insertStmt.finalize((err) => {
                            if (err) {
                                return res.status(500).json({ success: false, message: "Failed to add book copies." });
                            }
                            return res.json({ success: true, message: "Book copies added successfully." });
                        });
                    });
                };

                // If author exists, insert and continue
                if (authorRow) {
                    insertAuthorAndContinue(authorRow.author_id);
                } else {
                    // If author doesn't exist, insert the author first
                    const insertAuthor = `INSERT INTO Author (name) VALUES (?)`;
                    db.run(insertAuthor, [author], function(err) {
                        if (err) return res.status(500).json({ success: false, message: "Failed to insert new author." });
                        insertAuthorAndContinue(this.lastID); // `this.lastID` for new author
                    });
                }
            });
        });
    });
});

app.get("/students-with-current-borrows", (req, res) => {
    const query = `
        SELECT DISTINCT student_info.reg_no, student_info.name, book_info.title, br.borrow_date, br.return_date
        FROM (
            SELECT s.reg_no, s.name
            FROM Student s
            WHERE EXISTS (
                SELECT 1
                FROM Borrows br_sub
                WHERE br_sub.reg_no = s.reg_no AND br_sub.status = 'borrowed'
            )
        ) AS student_info
        JOIN Borrows br ON student_info.reg_no = br.reg_no
        JOIN (
            SELECT ISBN, title
            FROM Book
        ) AS book_info ON br.ISBN = book_info.ISBN
        WHERE br.status = 'borrowed'
        ORDER BY student_info.name;

    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error fetching students with current borrows:", err.message);
            return res.status(500).json({ success: false, message: "Error fetching data." });
        }
        res.json({ success: true, studentsWithCurrentBorrows: rows });
    });
});

app.post("/issue-fine", (req, res) => {
    const staff_id = req.session.staff_id;
    const { reg_no, reason } = req.body;

    if (!staff_id) {
        return res.status(401).json({ message: "Staff not logged in." });
    }

    const checkStudentQuery = "SELECT * FROM Student WHERE reg_no = ?";
    const getReasonIdQuery = "SELECT reason_id FROM Fine_Reason WHERE reason = ?";
    const getNextFineIdQuery = "SELECT MAX(fine_id) AS max_id FROM Fines";
    const insertFineQuery = `
        INSERT INTO Fines (fine_id, staff_id, reg_no, reason_id, status)
        VALUES (?, ?, ?, ?, 'unpaid')
    `;

    db.get(checkStudentQuery, [reg_no], (err, student) => {
        if (err) return res.status(500).json({ message: "DB error checking student." });
        if (!student) return res.status(400).json({ message: "Student does not exist." });

        db.get(getReasonIdQuery, [reason], (err, reasonRow) => {
            if (err) return res.status(500).json({ message: "DB error getting reason_id." });
            if (!reasonRow) return res.status(400).json({ message: "Fine reason does not exist." });

            const reason_id = reasonRow.reason_id;

            db.get(getNextFineIdQuery, [], (err, row) => {
                if (err) return res.status(500).json({ message: "Error getting next fine ID." });

                const nextFineId = row.max_id ? row.max_id + 1 : 1;

                db.run(insertFineQuery, [nextFineId, staff_id, reg_no, reason_id], function (err) {
                    if (err) return res.status(500).json({ message: "Error inserting fine." });
                    res.status(200).json({ message: "Fine issued successfully.", fine_id: nextFineId });
                });
            });
        });
    });
});

app.get("/fine-reasons", (req, res) => {
    const query = "SELECT reason FROM Fine_Reason";

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ message: "Failed to fetch fine reasons." });
        const reasons = rows.map(row => row.reason);
        res.json({ reasons });
    });
});

app.get("/student-fines", (req, res) => {
    const studentRegNo = req.session.reg_no; // Assume student registration number is stored in session after login

    if (!studentRegNo) {
        return res.status(401).json({ message: "Student not logged in." });
    }

    // Query to get student details excluding phone number(s)
    const studentQuery = `
        SELECT s.name, s.reg_no
        FROM Student s
        WHERE s.reg_no = ?
    `;

    const finesQuery = `
        SELECT f.fine_id, st.name AS staff_name, fr.amount, fr.reason
        FROM Fines f
        JOIN Staff st ON f.staff_id = st.staff_id
        JOIN Fine_Reason fr ON f.reason_id = fr.reason_id
        WHERE f.reg_no = ? AND f.status = 'unpaid';
    `;

    db.get(studentQuery, [studentRegNo], (err, student) => {
        if (err) {
            console.error("Error fetching student details:", err.message);
            return res.status(500).json({ message: "Error fetching student details." });
        }
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        db.all(finesQuery, [studentRegNo], (err, fines) => {
            if (err) {
                console.error("Error fetching fines:", err.message);
                return res.status(500).json({ message: "Error fetching fines." });
            }

            res.json({ student, fines });
        });
    });
});

app.post("/pay-fine/:fineId", (req, res) => {
    const fineId = req.params.fineId;

    const payFineQuery = "UPDATE Fines SET status = 'paid' WHERE fine_id = ?";

    db.run(payFineQuery, [fineId], function (err) {
        if (err) return res.status(500).json({ message: "Error paying fine." });
        res.json({ success: true });
    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
