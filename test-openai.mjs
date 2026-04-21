import OpenAI from 'openai';

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY || "your-openai-api-key";
  console.log("Testing with OpenAI Key:", apiKey.substring(0, 15) + "...");

  const openai = new OpenAI({ apiKey });

  try {
    const msg = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello! 1 word only." }],
      max_tokens: 10
    });
    console.log("SUCCESS! Response:", msg.choices[0].message.content);
  } catch (error) {
    console.error("FAILED OpenAI GPT-4o-mini:", error.message);
  }
}

testOpenAI();
