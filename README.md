# SpendWise – Personal Finance Management App

SpendWise is a full-stack personal finance management application designed to help users track their income and expenses, monitor their spending, and understand their remaining balance in one place.

The project is being developed with a focus on secure authentication, user-specific financial records, and a simple, easy-to-use dashboard.

## ✨ Features

- **User Authentication:** Register and log in securely.
- **Income Management:** Record and manage income transactions.
- **Expense Tracking:** Add and manage daily expenses.
- **Financial Dashboard:** View total income, total expenses, and remaining balance.
- **Transaction History:** Keep track of recorded financial transactions.
- **Protected Routes:** JWT-based authentication for secure API access.
- **User-Specific Data:** Keep each user's transactions associated with their account.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs for password hashing

### Database
- PostgreSQL
- Prisma ORM

## 📁 Project Structure

```text
SpendWise/
│
├── config/
├── controller/
├── middleware/
├── models/
├── routes/
├── prisma/
│
├── frontend/
│   ├── public/
│   └── src/
│
├── server.js
├── prisma.config.ts
├── package.json
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

Follow these steps to run SpendWise locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Moshmiraj/spendwise.git
```

### 2. Navigate to the Project

```bash
cd spendwise
```

### 3. Install Backend Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root and configure the environment variables required by the backend and Prisma.

For example, configure your PostgreSQL database connection and JWT secret.

**Important:** Never upload your `.env` file or expose your database credentials or secret keys on GitHub.

### 5. Set Up the Database

After configuring your PostgreSQL connection, run:

```bash
npx prisma migrate dev
```

### 6. Start the Backend Server

```bash
node server.js
```

The backend runs at:

`http://localhost:5000`

### 7. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

## 🔐 Security

SpendWise uses:
- JWT-based authentication.
- Password hashing with bcryptjs.
- Protected backend routes.
- User-specific transaction access.

## 🚧 Project Status

**Currently under development.**

The core backend APIs, authentication flow, database integration, and frontend dashboard are being developed and tested. Further improvements to functionality, UI, testing, and deployment are planned.

## 🎯 Future Improvements

- Data visualization and spending charts.
- Monthly and yearly expense reports.
- Budget planning and expense limits.
- Improved dashboard and user experience.
- Comprehensive testing.
- Cloud deployment for public access.

## 👩‍💻 Author

**Moshmi Raj**

- GitHub: [Moshmiraj](https://github.com/Moshmiraj)


---

If you find this project interesting, feel free to explore the repository!
