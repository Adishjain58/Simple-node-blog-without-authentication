const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const expressSanitizer = require("express-sanitizer");

const app = express();
// Body parser middleware.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

const db = require("./config/keys").mongoURI;

// To connect to database.
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Mongoose model config
const blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now()
  }
});
const Blog = mongoose.model("Blog", blogSchema);

// Restful Routes

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

// INDEX Route
app.get("/blogs", (req, res) => {
  Blog.find({})
    .then(blogs => res.render("index", { blogs }))
    .catch(err => console.log(err));
});

// NEW Route
app.get("/blogs/new", (req, res) => {
  res.render("new");
});

// CREATE Route
app.post("/blogs", (req, res) => {
  // Create blog and redirect
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog)
    .then(blog => {
      res.redirect("/blogs");
      console.log(blog);
    })
    .catch(err => console.log(err));
});

// SHOW Route
app.get("/blogs/:id", (req, res) => {
  Blog.findById(req.params.id)
    .then(blog => res.render("show", { blog }))
    .catch(err => console.log(err));
});

// EDIT Route
app.get("/blogs/:id/edit", (req, res) => {
  Blog.findById(req.params.id)
    .then(blog => res.render("edit", { blog }))
    .catch(err => console.log(err));
});

// UPDATE Route
app.put("/blogs/:id", (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog)
    .then(blog => {
      console.log(blog);
      res.redirect("/blogs/" + req.params.id);
    })
    .catch(err => console.log(err));
});

// DESTROY Route
app.delete("/blogs/:id", (req, res) => {
  Blog.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect("/blogs");
      console.log("Blog deleted successfully");
    })
    .catch(err => console.log(err));
});

const port = process.env.PORT || 3001;

app.listen(port, () => console.log("App is started"));
