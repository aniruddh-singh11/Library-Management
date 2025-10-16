CREATE TABLE Student (
    reg_no TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE Student_Phone (
    reg_no TEXT,
    phone_no TEXT,
    PRIMARY KEY (reg_no, phone_no),
    FOREIGN KEY (reg_no) REFERENCES Student(reg_no)
);

CREATE TABLE Role (
    role_id INTEGER PRIMARY KEY,
    role TEXT NOT NULL,
    salary REAL
);

CREATE TABLE Staff (
    staff_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER,
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

CREATE TABLE Book_Shelf (
    category_id INTEGER PRIMARY KEY,
    category_name TEXT NOT NULL,
    shelf_no TEXT
);

CREATE TABLE Publisher (
    publisher_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT
);

CREATE TABLE Author (
    author_id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE Book (
    ISBN TEXT,
    copy_no INTEGER,
    title TEXT NOT NULL,
    category_id INTEGER,
    publisher_id INTEGER,
    author_id INTEGER,
    availability_status TEXT,
    PRIMARY KEY (ISBN, copy_no),
    FOREIGN KEY (category_id) REFERENCES Book_Shelf(category_id),
    FOREIGN KEY (publisher_id) REFERENCES Publisher(publisher_id),
    FOREIGN KEY (author_id) REFERENCES Author(author_id)
);



CREATE TABLE Borrows (
    borrow_id INTEGER PRIMARY KEY,
    reg_no TEXT,
    ISBN TEXT,
    copy_no INTEGER,
    borrow_date TEXT,
    return_date TEXT, status TEXT CHECK (status IN ('borrowed', 'returned')) DEFAULT 'borrowed',
    FOREIGN KEY (reg_no) REFERENCES Student(reg_no),
    FOREIGN KEY (ISBN, copy_no) REFERENCES Book(ISBN, copy_no)
);

CREATE TABLE Mode_Of_Borrow (
    reg_no TEXT PRIMARY KEY,
    mode_of_borrow TEXT,
    FOREIGN KEY (reg_no) REFERENCES Student(reg_no)
);

CREATE TABLE Fine_Reason (
    reason_id INTEGER PRIMARY KEY,
    reason TEXT,
    amount REAL
);

CREATE TABLE Fines (
    fine_id INTEGER PRIMARY KEY,
    staff_id TEXT,
    reg_no TEXT,
    status TEXT DEFAULT 'unpaid',
    reason_id INTEGER,
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id),
    FOREIGN KEY (reg_no) REFERENCES Student(reg_no),
    FOREIGN KEY (reason_id) REFERENCES Fine_Reason(reason_id),
    CHECK (status IN ('paid', 'unpaid'))
);


INSERT INTO Student (reg_no, name, password) VALUES 
('230911544', 'Aniruddh Singh', 'password123'),
('230911430', 'Vasu Narula', 'password123'),
('230911434', 'Pranav Ganesh', 'password123'),
('230953101', 'Riya Mehta', 'pass456'),
('220911205', 'Kunal Sharma', 'abc123'),
('230953777', 'Megha Patel', 'testpass'),
('220911010', 'Soham Das', 'hello123'),
('230911321', 'Divya Kapoor', 'divya321'),
('230911145', 'Aarav Iyer', 'aarav2025'),
('220953999', 'Neha Verma', 'verma@22');


INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911544, '1234567890');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911430, '2345678901');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911434, '3456789012');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911547, '4567890123');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911547, '4578901234'); 
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911548, '5678901234');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911549, '6789012345');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911549, '6790123456'); 
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911550, '7890123456');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911550, '7891234567'); 
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911551, '8901234567');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911552, '9012345678');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911552, '9023456789');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911553, '0123456789');
INSERT INTO Student_Phone (reg_no, phone_no) VALUES (230911553, '0134567890'); 


INSERT INTO Role (role_id, role, salary) VALUES (1, 'Admin', 50000);
INSERT INTO Role (role_id, role, salary) VALUES (2, 'Librarian', 40000);
INSERT INTO Role (role_id, role, salary) VALUES (3, 'Assistant', 30000);


