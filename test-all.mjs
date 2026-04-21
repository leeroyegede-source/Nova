import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testAll() {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return console.log("Missing CLAUDE_API_KEY");
  console.log("Starting Mass Model Availability Diagnostic on key:", apiKey.substring(0, 15) + "...");

  const anthropic = new Anthropic({ apiKey });

  const models = [
    "claude-3-7-sonnet-20250219",
    "claude-3-5-sonnet-latest",
    "claude-3-haiku-20240307",
    "claude-opus-4-7",
    "claude-sonnet-4-6",
    "claude-haiku-4-5",
    "claude-haiku-4-5-20251001",
    "claude-3-5-haiku-20241022"
  ];

  for (const modelString of models) {
    try {
      console.log(`Pinging Anthropic Server for Model: [${modelString}]...`);
      await anthropic.messages.create({
        model: modelString,
        max_tokens: 10,
        messages: [{ role: "user", content: "Test." }]
      });
      console.log(`✅ SUCCESS! Model ${modelString} is unlocked and active!`);
      return; // Stop on first success
    } catch (e) {
      const errString = e.message.substring(0, 80); // truncated for cleaner log
      console.log(`❌ FAILED: ${errString}`);
    }
  }
  
  console.log("\\n--- SCANNED FINISHED ---");
  console.log("All requested models returned 404 or Invalid Data. The API Key workspace is entirely disabled by Anthropic Cloud.");
}
testAll();
