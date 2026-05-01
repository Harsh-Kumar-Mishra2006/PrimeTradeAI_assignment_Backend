# Role-Based Backend with MongoDB

A scalable REST API with authentication, role-based access control, and task management using Node.js, Express, and MongoDB.

## Features

✅ **Authentication & Authorization**

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access (User vs Admin)
- Protected routes

✅ **Task Management CRUD**

- Create, Read, Update, Delete tasks
- Task filtering by status and priority
- Pagination support
- Task statistics aggregation

✅ **Security Features**

- Input validation & sanitization
- Rate limiting
- Helmet.js for security headers
- CORS enabled
- Password complexity requirements

✅ **API Documentation**

- Swagger/OpenAPI documentation
- Postman collection support

✅ **Scalability Features**

- MongoDB indexes for performance
- Connection pooling
- Pagination for large datasets
- Aggregation pipeline for stats
- Modular architecture

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Security**: helmet, express-rate-limit, cors

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn
