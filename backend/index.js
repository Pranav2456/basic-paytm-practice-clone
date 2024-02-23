const express = require("express");
const rootRouter = require("./routes/index");
const cors = require("cors");

app.use(express.json());
app.use(cors());


const app = express();



app.use("/api/v1",rootRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})


