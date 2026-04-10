# Secure File Sharing System 🔒

A secure, session-based file sharing platform built with Spring Boot and standard web technologies.

## 👥 The Team
* **Project Manager:** Hamza Badshah
* **Backend Developers:** Hammad Tahir & Hamza Badshah
* **Frontend Developers:** Aman Sajid & Hafsa Khan
* **Database Designer:** Esha Chatta

## 🚀 How to Run the Project locally

### 1. Database Setup (Esha's Rules)
* Install MySQL.
* Create a database named `secure_file_db`.
* Update the `application.properties` file in the backend folder with your local MySQL password.

### 2. Backend Setup (Spring Boot)
* Open the `backend` folder in your IDE (VS Code).
* Let Maven download the dependencies.
* Run the `SecureFileApplication.java` file.
* The server will start on `http://localhost:8080`.

### 3. Frontend Setup
* Open the `frontend` folder.
* Open `index.html` in your web browser or use a tool like VS Code Live Server.

## 🛑 Git Workflow (CRITICAL)
**Never push directly to the `main` branch!**
1. Run `git pull origin main` to get the latest code.
2. Create a new branch: `git checkout -b feature-name`.
3. Do your work and commit it.
4. Push your branch: `git push origin feature-name`.
5. Open a Pull Request on GitHub for Hamza to review.
