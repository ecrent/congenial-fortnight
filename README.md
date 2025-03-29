# Meeting Time Finder

Meeting Time Finder is a web application that helps teams find the perfect meeting times by coordinating everyone's schedules and availability.


## Features

- **User Authentication**: Register, login, and manage user accounts
- **Session Management**: Create and join scheduling sessions with unique codes
- **Availability Input**: Add your available time slots for meetings
- **Optimal Time Finding**: Automatically find the best meeting times that work for everyone
- **Admin Dashboard**: Manage users, sessions, and schedules through an admin interface

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Bootstrap for responsive UI
- Context API for state management
- Cypress for end-to-end testing

### Backend
- Node.js with Express
- PostgreSQL database
- JSON Web Tokens (JWT) for authentication
- RESTful API design

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (v12 or later)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/congenial-fortnight.git
   cd congenial-fortnight
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

## Environment Configuration

### Server Configuration

Change the name of the `.env.development` files name to `.env` both in the server and the client folders

### Create a Postgresql database

Initialize db_init.sql in ./server/db to create the necessary tables

### Running the Application

Start the server:
cd server
npm start

In a separate terminal, start the client:
cd client
npm start

Access the application:

Frontend: http://localhost:3001
API: http://localhost:3000

### Tests

cd server
npm test

cd client         
npm run cypress:run

### Acknowledgments

Font Awesome for icons
Bootstrap for UI components

## License

This project is licensed under the MIT License - a permissive open source license that allows for maximum flexibility:

- **Freedom to use**: Anyone can use the software for any purpose, including commercial applications
- **Freedom to modify**: Users can modify the source code as needed
- **Freedom to distribute**: Anyone can distribute the original or modified versions
- **Freedom to sell**: The software can be sold commercially

The only requirement is that the original copyright notice and the license text must be included in all copies or substantial portions of the software.

### MIT License Text

Copyright (c) 2025 Meeting Time Finder

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

