const express = require("express");
const config = require("./config")
const line = require("@line/bot-sdk");
const middleware = require("@line/bot-sdk").middleware;
const JSONParseError = require("@line/bot-sdk").JSONParseError;
const SignatureValidationFailed = require("@line/bot-sdk").SignatureValidationFailed;

const app = express();

app.use(middleware(config.line));

app.get("/", (_req, res) => res.sendStatus(200));

app.post("/webhook", async (req, res) => {
    res.json(req.body.events[0]); // req.body will be webhook event object
    const client = new line.Client(config.line);
    const message = {
        type: "text",
        text: null
    };
    const event = req.body.events[0];

    const profile = await client.getProfile(event.source.userId)
    console.log(`User: ${profile.displayName}`);

    switch (event.type) {
        case "postback":
            console.log(`Action: Pressed <${event.postback.data}> button`);
            switch (event.postback.data) {
                case "Homework":
                    message.text = "https://bit.ly/2xWifBc";
                    break;
                default:
                    message.text = "Service unavailable";
            }

            await client.replyMessage(req.body.events[0].replyToken, message)
            break;
        case "message":
            console.log(`Action: Sent message "${event.message.text}"`);
            message.text =
                "Thank you for your feedback. We'll contact you back if necessary";

            await client.replyMessage(req.body.events[0].replyToken, message)
            break;
    }
});

app.use((err, req, res, next) => {
    if (err instanceof SignatureValidationFailed) {
        res.status(401).send(err.signature);
        return;
    } else if (err instanceof JSONParseError) {
        res.status(400).send(err.raw);
        return;
    }
    next(err); // will throw default 500
});

app.listen(config.port);