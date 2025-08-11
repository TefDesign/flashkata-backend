const dotenv = require('dotenv')
dotenv.config();


const express = require('express');
var path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");

require('./models/connection')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// liste des routes
const indexRouter = require('./route/index');
const usersRouter = require('./route/users');
const progressRouter = require('./route/progress');
const afficherExosRouter = require('./route/getCards')



// redir des routes
app.use('/', indexRouter);
app.use("/users", usersRouter);
app.use('/progress', progressRouter);
app.use('/cards', afficherExosRouter)




app.listen(port, () => {
    console.log(`serveur lancé sur http://localhost:${port}`);
});



module.exports = app;