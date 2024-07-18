import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { OpenAI } from "openai";

const app = new Hono({});
const openai = new OpenAI();

app.get("t", async (c) => {
  const thread = await openai.beta.threads.create();
  const assistantStream = openai.beta.threads.runs.stream(thread.id, {
    assistant_id: Bun.env["ASSISTANT_ID"],
    additional_messages: [
      {
        role: "user",
        content: "Count from 1 to 100 in whole letters",
      },
    ],
  });
  return streamSSE(c, async (stream) => {
    stream.onAbort(() => {
      assistantStream.controller.abort();
    });
    try {
      await new Promise((resolve, reject) => {
        try {
          assistantStream
            .on("event", (event) => {
              stream.writeSSE({
                event: "event",
                data: JSON.stringify(event),
              });
            })
            .on("abort", () => {
              console.log("aborted");
              resolve();
            })
            .on("end", resolve)
            .on("error", (err) => {
              console.error(err);
              reject(err);
            });
        } catch (e) {
          console.error("inside promise", e);
          reject(e);
        }
      });
    } catch (e) {
      console.error("outside promise", e);
    }
    await stream.close();
  });
});

export default app;
