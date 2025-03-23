"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const FINNHUB_API_URL = "https://finnhub.io/api/v1/stock/symbol?exchange=US&token=cv4odf1r01qn2gabautgcv4odf1r01qn2gabauu0";
const OUTPUT_CSV = path_1.default.join(process.cwd(), "us-stocks.csv");
async function fetchStocks() {
    try {
        const response = await axios_1.default.get(FINNHUB_API_URL);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching stocks:", error.message);
        return [];
    }
}
function formatName(raw) {
    return raw
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
function writeToCsv(stocks) {
    const header = "symbol,exchange,name,type,mic";
    const rows = stocks.map((stock) => {
        const formattedName = formatName(stock.description);
        return `${stock.symbol},US,${formattedName},${stock.type},${stock.mic}`;
    });
    const csvContent = [header, ...rows].join("\n");
    fs_1.default.writeFileSync(OUTPUT_CSV, csvContent, "utf8");
    console.log(`✅ CSV written to ${OUTPUT_CSV}`);
}
async function main() {
    console.log("📥 Fetching US stocks from Finnhub...");
    const stocks = await fetchStocks();
    console.log(`📊 Found ${stocks.length} common stocks`);
    writeToCsv(stocks);
}
main();
