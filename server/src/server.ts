import express from "express";
import { addOne } from "@rv-app/utils";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send(`Hello, World! ${addOne(3)}`);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
