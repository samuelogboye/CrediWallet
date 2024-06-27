# CrediWallet

## Overview

CrediWallet is a wallet application that allows users to fund their accounts, transfer funds, and withdraw money. It includes features for user management, authentication, and admin functionalities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technologies](#technologies)
- [Setup](#setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [E-R Diagram](#e-r-diagram)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- User Registration and Authentication
- Account Funding
- Funds Transfer
- Withdrawal
- Admin functionalities (block/unblock user, assign/remove admin role)
- Detailed Transaction History
- Input validation and error handling
- JWT-based Authentication

## Technologies

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MySQL, Knex.js ORM
- **Testing**: Jest
- **Other Libraries**: bcrypt, jsonwebtoken, body-parser, express-validator

## Setup

### Requirements

- Node.js
- MySQL
- npm or yarn

### Installation

1.  Clone the repository:
2.  Install dependencies:

### Configuration

1.  Create a `.env` file in the root directory and add the necessary environment variables:
2.  Run database migrations:

```bash
npx knex migrate:latest
```

### Running the Application

To start the application, run:

```bash
npm start
```

## Usage

### Register a New User

### Log in an Existing User

### Fund Account

### Transfer Funds

### Withdraw Funds

## API Documentation

Detailed API documentation is available and accessible via Swagger UI. To view the documentation, navigate to:

```bash
http://localhost:3000/api/docs
```

## E-R Diagram

The Entity-Relationship diagram provides a visual representation of the database schema and relationships.

### Entities and Relationships

1.  **User**

    - `id` (PK, Integer)
    - `name` (String)
    - `email` (String)
    - `password` (String)
    - `account_number` (String)
    - `balance` (Float)
    - `role` (String, enum: ['user', 'admin'])
    - `created_at` (Timestamp)
    - `updated_at` (Timestamp)

2.  **Transaction**

    - `id` (PK, Integer)
    - `user_id` (FK, Integer)
    - `type` (String, enum: ['fund', 'withdraw', 'transfer'])
    - `amount` (Float)
    - `recipient_id` (FK, Integer, nullable)
    - `description` (String)
    - `created_at` (Timestamp)
    - `updated_at` (Timestamp)

#### Relationships

- A User can have multiple Transactions (One-to-Many).
- A Transaction is associated with one User as the initiator (Many-to-One).
- For transfer transactions, there is a recipient User (Many-to-One).

## Testing

### Running Tests

To run tests, use:

```bash
npm test
```

### Test Coverage

The project includes unit tests for both positive and negative scenarios, covering key functionalities such as user registration, authentication, transactions, and admin actions. The tests are designed to ensure code reliability and robustness.

### Example Test Cases

#### Positive Scenario: User Registration

- Ensure a new user can register with valid data.
- Verify the response contains a success message and user details.

#### Negative Scenario: User Registration

- Attempt registration with missing fields and expect validation errors.
- Attempt registration with an already registered email and expect a conflict error.
