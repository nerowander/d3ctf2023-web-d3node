const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const stringRandom = require("string-random");
const path = require("path");

// register router
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const dashboardIndexRouter = require("./routes/dashboardIndex");

const app = express();
const PORT = 8080;

app.engine('html', require('hbs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

app.use(session({
    secret: stringRandom(32),
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// set router
app.use("/",indexRouter);
app.use("/user",userRouter);
app.use("/dashboardIndex",dashboardIndexRouter);

app.listen(8080,() =>
{
    console.log(`App listening on ${PORT}`);
});