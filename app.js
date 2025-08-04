const dotenv = require('dotenv')
dotenv.config();


const express = require('express');
const app = express();
const port = 3000;

require('./models/connection')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// liste des routes
const indexRouter = require('./route/index');



// redir des routes
app.use('/', indexRouter);




app.listen(port, () => {
    console.log(`KATAAA lancé sur http://localhost:${port}`);
});

