import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { generateImage } from "./fireflyClient.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stdin = process.stdin;
const stdout = process.stdout;

stdin.setEncoding("utf8");

function send(message) {
  stdout.write(JSON.stringify(message) + "\n");
}

function describeTools() {
  return {
    tools: [
      {
        name: "generateFireflyImage",
        description:
          "Generate an image using Adobe Firefly and save it to disk",
        input_schema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            width: { type: "number" },
            height: { type: "number" },
            outputPath: { type: "string" }
          },
          required: ["prompt", "outputPath"]
        }
      }
    ]
  };
}

async function handleToolCall(id, name, args) {
  try {
    if (name === "generateFireflyImage") {
      const { prompt, width, height, outputPath } = args;

      const imgBuffer = await generateImage({ prompt, width, height });

      const finalPath = outputPath.includes("{id}")
        ? outputPath.replace("{id}", uuidv4())
        : outputPath;

      const absPath = path.isAbsolute(finalPath)
        ? finalPath
        : path.join(process.cwd(), finalPath);

      await fs.promises.mkdir(path.dirname(absPath), { recursive: true });
      await fs.promises.writeFile(absPath, imgBuffer);

      send({
        id,
        type: "tool_result",
        result: {
          success: true,
          path: absPath
        }
      });
    } else {
      send({
        id,
        type: "tool_error",
        error: `Unknown tool: ${name}`
      });
    }
  } catch (err) {
    send({
      id,
      type: "tool_error",
      error: err.message || String(err)
    });
  }
}

stdin.on("data", async (chunk) => {
  const lines = chunk.split("\n").filter(Boolean);
  for (const line of lines) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }

    if (msg.type === "get_tools") {
      send({
        id: msg.id,
        type: "tools",
        ...describeTools()
      });
    } else if (msg.type === "call_tool") {
      const { id, name, args } = msg;
      handleToolCall(id, name, args || {});
    }
  }
});

send({ type: "ready" });
