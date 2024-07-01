# Library Management API

Welcome to the Library Management API documentation. This API provides endpoints for managing users, books, and borrowing transactions in a library system. The API base path is `/api/v1`.

## Authentication Endpoints

### Register a User

Registers a new user with a specified role.

**URL:** `POST /api/v1/auth/register/:role`

**Parameters:**

- `role` (path parameter): The role of the user (e.g., `LIBRARIAN`, `MEMBER`).

**Request Body:**

```javascript
{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

**Response:**

- 201 Created: User successfully registered.
  ```javascript
  {
    "message": "User registered successfully",
    "user": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "LIBRARIAN"
    }
  }
  ```
- 400 Bad Request: Invalid request parameters.
  ```javascript
  {
    "error": "Invalid request body",
    "details": "Username is required"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch('https://example.com/api/v1/auth/register/LIBRARIAN', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password123',
    email: 'john@example.com',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

### Login

Logs in a user.

**URL:** `POST /api/v1/auth/login`

**Request Body:**

```javascript
{
  "email": "string",
  "password": "string"
}
```

**Response:**

- 200 OK: Login successful.
  ```javascript
  {
    "message": "Login successful",
    "user": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "LIBRARIAN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }
  ```
- 401 Unauthorized: Invalid credentials.
  ```javascript
  {
    "message": "Invalid credentials"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch('https://example.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

## Book Endpoints

### Create a Book

Creates a new book record.

**URL:** `POST /api/v1/books/create`

**Request Body:**

```javascript
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "is_available": true,
  "year": 2023
}
```

**Response:**

- 201 Created: Book successfully created.
  ```javascript
  {
    "message": "Book created successfully",
    "book": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "1234567890123",
      "is_available": true,
      "year": 1925
    }
  }
  ```
- 422 Unprocessable Entity: Invalid request body.
  ```javascript
  {
    "error": "Invalid request body",
    "details": "ISBN must be 13 digits"
  }
  ```
- 409 Conflict: Book with the same ISBN already exists.
  ```javascript
  {
    "error": "Conflict",
    "message": "Book with ISBN 1234567890123 already exists"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch('https://example.com/api/v1/books/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '1234567890123',
    is_available: true,
    year: 1925,
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

### Update a Book

Updates an existing book record.

**URL:** `PUT /api/v1/books/update/:id`

**Parameters:**

- `id` (path parameter): The ID of the book to be updated.

**Request Body:**

```javascript
{
  "title": "string",
  "author": "string",
  "isbn": "string",
  "is_available": true,
  "year": 2023
}
```

**Response:**

- 200 OK: Book successfully updated.
  ```javascript
  {
    "message": "Book updated successfully",
    "book": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "1234567890123",
      "is_available": true,
      "year": 1925
    }
  }
  ```
- 422 Unprocessable Entity: Invalid request body.
  ```javascript
  {
    "error": "Invalid request body",
    "details": "Year must be a number"
  }
  ```
- 404 Not Found: Book not found.
  ```javascript
  {
    "error": "Not Found",
    "message": "Book with ID a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6 not found"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch(
  'https://example.com/api/v1/books/update/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '1234567890123',
      is_available: true,
      year: 1925,
    }),
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

### Delete a Book

Deletes an existing book record.

**URL:** `DELETE /api/v1/books/delete/:id`

**Parameters:**

- `id` (path parameter): The ID of the book to be deleted.

**Response:**

- 200 OK: Book successfully deleted.
  ```javascript
  {
    "message": "Book deleted successfully"
  }
  ```
- 404 Not Found: Book not found.
  ```javascript
  {
    "error": "Not Found",
    "message": "Book with ID a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6 not found"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch(
  'https://example.com/api/v1/books/delete/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  {
    method: 'DELETE',
  }
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

### Get a Book

Fetches details of a specific book.

**URL:** `GET /api/v1/books/get/:id`

**Parameters:**

- `id` (path parameter): The ID of the book.

**Response:**

- 200 OK: Book details retrieved successfully.
  ```javascript
  {
    "book": {
      "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "1234567890123",
      "is_available": true,
      "year": 1925
    }
  }
  ```
- 404 Not Found: Book not found.
  ```javascript
  {
    "error": "Not Found",
    "message": "Book with ID a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6 not found"
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch(
  'https://example.com/api/v1/books/get/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```

### List All Books

Fetches a list of all books.

**URL:** `GET /api/v1/books/list`

**Response:**

- 200 OK: List of books retrieved successfully.
  ```javascript
  {
    "books": [
      {
        "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "1234567890123",
        "is_available": true,
        "year": 1925
      },
      {
        "id": "b1c2d3e4-f5g6-h7i8-j9k0-l1m2n3o4p5q6",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "isbn": "9876543210987",
        "is_available": false,
        "year": 1960
      }
    ]
  }
  ```
- 500 Internal Server Error: Server encountered an unexpected condition.
  ```javascript
  {
    "message": "Internal Server Error"
  }
  ```

**Example:**

```javascript
fetch('https://example.com/api/v1/books/list')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error));
```
