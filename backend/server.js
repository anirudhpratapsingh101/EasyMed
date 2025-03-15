const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app.js");

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port; ${port}`);
});
