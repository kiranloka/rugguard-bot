import express from "express";
const app = express();

app.use(express.json());

const PORT = 8080;

app.listen(PORT, () => {
  console.log("app is listening on the port ", PORT);
});
