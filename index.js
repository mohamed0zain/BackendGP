// ==================== INITIALIZE EXPRESS APP ====================

const express = require("express");
const app = express();

// ====================  GLOBAL MIDDLEWARE ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));
const cors = require("cors");
app.use(cors());

// ====================  Required Module ====================

const auth = require("./routes/authentication");
const project = require("./routes/project");
const vote = require("./routes/vote");
const professor = require("./routes/professor");
const student = require("./routes/student");
const comment = require("./routes/comment");
const bookmark = require("./routes/bookmark");
const admin = require("./routes/admin");
const search = require("./routes/search");
const download = require("./routes/download");
const count = require("./routes/count");
const notification = require("./routes/notification");
// ====================  RUN THE APP  ====================

app.listen(4000, "localhost", () => {
  console.log("SERVER IS RUNNING");
});

// ====================  API ROUTES [ ENDPOINTS ]  ====================
app.use("/auth", auth);
app.use("/project", project);
app.use("/vote", vote);
app.use("/professor", professor);
app.use("/student", student);
app.use("/bookmark", bookmark);
app.use("/comment", comment);
app.use("/admin", admin);
app.use("/search",search);
app.use("/download",download);
app.use("/count",count);
app.use("/notification", notification);
