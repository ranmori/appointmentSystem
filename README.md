# **Doc Meet: Appointment System Documentation**

-----

## 1\. Project Overview

**Doc Meet** is a full-stack web application designed to streamline the process of booking and managing medical appointments for doctors and patients. It features a robust multi-role architecture, providing dedicated interfaces for **Patients**, **Doctors**, and **Administrators**.

### Key Features

  * **User Authentication & Authorization**: Secure registration and login supporting three distinct roles: Patient, Doctor, and Admin. Access control ensures users only interact with relevant features.
  * **Patient Functionality**:
      * Browse and search doctor profiles (filter by specialization).
      * Securely book appointments by selecting an available time slot.
      * View and cancel upcoming appointments (subject to a 24-hour policy).
  * **Doctor Functionality**:
      * Manage personal availability by setting available dates and time slots.
      * View a list of all upcoming patient appointments.
      * Update profile information, including specialization.
  * **Admin Panel**:
      * Centralized dashboard with key metrics (users, doctors, appointments).
      * Full **User Management** (view, edit roles, delete accounts).
      * Full **Doctor and Appointment Management** (update status, delete records).

-----

## 2\. Technology Stack

This application utilizes a modern MERN-stack architecture (with React and Vite for the frontend) to ensure a fast, scalable, and maintainable codebase.

### 🚀 Frontend (Client)

| Technology | Purpose |
| :--- | :--- |
| **React.js** | Core JavaScript library for building the user interface. |
| **Vite** | Fast build tool and development server for the React project. |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development and styling. |
| **React Router DOM** | Declarative routing for navigation between pages. |
| **Axios** | Promise-based HTTP client for making API requests to the backend. |
| **React Icons** | Integration of popular, high-quality icon libraries. |

### ⚙️ Backend (Server)

| Technology | Purpose |
| :--- | :--- |
| **Node.js** | JavaScript runtime environment. |
| **Express.js** | Minimalist web framework for building the RESTful API. |
| **MongoDB / Mongoose** | **MongoDB** is the NoSQL document database. **Mongoose** is the Object Data Modeling (ODM) library for Node.js, providing structure and schema validation. |
| **jsonwebtoken (JWT)** | Secure user authentication and authorization via JSON Web Tokens. |
| **bcryptjs** | Library for hashing and comparing passwords. |
| **cors** | Middleware to enable Cross-Origin Resource Sharing. |
| **dotenv** | Loads environment variables from a `.env` file. |
| **express-rate-limit** | Middleware for basic rate-limiting to protect against brute-force attacks. |

-----


## 3\. Usage

Once both the backend and frontend are running:

1.  Open your browser and navigate.
2.  **Register**: Create a new account. You can register as a Patient, Doctor, or Admin.
3.  **Explore**:
      * **Patients** can browse doctors and book appointments.
      * **Doctors** must manage their availability via their dashboard before accepting appointments.
      * **Admins** can access the Admin Panel from the sidebar to manage all system entities.

-----

## 4\. Contributing and Licensing

### 🤝 Contributing

Contributions are welcome\! If you have suggestions for improvements or find any bugs, please follow the standard GitHub workflow:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

### 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file in the repository root for full details.
