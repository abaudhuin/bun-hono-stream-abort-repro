import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

const app = new Hono({});

app.get("t", async (c) => {
  const controller = new AbortController();
  // Dummy stream from example doc
  const r = await fetch("http://localhost:3001/t", {
    signal: controller.signal,
  });
  return streamSSE(c, async (stream) => {
    stream.onAbort(() => {
      console.log("Aborted");
      controller.abort();
    });
    return new Promise((resolve, reject) => {
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      const read = async () => {
        try {
          const { done, value } = await reader.read(); // THIS LINE HERE
          if (done) {
            stream.close();
            resolve();
            return;
          }
          stream.writeSSE({
            data: decoder.decode(value),
            event: "time-update",
          });
          read();
        } catch (e) {
          if (e.name === "AbortError") {
            console.log("Aborted err");
            resolve();
            return;
          }
          console.error(e);
          reject(e);
        }
      };
      read();
    });
  });
});

export default app;
