import express from "express";
import { dbConnection } from "./dataBase/dbConnection.js";
import { routes } from "./src/modules/index.routes.js";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("Hello World!"));

routes(app);
dbConnection();

app.listen(process.env.PORT || port, () =>
  console.log(`Server is running on port ${port}!`)
);

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection", err);
});
