const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");
var path = require("path");
const dotenv = require("dotenv");

dotenv.config();
connectToMongo();

const app = express();
const port = process.env.PORT || 5000;

/*app.get('/', (req, res) => {
  res.send('Hello World!')
})*/

app.use(cors());

app.use(express.json());
//Available Routes
app.use("/api/auth", require("./routes/Auth"));
app.use("/api/notes", require("./routes/Notes"));

//-----------------------------------------------------------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/Frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "Frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("useless");
  });
}


//-----------------------------------------------------------

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
