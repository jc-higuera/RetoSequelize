var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const Joi = require("joi");
const fs = require("fs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.use(express.json());

const Message = require("./models/message");
const { validate } = require("./lib/sequelize");

const validateMessage = (message) => {
  const schema = Joi.object({
    message: Joi.string().min(5).required(),
    author: Joi.string().min(7).required(),
    ts: Joi.number().required(),
  });

  return schema.validate(message);
};


/* const mensajes = [
  {
    message: "New message",
    author: "Juan José Rodríguez",
    ts: 1599868276352,
  },
  {
    message: "Mensaje nuevo",
    author: "Juan Camilo Higuera",
    ts: 1599868276353,
  },
]; */

app.get("/chat/api/messages", (req, res) => {
  Message.findAll().then((result) => {
    res.send(result);
  });
});

app.get("/chat/api/messages/:ts", (req, res) => {
  Message.findAll({
    where: {
      ts: req.params.ts
    }
  }).then((response) => {
    if (response === null)
      return res
        .status(404)
        .send("The message with the given ts was not found.");
    res.send(response);
  });
});

app.post("/chat/api/messages", (req, res) => {
  const { error } = validateMessage(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  Message.create({ message: req.body.message, author: req.body.author, ts: req.body.ts }).then(
    (result) => {
      res.send(result);
    }
  );
});

app.put("/chat/api/messages/:ts", (req, res) => {
  const { error } = validateMessage(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  Message.update(req.body, { where: { ts: req.params.ts } }).then((response) => {
    if (response[0] !== 0) res.send({ message: "Message updated" });
    else res.status(404).send({ message: "Message was not found" });
  });
});

app.delete("/chat/api/messages/:ts", (req, res) => {
  Message.destroy({
    where: {
      ts: req.params.ts,
    },
  }).then((response) => {
    if (response === 1) res.status(204).send();
    else res.status(404).send({ message: "Message was not found" });
  });
});

module.exports = app;
