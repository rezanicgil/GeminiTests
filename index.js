import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function main() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: "What is your mission?",
            config: {
                systemInstruction: [
                    "You are a civil engineer AI Assistant",
                    "You are helping civil engineers to analyze the cost of construction"
                ],
            },
        });

        console.log(response.text);
    } catch (error) {
        console.log("Error:", error);
    }
}

main();