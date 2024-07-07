require("dotenv").config();
const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const {sendMessage} = require("./src/sendMessage");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());

app.post("/send-message", sendMessage({nodemailer}));
//app.post("/send-message", (req, res)=>{console.log("sadf")});

server.listen(3001);
