
# Patient Management System

This Patient Management System provides secure management of patient records and appointments, with role-based access control for different users: Admins, Doctors, and Patients. It is built with **Express.js** and **MongoDB**, with **JWT authentication** to ensure secure access.

## Table of Contents
- [Features](#features)
- [Requirements](#requirements)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Postman Collection](#postman-collection)

## Features
- **JWT Authentication**: Secure access with JWT-based authentication.
- **Role-Based Access Control**:
  - **Admins**: Full access to all patient records and appointments.
  - **Doctors**: Access to their assigned patients and appointments.
  - **Patients**: Access to view and manage their own records and appointments.
- **CRUD Operations**: Perform CRUD operations on patient records and appointments, based on user roles.
- **Appointments**: Patients can create appointments with doctors; Doctors can view and update their assigned     appointments.

## Requirements
- Node.js (>=14.x)
- MongoDB (local or cloud-based, e.g., MongoDB Atlas)
- Git

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/kaniket7209/patient-mangement-system.git
cd patient-mangement-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configuration

Create a `.env` file in the root directory to store environment variables:

PORT=6600                      # Port for the application
MONGO_URI=<Your MongoDB URI>   # MongoDB connection URI
JWT_SECRET=<Your JWT Secret>   # Secret key for JWT token signing


> **Note:** Ensure `.env` is added to `.gitignore` to avoid sensitive data exposure.

### 4. Run MongoDB

Make sure MongoDB is running on your system or connected to a cloud-based MongoDB instance.

## Running the Application

1. **Start the server**
   npm start
  

2. **Server URL**
   The server should be running on [http://localhost:6600](http://localhost:6600).

3. **API Base URL**
   http://localhost:6600/api
   

## Project Structure
The project follows a structured approach for modularity and scalability.

├── server.js                 # Entry point of the application
├── config/                   # Configuration files
│   └── db.js                 # Database connection setup
├── controllers/              # API controller functions
├── middleware/               # Authentication and authorization middleware
├── routes/                   # API route handlers
│   ├── authRoutes.js         # Authentication routes
│   ├── patientRoutes.js      # Patient management routes
│   └── appointmentRoutes.js  # Appointment management routes
└── utils/                    # Utility functions


## API Documentation

### Authentication APIs
- **Login** - `POST /api/auth/login`
  - Payload: `{ "username": "string", "password": "string" }`
  - Response: JWT token upon successful login.

### Patient APIs
- **Create Patient** (Admin/Doctor) - `POST /api/patients/add`
- **Get Patients** - `GET /api/patients`  
  - Admins get all patients, Doctors get assigned patients, Patients get their own records.
- **Update Patient** (Admin/Doctor) - `PUT /api/patients/:id`
- **Delete Patient** (Admin) - `DELETE /api/patients/:id`

### Appointment APIs
- **Create Appointment** (Patient/Admin) - `POST /api/appointments`
- **Get Appointments** - `GET /api/appointments`
  - Admins get all appointments, Doctors get their assigned appointments, Patients get their own appointments.
- **Get Appointment by ID** - `GET /api/appointments/:appointmentId`
- **Update Appointment** (Doctor/Admin) - `PUT /api/appointments/:appointmentId`
- **Delete Appointment** (Admin) - `DELETE /api/appointments/:appointmentId`

## Postman Collection

A Postman collection for testing all API endpoints has been provided. To use the collection:
1. Import the `Postman_collection.json` file into Postman.
2. Set the `{{baseUrl}}` variable to `http://localhost:6600/api`.
