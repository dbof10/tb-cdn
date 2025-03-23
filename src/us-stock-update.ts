import axios from "axios";
import fs from "fs";
import path from "path";

const FINNHUB_API_URL = "https://finnhub.io/api/v1/stock/symbol?exchange=US&token=cv4odf1r01qn2gabautgcv4odf1r01qn2gabauu0";
const OUTPUT_CSV = path.join(process.cwd(), "us-stocks.csv");

interface FinnhubStock {
    symbol: string;
    displaySymbol: string;
    description: string;
    mic: string;
    type: string;
}

async function fetchStocks(): Promise<FinnhubStock[]> {
    try {
        const response = await axios.get<FinnhubStock[]>(FINNHUB_API_URL);
        return response.data;
    } catch (error: any) {
        console.error("Error fetching stocks:", error.message);
        return [];
    }
}

function formatName(raw: string): string {
    return raw
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function writeToCsv(stocks: FinnhubStock[]) {
    const header = "symbol,exchange,name,type,mic";
    const rows = stocks.map((stock) => {
        const formattedName = formatName(stock.description);
        return `${stock.symbol},US,${formattedName},${stock.type},${stock.mic}`;
    });

    const csvContent = [header, ...rows].join("\n");
    fs.writeFileSync(OUTPUT_CSV, csvContent, "utf8");
    console.log(`✅ CSV written to ${OUTPUT_CSV}`);
}


async function main() {
    console.log("📥 Fetching US stocks from Finnhub...");
    const stocks = await fetchStocks();
    console.log(`📊 Found ${stocks.length} common stocks`);

    writeToCsv(stocks);
}

main();
