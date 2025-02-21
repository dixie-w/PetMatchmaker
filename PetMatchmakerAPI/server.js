const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Test database connection
app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1", (err, results) => {
    if (err) {
      console.error("Database connection failed:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }
    res.json({ message: "Database connection successful" });
  });
});

// User login route (for general site access)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });

      if (result.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = result[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      // Create JWT token
      const token = jwt.sign({ userId: user.id }, "your_jwt_secret", {
        expiresIn: "1h",
      });

      res.json({ token, role: user.role });
    }
  );
});

// Logout route
app.post("/api/logout", (req, res) => {
  // Token-based authentication is stateless
  res.json({ message: "Logged out successfully" });
});

// Profile page
app.get("/api/profile", (req, res) => {
  const userId = req.user.userId;
  db.query("SELECT * FROM users WHERE id = ?", [userId], (err, result) => {
    if (err)
      return res.status(500).json({ message: "Error fetching user profile" });
    res.json(result[0]);
  });
});

// Example of a protected route (Home page or other pages)
app.get("/", (req, res) => {
  res.send("Welcome to the Pet Matchmaker Application!");
});

// Get all users
app.get("/api/users", (req, res) => {
  const query = "SELECT * FROM users";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ message: "Server error" });
    }
    res.json(results);
  });
});

// Get all questions
app.get("/api/questions", (req, res) => {
  const query = "SELECT question FROM questions";
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Server error");
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
