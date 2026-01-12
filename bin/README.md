# E-Commerce Backend System

A production-ready E-Commerce REST API built with Java 17 and Spring Boot 3.

## Tech Stack
- **Java 17**
- **Spring Boot 3.x** (Web, Data JPA, Security, Validation)
- **MySQL 8.x**
- **Spring Security + JWT** (Stateless Authentication)
- **Maven**

## Prerequisites
1.  JDK 17 installed.
2.  MySQL Server installed and running.
3.  Maven installed (optional, wrapper included).

## Setup & Configuration

1.  **Database Setup**
    Create a MySQL database named `ecommerce_db`.
    ```sql
    CREATE DATABASE ecommerce_db;
    ```

2.  **Configure Credentials**
    Open `src/main/resources/application.properties` and update your database username and password:
    ```properties
    spring.datasource.username=YOUR_DB_USERNAME
    spring.datasource.password=YOUR_DB_PASSWORD
    ```

## How to Run

Run the application using Maven:
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`.

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user.
  ```json
  { "username": "user", "password": "password", "role": ["user"] }
  ```
- `POST /api/auth/login`: Login to get JWT Token.

### Products
- `GET /api/products`: Public access.
- `POST /api/products`: Admin only.

### Cart
- `GET /api/cart`: Get your cart.
- `POST /api/cart/items`: Add item to cart.

### Orders
- `POST /api/orders`: Checkout cart to order.

## Security
- Include the JWT token in the `Authorization` header for protected endpoints:
  `Authorization: Bearer <your_token>`
