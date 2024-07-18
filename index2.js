import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

const app = new Hono();
let id = 0;

app.get("/t", async (c) => {
  return streamSSE(c, async (stream) => {
    setTimeout(() => {
      stream.close();
    }, 15000);
    while (!stream.closed && !stream.aborted) {
      const message = `It is ${new Date().toISOString()}`;
      await stream.writeSSE({
        data: message,
        event: "time-update",
        id: String(id++),
      });
      await stream.sleep(1000);
    }
  });
});

export default {
  port: 3001,
  fetch: app.fetch,
};
