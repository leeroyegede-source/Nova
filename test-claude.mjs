import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.log("NO CLAUDE_API_KEY in .env.local!");
    return;
  }
  console.log("Testing with API Key:", apiKey.substring(0, 15) + "...");

  const anthropic = new Anthropic({ apiKey });

  try {
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 10,
      messages: [{ role: "user", content: "Say hello!" }]
    });
    console.log("SUCCESS! Response:", msg.content[0].text);
  } catch (error) {
    console.error("FAILED claude-3-haiku-20240307:", error.message);
  }
}

test();
