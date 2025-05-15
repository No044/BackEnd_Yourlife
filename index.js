const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")

const database = require("./config/database")
const routerV1 = require("./API/V1/routers/Main_Y.Router")
const cookieParser = require("cookie-parser");

dotenv.config()
database.connect()

const app = express()
const port = process.env.port


app.use(express.json());
const allowedOrigins = ["http://localhost:3000"]; 
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true 
}));
app.use(cookieParser());
routerV1(app)

app.listen(port,() => {
    console.log("ok ok")
})