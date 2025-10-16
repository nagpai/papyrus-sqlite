# Papyrus - A Book Library Management Software

Papyrus is a desktop application with a mobile variant designed to help a librarian manage a book library effectively. It provides features for cataloging books, managing borrowers, managing privileged librarian accounts, and generating reports. The software is meant to be used for an apartment block that has wings A, B, C, and D. each wing has 27 floors, and each floor has 4 apartments. Apartment numbers are in the format A101, B2503, e.t.c.

The application will be hosted locally on a desktop computer running Ubuntu Linux or Arch Linux, and the mobile variant (Android) will connect to the desktop application over a local network. The mobile variant is an add-on, while the desktop application is the main software.


## Features
- **Book Cataloging**: Add, edit, and delete book records with details such as title, author, ISBN, genre, and publication date. Each book should have a unique ID. If there are multiple copies of the same book, each copy should have its own unique ID.

- **Borrower Management**: Register, edit, and delete borrower records with details such as name, apartment number, and wing. The system should track date of registering and exit of the borrower. Each apartment can have floating number of borrowers since some of them have tenancy. Apartments also have more than one family members who can borrow books. A borrower profile page should show their details and history of borrowed books, including anything that is unreturned. 

- **Librarian Accounts**: Create and manage privileged librarian accounts with different access levels. Librarians can add, edit, and delete book and borrower records. The software should keep a record or audit trail of all actions performed by the librarian. This should be visible in the borrower as well as book profile page, in the history of actions. 

- **Book Borrowing and Returning**: Allow borrowers to borrow and return books. The system should track the borrowing date, due date, and return date. It should also calculate and display any overdue warnings based on a configurable fine rate. Each apartment can borrow a maximum of 3 books at a time. If they have overborrowed, they should not be allowed to borrow more until they return the excess books.

- **Search and Filter**: Implement search and filter functionality to easily find books and borrowers based on various criteria such as title, author, genre, apartment number, and wing. The home page of the software should have a simple "search anything" search bar that searches through both books and borrowers.

- **Reporting**: Generate reports on library usage, including the most borrowed books, active borrowers, overdue books, and librarian activity. Reports should be exportable in common formats such as PDF and CSV.

- **User Interface**: Design a user-friendly interface for both desktop and mobile versions of the application. The interface should be intuitive and easy to navigate, with clear labels and instructions.

- **Data Backup and Restore**: Implement a data backup and restore feature to prevent data loss. The system should allow for regular backups and easy restoration of data when needed.

- **Notifications**: Send notifications to borrowers for due dates, overdue books, and other important updates. Notifications can be sent via email or SMS.
- **Security**: Ensure that the application is secure, with proper authentication and authorization mechanisms in place to protect sensitive data.
- **Scalability**: Design the application to be scalable, allowing for future enhancements and additional features as needed.

## Technology Stack
- **Frontend**: React.js for the web application, React Native for the mobile application (Android).
- **Backend**: Node.js with Express.js for the server-side logic and API development.
- **Database**: SQLite for local data storage.
- **Authentication**: JWT (JSON Web Tokens) for secure authentication and authorization.
- **Notifications**: Integration with email and SMS services for sending notifications.
- **Reporting**: Libraries like jsPDF for PDF generation and csv-writer for CSV export
- **Desktop Packaging**: Electron for packaging as a native desktop application for Ubuntu Linux and Arch Linux
- **Build Tools**: electron-builder for creating Linux installers (.deb for Ubuntu, .pacman/.tar.gz for Arch Linux, AppImage for universal Linux compatibility)

## References
- an earlier rudimentary version of this software can be found at https://github.com/nagpai/papyrusv2 . It was made using Electron.js and vanilla JavaScript. This new version is a complete rewrite using modern technologies and best practices as described above.