INSERT INTO Staff (staff_id, name, password, role_id) VALUES ('S001', 'John Doe', 'password123', 1);
INSERT INTO Staff (staff_id, name, password, role_id) VALUES ('S002', 'Jane Smith', 'password456', 2);
INSERT INTO Staff (staff_id, name, password, role_id) VALUES ('S003', 'Alice Brown', 'password789', 3);
INSERT INTO Staff (staff_id, name, password, role_id) VALUES ('S004', 'Bob White', 'password101', 2);
INSERT INTO Staff (staff_id, name, password, role_id) VALUES ('S005', 'Charlie Green', 'password202', 1);


INSERT INTO Author (author_id, name) VALUES ('101', 'J.K. Rowling');
INSERT INTO Author (author_id, name) VALUES ('102', 'George R.R. Martin');
INSERT INTO Author (author_id, name) VALUES ('103', 'J.R.R. Tolkien');
INSERT INTO Author (author_id, name) VALUES ('104', 'Agatha Christie');
INSERT INTO Author (author_id, name) VALUES ('105', 'Leo Tolstoy');


INSERT INTO Publisher (publisher_id, name, address) VALUES
(201, 'Penguin Random House', '1745 Broadway, New York, NY 10019'),
(202, 'HarperCollins', '195 Broadway, New York, NY 10007'),
(203, 'Simon & Schuster', '1230 Avenue of the Americas, New York, NY 10020'),
(204, 'Macmillan Publishers', '120 Broadway, New York, NY 10271'),
(205, 'Hachette Book Group', '1290 Avenue of the Americas, New York, NY 10104');


INSERT INTO Book_Shelf (category_id, category_name, shelf_no) VALUES
(1, 'Fiction', 'S01'),
(2, 'Non-Fiction', 'S02'),
(3, 'Action', 'S03'),
(4, 'Adventure', 'S04'),
(5, 'Science', 'S05'),
(6, 'Romance', 'S06'),
(7, 'Mystery', 'S07'),
(8, 'Fantasy', 'S08');


SELECT DISTINCT b.title, br.ISBN, br.copy_no, br.borrow_date, br.return_date, br.status
FROM Borrows br
JOIN Book b ON br.ISBN = b.ISBN
WHERE br.reg_no = 230911544
ORDER BY br.borrow_date DESC;

SELECT DISTINCT b.title, br.ISBN, br.copy_no, br.borrow_date, br.return_date, br.status
FROM Borrows br
JOIN Book b ON br.ISBN = b.ISBN
WHERE br.reg_no = 230911544 AND br.status = 'borrowed'
ORDER BY br.borrow_date DESC;

SELECT f.fine_id, s.name, f.amount, fr.reason
FROM Fines f
JOIN Staff s ON f.staff_id = s.staff_id
JOIN Fine_Reason fr ON f.reason_id = fr.reason_id
WHERE f.reg_no = 230911544 AND f.status = 'unpaid';


CREATE TRIGGER prevent_borrow_due_to_fines
BEFORE INSERT ON Borrows
FOR EACH ROW
BEGIN
    SELECT
        CASE
            WHEN (
                SELECT IFNULL(SUM(fr.amount), 0)
                FROM Fines f
                JOIN Fine_Reason fr ON f.reason_id = fr.reason_id
                WHERE f.reg_no = NEW.reg_no AND f.status = 'unpaid'
            ) >= 300
            THEN RAISE(ABORT, 'You cannot borrow more books until you pay your outstanding fines.')
        END;
END;


CREATE VIEW CurrentBorrowsView AS
SELECT b.title, br.ISBN, br.copy_no, br.borrow_date, br.return_date, br.reg_no
FROM Borrows br
JOIN Book b ON br.ISBN = b.ISBN
WHERE br.status = 'borrowed';

CREATE TRIGGER LimitThreeBorrows
BEFORE INSERT ON Borrows
FOR EACH ROW
BEGIN
    -- Count current borrows by the same student
    SELECT
        CASE
            WHEN (SELECT COUNT(*) FROM Borrows
                  WHERE reg_no = NEW.reg_no AND status = 'borrowed') >= 3
            THEN
                RAISE(ABORT, 'Cannot borrow more than 3 books at a time.')
        END;
END;

SHOW TRIGGERS LIKE 'LimitThreeBorrows';