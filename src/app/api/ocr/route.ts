import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No document file provided.' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not configured.");
      return NextResponse.json({ 
        success: true, 
        extractedText: "MOCK_OCR_DATA: Company Invoice #0482. Total Amount: $3,240.00. Please add GEMINI_API_KEY to activate true vision processing."
      }, { status: 200 });
    }

    // Convert file to base64 for Vision API ingestion
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const mimeType = file.type;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the latest vision-capable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "You are a highly advanced OCR engine specialized in extracting financial documents and standard text representations. Extract all raw text data exactly as it appears in this document.";

    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);
      const extractedText = result.response.text();
      return NextResponse.json({ success: true, extractedText }, { status: 200 });

    } catch (apiError: any) {
      console.error("Gemini API Sub-Error:", apiError);
      return NextResponse.json(
        { error: 'Gemini API Error. Verify your API Key and billing quotas.', details: apiError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('OCR Extraction Pipeline Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during Gemini Document Parsing', details: error.message },
      { status: 500 }
    );
  }
}
