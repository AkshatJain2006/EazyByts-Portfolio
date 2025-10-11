require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateProject, validateAuth } = require("./middleware/validation");
const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

if (!JWT_SECRET || !MONGODB_URI) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);


async function main() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("Yokai0090");
    const projectsCollection = db.collection("projects");
    const usersCollection = db.collection("users");
    const skillsCollection = db.collection("skills");
    const experienceCollection = db.collection("experience");
    const educationCollection = db.collection("education");
    const certificatesCollection = db.collection("certificates");
    const contactInfoCollection = db.collection("contactInfo");
    const homePageCollection = db.collection("homePage");


    app.post("/api/auth/register", async (req, res) => {
      try {
        const { username, password } = req.body;
        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
      
        await usersCollection.insertOne({ username, password: hashedPassword });

        res.json({ message: "Admin registered successfully" });
      } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
      }
    });


    app.post("/api/auth/login", async (req, res) => {
      try {
        const { username, password } = req.body;
        
        const user = await usersCollection.findOne({ username });

        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
          return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
          expiresIn: "2h",
        });

        res.json({ message: "Login successful", token });
      } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
      }
    });


    function verifyToken(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        return res.status(401).json({ error: "Access denied. No token." });

      const token = authHeader.split(" ")[1];
      try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
      } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
      }
    }


    app.get("/api/projects", async (req, res) => {
      try {
        const projects = await projectsCollection.find({}).toArray();
        res.json(projects);
      } catch (error) {
        console.error("Fetch error:", error);
        res.status(500).json({ error: "Failed to fetch projects" });
      }
    });


    app.post("/api/projects", verifyToken, async (req, res) => {
      try {
        const newProject = {
          ...req.body,
          userId: new ObjectId(req.user.id),
          createdAt: new Date(),
        };

        const result = await projectsCollection.insertOne(newProject);
        res.status(201).json({
          message: "Project created successfully",
          id: result.insertedId,
        });
      } catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({ error: "Failed to create project" });
      }
    });


    app.put("/api/projects/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;

        const result = await projectsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );

        if (result.matchedCount === 0)
          return res.status(404).json({ error: "Project not found" });

        res.json({ message: "Project updated successfully" });
      } catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({ error: "Failed to update project" });
      }
    });


    app.delete("/api/projects/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await projectsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0)
          return res.status(404).json({ error: "Project not found" });

        res.json({ message: "Project deleted successfully" });
      } catch (error) {
        console.error("Delete project error:", error);
        res.status(500).json({ error: "Failed to delete project" });
      }
    });


    app.get("/api/skills", async (req, res) => {
      try {
        const skills = await skillsCollection.find({}).toArray();
        res.json(skills);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch skills" });
      }
    });

    app.post("/api/skills", verifyToken, async (req, res) => {
      try {
        const result = await skillsCollection.insertOne(req.body);
        res.json({ message: "Skill added successfully", id: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to add skill" });
      }
    });

    app.put("/api/skills/:id", verifyToken, async (req, res) => {
      try {
        const result = await skillsCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Skill not found" });
        }
        res.json({ message: "Skill updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update skill" });
      }
    });

    app.delete("/api/skills/:id", verifyToken, async (req, res) => {
      try {
        const result = await skillsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Skill not found" });
        }
        res.json({ message: "Skill deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete skill" });
      }
    });


    app.get("/api/experience", async (req, res) => {
      try {
        const experience = await experienceCollection.find({}).toArray();
        res.json(experience);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch experience" });
      }
    });

    app.post("/api/experience", verifyToken, async (req, res) => {
      try {
        const result = await experienceCollection.insertOne(req.body);
        res.json({ message: "Experience added successfully", id: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to add experience" });
      }
    });

    app.put("/api/experience/:id", verifyToken, async (req, res) => {
      try {
        const result = await experienceCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Experience not found" });
        }
        res.json({ message: "Experience updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update experience" });
      }
    });

    app.delete("/api/experience/:id", verifyToken, async (req, res) => {
      try {
        const result = await experienceCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Experience not found" });
        }
        res.json({ message: "Experience deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete experience" });
      }
    });


    app.get("/api/education", async (req, res) => {
      try {
        const education = await educationCollection.find({}).toArray();
        res.json(education);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch education" });
      }
    });

    app.post("/api/education", verifyToken, async (req, res) => {
      try {
        const result = await educationCollection.insertOne(req.body);
        res.json({ message: "Education added successfully", id: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to add education" });
      }
    });

    app.put("/api/education/:id", verifyToken, async (req, res) => {
      try {
        const result = await educationCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Education not found" });
        }
        res.json({ message: "Education updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update education" });
      }
    });

    app.delete("/api/education/:id", verifyToken, async (req, res) => {
      try {
        const result = await educationCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Education not found" });
        }
        res.json({ message: "Education deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete education" });
      }
    });


    app.get("/api/certificates", async (req, res) => {
      try {
        const certificates = await certificatesCollection.find({}).toArray();
        res.json(certificates);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch certificates" });
      }
    });

    app.post("/api/certificates", verifyToken, async (req, res) => {
      try {
        const result = await certificatesCollection.insertOne({
          ...req.body,
          createdAt: new Date()
        });
        res.json({ message: "Certificate added successfully", id: result.insertedId });
      } catch (error) {
        res.status(500).json({ error: "Failed to add certificate" });
      }
    });

    app.put("/api/certificates/:id", verifyToken, async (req, res) => {
      try {
        const result = await certificatesCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Certificate not found" });
        }
        res.json({ message: "Certificate updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update certificate" });
      }
    });

    app.delete("/api/certificates/:id", verifyToken, async (req, res) => {
      try {
        const result = await certificatesCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Certificate not found" });
        }
        res.json({ message: "Certificate deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to delete certificate" });
      }
    });


    app.post("/api/contact", async (req, res) => {
      try {
        const { name, email, message } = req.body;
        
        // Input validation
        if (!name || !email || !message) {
          return res.status(400).json({ error: "All fields are required" });
        }
        
        if (name.length > 100 || email.length > 100 || message.length > 1000) {
          return res.status(400).json({ error: "Input too long" });
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: "Invalid email format" });
        }
        
        const contactData = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
          createdAt: new Date()
        };
        
        await db.collection("contacts").insertOne(contactData);
        res.json({ message: "Message sent successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
      }
    });


    app.get("/api/contacts", verifyToken, async (req, res) => {
      try {
        const contacts = await db.collection("contacts").find({}).sort({ createdAt: -1 }).toArray();
        res.json(contacts);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch contacts" });
      }
    });


    app.get("/api/contact-info", async (req, res) => {
      try {
        const contactInfo = await contactInfoCollection.findOne({});
        res.json(contactInfo || {});
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch contact info" });
      }
    });


    app.put("/api/contact-info", verifyToken, async (req, res) => {
      try {
        const result = await contactInfoCollection.replaceOne(
          {},
          { ...req.body, updatedAt: new Date() },
          { upsert: true }
        );
        res.json({ message: "Contact info updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update contact info" });
      }
    });


    app.get("/api/homepage", async (req, res) => {
      try {
        const homePage = await homePageCollection.findOne({});
        res.json(homePage || {});
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch home page data" });
      }
    });


    app.put("/api/homepage", verifyToken, async (req, res) => {
      try {
        const result = await homePageCollection.replaceOne(
          {},
          { ...req.body, updatedAt: new Date() },
          { upsert: true }
        );
        res.json({ message: "Home page updated successfully" });
      } catch (error) {
        res.status(500).json({ error: "Failed to update home page" });
      }
    });


    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../frontend/build')));
      
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () =>
      console.log(`Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

main();
