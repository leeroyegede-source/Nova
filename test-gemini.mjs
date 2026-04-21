import { GoogleGenerativeAI } from '@google/generative-ai';

async function testSDK() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || "your-gemini-api-key";
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log("Testing with Gemini SDK...");
    const base64Data = Buffer.from("Invoice: Total is $120.00. Please pay soon.").toString("base64");
    const mimeType = "text/plain"; 

    const prompt = "You are a specialized OCR engine. Extract all raw text data exactly as it appears in this document.";
    
    // Gemini handles text inline_data strangely sometimes, let's use a standard prompt first
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);
    
    console.log("\\n--- API Success ---");
    console.log("Response:", result.response.text());
  } catch(error) {
    console.error("SDK Test Error:", error);
  }
}
testSDK();
