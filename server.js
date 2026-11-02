
require("dotenv").config();

const cors = require("cors");

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("./config/prisma");
const transactionSchema = require("./config/transactionValidation");
const registerSchema = require("./config/registerValidation");
const loginSchema = require("./config/loginValidation");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());



app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to SpendWise API!");
});

// Get only the logged-in user's transactions

app.get("/api/transactions", authMiddleware, async (req, res) => {
  try {
    const { type, category } = req.query;

    const where = {
      userId: req.userId,
    };

    if (type) {
      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Type must be income or expense",
        });
      }

      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);

    return res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
});



// Create a transaction for the logged-in user
app.post("/api/transactions", authMiddleware, async (req, res) => {
  const result = transactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid transaction data",
      errors: result.error.issues.map((issue) => issue.message),
    });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...result.data,
        userId: req.userId,
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create transaction",
    });
  }
});

app.put("/api/transactions/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid transaction ID",
    });
  }

  const result = transactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: result.error.issues[0].message,
    });
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: req.userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: result.data,
    });

    return res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Update transaction error:", error);

    return res.status(500).json({
      message: "Failed to update transaction",
    });
  }
});

app.delete("/api/transactions/:id", authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid transaction ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: req.userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    await prisma.transaction.delete({
      where: { id: id },
    });

    return res.status(200).json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete transaction error:", error);

    return res.status(500).json({
      message: "Failed to delete transaction",
    });
  }
});


app.get("/api/transactions/summary", authMiddleware, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
      },
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    return res.status(200).json({
      totalIncome,
      totalExpenses,
      balance,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard summary",
    });
  }
});



// Register a new user
app.post("/api/auth/register", async (req, res) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid registration data",
      errors: result.error.issues.map((issue) => issue.message),
    });
  }

  try {
    const { name, email, password } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to register user",
    });
  }
});

// Log in and issue a JWT
app.post("/api/auth/login", async (req, res) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Invalid login data",
      errors: result.error.issues.map((issue) => issue.message),
    });
  }

  try {
    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to log in",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`SpendWise server running on port ${PORT}`);
});
