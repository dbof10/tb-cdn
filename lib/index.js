"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const https = require("https");
const FINNHUB_API_URL = "https://finnhub.io/api/v1/stock/symbol?exchange=US&token=cv4odf1r01qn2gabautgcv4odf1r01qn2gabauu0";
const LOGO_BASE_URL = "https://companiesmarketcap.com/img/company-logos/64";
const PROJECT_ROOT = process.cwd(); // Get the project root
const STOCKS_DIR = path.join(PROJECT_ROOT, "usstock"); // Store images in the project root
const ERROR_LOG = path.join(PROJECT_ROOT, "error.log"); // Store log in project root
// Ensure the stocks directory exists
if (!fs.existsSync(STOCKS_DIR)) {
    fs.mkdirSync(STOCKS_DIR, { recursive: true });
}
// Sleep function to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// Read existing failed downloads from the error log
function readErrorLog() {
    if (!fs.existsSync(ERROR_LOG)) {
        return [];
    }
    try {
        const data = fs.readFileSync(ERROR_LOG, "utf8");
        return JSON.parse(data) || [];
    }
    catch (error) {
        return [];
    }
}
// Write failed downloads to the error log in [A, B, C] format
function writeErrorLog(failedSymbols) {
    const existingFailures = readErrorLog();
    const updatedFailures = Array.from(new Set([...existingFailures, ...failedSymbols])); // Avoid duplicates
    fs.writeFileSync(ERROR_LOG, JSON.stringify(updatedFailures, null, 2));
}
// Fetch stocks from Finnhub API
async function fetchStocks() {
    try {
        const response = await axios.get(FINNHUB_API_URL);
        return response.data.filter((stock) => stock.type === "Common Stock" && stock.mic !== "OOTC"); // Exclude OTC stocks
    }
    catch (error) {
        console.error("Error fetching stocks:", error.message);
        return [];
    }
}
// Download and save a stock logo
async function downloadLogo(symbol) {
    const logoUrl = `${LOGO_BASE_URL}/${symbol}.webp`;
    const filePath = path.join(STOCKS_DIR, `${symbol}.webp`);
    return new Promise((resolve) => {
        https
            .get(logoUrl, (response) => {
            if (response.statusCode !== 200) {
                resolve(symbol); // Return failed symbol
                return;
            }
            const fileStream = fs.createWriteStream(filePath);
            response.pipe(fileStream);
            fileStream.on("finish", () => {
                fileStream.close();
                resolve(null); // Success: return null
            });
            fileStream.on("error", () => {
                fileStream.close();
                if (fs.existsSync(filePath))
                    fs.unlinkSync(filePath); // Delete incomplete file
                resolve(symbol);
            });
        })
            .on("error", () => {
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath); // Delete incomplete file
            resolve(symbol);
        });
    });
}
// Main function with index progress and 500ms delay per download
async function main() {
    console.log("Fetching stock symbols...");
    const stocks = await fetchStocks();
    const totalStocks = stocks.length;
    const failedSymbols = [];
    console.log(`Downloading logos for ${totalStocks} stocks (excluding OTC)...`);
    for (let i = 0; i < totalStocks; i++) {
        const stock = stocks[i];
        const failure = await downloadLogo(stock.symbol);
        if (failure) {
            console.error(`[${i + 1}/${totalStocks}] Failed: ${stock.symbol}`);
            failedSymbols.push(stock.symbol);
        }
        else {
            console.log(`[${i + 1}/${totalStocks}] Downloaded: ${stock.symbol}`);
        }
        await sleep(250); // Wait 500ms before next request
    }
    if (failedSymbols.length > 0) {
        writeErrorLog(failedSymbols);
    }
    console.log("Process completed.");
}
main();
