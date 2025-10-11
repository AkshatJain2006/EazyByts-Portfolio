
const validateProject = (req, res, next) => {
  const { title, description, technologies, githubUrl } = req.body;
  
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ error: "Title must be at least 3 characters" });
  }
  
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: "Description must be at least 10 characters" });
  }
  

  
  if (githubUrl && !isValidUrl(githubUrl)) {
    return res.status(400).json({ error: "Invalid GitHub URL" });
  }
  
  next();
};

const validateAuth = (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }
  
  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters" });
  }
  
  next();
};

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

module.exports = { validateProject, validateAuth };