
# 🔐 Password Manager

A full-stack Password Manager built with **React**, **Express.js**, and **MongoDB**. This application allows users to **sign up**, **log in**, and securely manage their passwords.

---

## 🚀 Features

- User Authentication (Signup & Login)
- Add, Edit, and Delete Passwords
- Encrypted Storage using bcrypt and JWT
- Responsive UI with React
- Backend REST API with Express.js
- MongoDB for persistent storage

---

## 📁 Tech Stack

- **Frontend**: React, Tailwind CSS (or any UI framework)
- **Backend**: Express.js, Node.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt

---

## 🔧 Installation

### Clone the repository
```bash
git clone https://github.com/MuhammadSaim0604/Password-Manager-Backend.git
cd Password-Manager-Backend
```



### Backend Setup
```bash
cd Password-Manager-Backend
npm install
```
Create a `.env` file inside the `Password-Manager-Backend` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Then run this command:

```bash
npm start
```



### Frontend Setup

#### Clone the repository:
```bash
git clone https://github.com/MuhammadSaim0604/Pass-Manager-Frontend.git
cd Pass-Manager-Frontend
```


Go inside the `Pass-Manager-Frontend` directory and run these commands:


```bash
npm install
npm start
```

---

## 🧪 API Endpoints

### Auth Routes
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login and get token

### Password Routes (require JWT)
- `GET /api/passwords` - Fetch all passwords
- `POST /api/passwords` - Add new password
- `PUT /api/passwords/:id` - Update password
- `DELETE /api/passwords/:id` - Delete password

---

## 🔐 Security

- Passwords stored in the DB are **encrypted**
- JWT is used for user session validation
- Protected routes with authentication middleware

---

## 📷 Screenshots

![Home Page](https://raw.githubusercontent.com/MuhammadSaim0604/Password-Manager/refs/heads/main/public/BB.png "Image title")

---

## 📄 License

This project is licensed under the MIT License.
