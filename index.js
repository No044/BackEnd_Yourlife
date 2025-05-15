const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const database = require("./config/database");
const routerV1 = require("./API/V1/routers/Main_Y.Router");
const cookieParser = require("cookie-parser");

dotenv.config();
database.connect();

const app = express();
const port = process.env.PORT;
const frontendUrl = process.env.FRONTEND_URL;
console.log("frontendUrl", frontendUrl);

app.use(express.json());
const allowedOrigins = [frontendUrl];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
app.use(cookieParser());
routerV1(app);

app.listen(port, () => {
  console.log("listening on port ", port);
});
