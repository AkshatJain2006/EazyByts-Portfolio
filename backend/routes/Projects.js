const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// This function will receive the database connection from server.js
module.exports = (projectsCollection) => {
  
  // 🟢 Get all projects
  router.get("/", async (req, res) => {
    try {
      const projects = await projectsCollection.find({}).toArray();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // 🟢 Get one project by ID
  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const project = await projectsCollection.findOne({ _id: new ObjectId(id) });
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // 🟢 Add new project
  router.post("/", async (req, res) => {
    try {
      const newProject = req.body;
      const result = await projectsCollection.insertOne(newProject);
      res.status(201).json({ message: "Project added", id: result.insertedId });
    } catch (error) {
      console.error("Error adding project:", error);
      res.status(500).json({ error: "Failed to add project" });
    }
  });

  // 🟢 Update project
  router.put("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await projectsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      if (result.matchedCount === 0)
        return res.status(404).json({ error: "Project not found" });
      res.json({ message: "Project updated" });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // 🟢 Delete project
  router.delete("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const result = await projectsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Project not found" });
      res.json({ message: "Project deleted" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  return router;
};
