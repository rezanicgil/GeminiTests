import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { parse } from "json2csv";
import xlsx from "xlsx";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

async function main() {
    try {

        // Convert Excel files to CSV
        convertExcelToCsv(path.join(__dirname, "data"), path.join(__dirname, "data/output.csv"));

        const csvFilePath = path.join(__dirname, "data/output.csv");
        const csvData = fs.readFileSync(csvFilePath, "utf8");
        const text = Buffer.from(csvData).toString("base64");

        const contents = [
            { text: "you should calculate spi from that document, the spi formula is that earned manhour/planned manhours. the document has 2 spread sheets. the first one is planned and the second one is earned. you are gonna find every activities under the activities column and also you are gonna find the dates on the first row. go to the document and sum all activites manhours from the cells for both of the pages then divide second page manhours to first page manhours." },
            {
                inlineData: {
                    mimeType: 'text/plain',
                    data: text
                }
            }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config: {
                systemInstruction: [
                    "You are a civil engineer AI Assistant",
                    "You are helping civil engineers to analyze the cost of construction"
                ],
            },
        });

        console.log("Response:", response.text);

    } catch (error) {
        console.log("Error:", error);
    }
}

main();


function convertExcelToCsv(inputFolder, outputCsvFile) {
    fs.readdir(inputFolder, (err, files) => {
        if (err) {
            console.error("Error reading data folder:", err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(inputFolder, file);

            if (path.extname(file) === ".xlsx") {
                try {
                    const workbook = xlsx.readFile(filePath);
                    const sheetName = workbook.SheetNames[0];
                    const sheet = workbook.Sheets[sheetName];
                    const csv = xlsx.utils.sheet_to_csv(sheet);

                    fs.writeFile(outputCsvFile, csv, (err) => {
                        if (err) {
                            console.error("Error writing CSV file:", err);
                        } else {
                            console.log(`CSV file created at ${outputCsvFile}`);
                        }
                    });
                } catch (error) {
                    console.error(`Error processing Excel file ${file}:`, error);
                }
            }
        });
    });
}
