Doc Meet.
Doc Meet. is a full-stack web application designed to streamline the process of booking and managing medical appointments. It provides a user-friendly interface for patients to find and book appointments with doctors, and robust management panels for doctors to manage their availability and for administrators to oversee the entire system.

✨ Features
User Authentication & Authorization: Secure registration and login for Patients, Doctors, and Admins. Role-based access control ensures users only see relevant features.

Patient Dashboard: View upcoming appointments, quick access to book new appointments.

Doctor Profiles: Patients can browse a list of doctors, filter by specialization, and search by name.

Appointment Booking: Patients can select a doctor, choose an available date and time slot, and provide details like symptoms and notes.

Appointment Management (Patient/Doctor):

Patients can view their booked appointments and cancel them (with a 24-hour cancellation policy).

Doctors can view their upcoming patient appointments.

Doctor Availability Management: Doctors can manage their available dates and time slots for appointments.

User Profile Settings: Users can update their personal information, including username, email, name, location, and profile image. Doctors can also update their specialization.

Admin Panel:

Dashboard: Overview of total users, doctors, and appointments, including pending appointments.

User Management: View, edit (including role change), and delete any user account.

Doctor Management: View, edit (specialization), and delete doctor profiles. Deleting a doctor also deletes their associated user account and appointments.

Appointment Management: View all appointments, update appointment statuses (e.g., pending, booked, cancelled, completed), and delete appointments.

🚀 Technologies Used
Frontend:

React.js: A JavaScript library for building user interfaces.

React Router DOM: For declarative routing in React applications.

Axios: Promise-based HTTP client for making API requests.

Tailwind CSS: A utility-first CSS framework for rapid UI development.

React Icons: For easily including popular icon libraries.

Vite: A fast build tool for modern web projects.

Backend:

Node.js: A JavaScript runtime environment.

Express.js: A fast, unopinionated, minimalist web framework for Node.js.

MongoDB: A NoSQL document database.

Mongoose: An ODM (Object Data Modeling) library for MongoDB and Node.js.

bcryptjs: For hashing and comparing passwords.

jsonwebtoken (JWT): For secure user authentication.

dotenv: To load environment variables from a .env file.

cors: Node.js middleware for enabling Cross-Origin Resource Sharing.

express-rate-limit: Basic rate-limiting middleware to protect against brute-force attacks.

Database:

MongoDB Atlas: Cloud-hosted MongoDB service.

🛠️ Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (LTS version recommended)

npm (comes with Node.js) or Yarn

A MongoDB Atlas account and a cluster set up.

1. Clone the Repository
First, clone both your frontend and backend repositories to your local machine. Assuming you have them in separate repos:

# Clone Frontend
git clone https://github.com/YOUR_USERNAME/YOUR_FRONTEND_REPO_NAME.git
cd YOUR_FRONTEND_REPO_NAME

# Clone Backend
git clone https://github.com/YOUR_USERNAME/YOUR_BACKEND_REPO_NAME.git
cd YOUR_BACKEND_REPO_NAME

2. Backend Setup
Navigate into your backend project directory:

cd YOUR_BACKEND_REPO_NAME

Install Dependencies
npm install
# or
yarn install

Environment Variables (.env)
Create a .env file in the root of your backend directory and add the following variables. Replace the placeholder values with your actual credentials and URLs.

PORT=3022
MongoDB=mongodb+srv://<your-username>:<your-password>@appointment.kci2mkp.mongodb.net/<your-database-name>?retryWrites=true&w=majority
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

MongoDB: Your MongoDB Atlas connection string. Make sure to replace <your-username>, <your-password>, and <your-database-name>.

JWT_SECRET: A strong, random string for signing JWTs. You can generate one online or use a tool.

CLIENT_URL: The URL where your frontend application will be running locally.

Start the Backend Server
node server.mjs
# or if you have a start script in package.json
npm start

The server should start on http://localhost:3022.

3. Frontend Setup
Navigate into your frontend project directory:

cd YOUR_FRONTEND_REPO_NAME

Install Dependencies
npm install
# or
yarn install

Environment Variables (.env)
Create a .env file in the root of your frontend directory and add the following variable:

VITE_API_URL=http://localhost:3022

VITE_API_URL: This points to your locally running backend server.

Start the Frontend Application
npm run dev
# or
yarn dev

The frontend application should start on http://localhost:5173 (or another port if configured).

📊 Database Setup (MongoDB Atlas)
Create a Cluster: If you don't have one, create a free tier cluster on MongoDB Atlas.

Create a Database User: Set up a database user with a strong password.

Network Access: Configure network access to allow connections from your current IP address (for local development) and later, from your deployment platforms (Vercel, Render/Railway).

Get Connection String: Obtain the connection string for your application and use it for the MongoDB variable in your backend's .env file.

🚀 Deployment
This application is designed for a split deployment:

Frontend (React): Ideal for platforms like Vercel.

Backend (Node.js/Express): Ideal for platforms like Render or Railway which support persistent Node.js services.

General Deployment Steps:
Ensure .env files are in .gitignore for both frontend and backend projects.

Push both your frontend and backend codebases to separate GitHub repositories.

Deploy Backend First (e.g., to Render.com):

Create a new Web Service on Render.

Connect your backend GitHub repository.

Crucially, set environment variables in Render's dashboard:

MongoDB: Your MongoDB Atlas connection string.

JWT_SECRET: Your production JWT secret.

NODE_ENV: production

CLIENT_URL: Initially, you can set this to a placeholder or * (less secure for initial testing) if you don't know your frontend URL yet. You MUST update this later to your Vercel frontend URL.

Once deployed, copy the public URL of your backend service (e.g., https://your-backend-api.onrender.com).

Deploy Frontend (to Vercel):

Create a new Project on Vercel.

Connect your frontend GitHub repository.

Crucially, set environment variables in Vercel's project settings:

VITE_API_URL: Set this to the public URL of your deployed backend API (e.g., https://your-backend-api.onrender.com).

Once deployed, copy the public URL of your frontend application (e.g., https://your-frontend-app.vercel.app).

Final Backend Update:

Go back to your backend service on Render (or your chosen backend host).

Update the CLIENT_URL environment variable to the exact public URL of your Vercel-deployed frontend (e.g., https://your-frontend-app.vercel.app). This ensures CORS is correctly configured.

Trigger a redeploy of your backend.

🧑‍💻 Usage
Register: Create a new account as a Patient, Doctor, or Admin.

Login: Log in with your registered credentials.

Explore:

Patients: Browse doctors, book appointments, view your appointments.

Doctors: Manage your availability, view your patient appointments.

Admins: Access the Admin Panel from the sidebar to manage users, doctors, and all appointments.

🤝 Contributing
Contributions are welcome! If you have suggestions for improvements or find any issues, please open an issue or submit a pull request.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
