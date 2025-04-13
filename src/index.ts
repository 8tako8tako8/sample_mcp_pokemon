import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

const server = new McpServer({
  name: "pokemon",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

server.tool(
  "getPokemonList",
  "Get a list of all Pokemon.",
  {
    limit: z
      .number()
      .min(1)
      .max(10)
      .default(10)
      .describe("Number of Pokemon to return"),
    offset: z
      .number()
      .min(0)
      .default(0)
      .describe("Starting index for pagination"),
  },
  async ({ limit, offset }) => {
    try {
      const response = await fetch(
        `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Pokemon list: ${response.status}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `エラーが発生しました: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "getPokemonCharacteristic",
  "Get a Pokemon characteristic by id.",
  {
    id: z.number().describe("Id of the Pokemon"),
  },
  async ({ id }) => {
    try {
      const response = await fetch(`${POKEAPI_BASE_URL}/characteristic/${id}`);
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `エラーが発生しました: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pokemon MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
