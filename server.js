require("dotenv").config();
const express = require("express");
const { engine } = require("express-handlebars");
const path = require("path");
const { exec } = require("child_process");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
//Express Consts
const app = express();
const PORT = process.env.PORT || 3000;
const MEDIA_DIR = path.join(__dirname,"/media");
const ADD_DIR = path.join(__dirname,"/views/add");
// Ensure media folder exists
if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR);
    console.log("Creating /media");
}
console.log("/media allready exists");

//Setup SQLite DB
const db = new sqlite3.Database("media.db",(err)=>{
    if (err) {
        console.error("Error Opening DB:",err.message);
    } else {
        console.log("Connected to SQLite DB: ");
        db.run(
            `CREATE TABLE IF NOT EXISTS songs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                artist TEXT NOT NULL,
                album TEXT NOT NULL,
                filename TEXT,
                year TEXT,
                download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        );
    }
});

//Middleware
app.engine("html", engine({ 
    extname: ".html", 
    defaultLayout: false,
    partialsDir: path.join(__dirname, "views/partials") 
}));

app.set("view engine", "html");
app.set("views", path.join(__dirname, "views"));
//Json
app.use(express.json());

//Static Routes
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/media", express.static(MEDIA_DIR));

//Add Media

app.get("/add", (req, res) => res.render(path.join(ADD_DIR,"/add")));
// Define Routes
app.get("/", (req, res) => res.render("index"));
app.get("/settings", (req, res) => res.render("settings"));
app.get("/media", (req, res) => {
    db.all("SELECT * FROM songs ORDER BY download_date DESC", [], (err, rows) => {
        if (err) {
            console.error("Database Error:", err.message);
            return res.status(500).send("Database error.");
        }
        res.render("media", { songs: rows });
    });
});
// Handle song download request


// Start the Express server and store the instance
const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

// Handle shutdown properly
function shutdown() {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
}

// Handle manual termination (Ctrl+C)
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Allow Electron to trigger shutdown remotely
process.on("message", (msg) => {
    if (msg === "shutdown") {
        shutdown();
    }
});