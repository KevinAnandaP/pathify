const fs = require("fs");
const path = require("path");
const readline = require("readline");
const XLSX = require("xlsx");

const DATASET1_DIR = path.join(__dirname, "../dataset1");
const DATASET2_DIR = path.join(__dirname, "../dataset2");

async function convertFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".csv" && ext !== ".xlsx") return;

  const fileName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);
  const destPath = path.join(dirName, `${fileName}.json`);

  console.log(`Processing: ${path.basename(filePath)} (${ext}) -> ${fileName}.json`);

  try {
    if (ext === ".csv") {
      // Stream the first 1001 lines of the CSV file
      const fileStream = fs.createReadStream(filePath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      const lines = [];
      let count = 0;
      for await (const line of rl) {
        lines.push(line);
        count++;
        if (count >= 1001) {
          rl.close();
          fileStream.destroy();
          break;
        }
      }

      const csvContent = lines.join("\n");
      const workbook = XLSX.read(csvContent, { type: "string" });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      fs.writeFileSync(destPath, JSON.stringify(data, null, 2), "utf8");
      console.log(`  - Successfully written ${data.length} rows to: ${destPath}`);

      // Delete the original CSV file to save space and remove Git tracking
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  - Deleted original: ${filePath}\n`);
      }
    } else {
      // XLSX file
      const workbook = XLSX.readFile(filePath);
      const result = {};

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        let data = XLSX.utils.sheet_to_json(sheet);
        
        // Slice to first 1000 rows to ensure lightweight files
        if (data.length > 1000) {
          console.log(`  - Slicing sheet "${sheetName}" from ${data.length} to 1000 rows.`);
          data = data.slice(0, 1000);
        }
        result[sheetName] = data;
      });

      // If there is only one sheet, write the array directly to make the JSON simpler
      const sheetsCount = workbook.SheetNames.length;
      const finalData = sheetsCount === 1 ? result[workbook.SheetNames[0]] : result;

      fs.writeFileSync(destPath, JSON.stringify(finalData, null, 2), "utf8");
      console.log(`  - Successfully written: ${destPath}`);

      // Delete the original XLSX file to save space and remove Git tracking
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  - Deleted original: ${filePath}\n`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        await convertFile(fullPath);
      }
    }
  }
}

async function run() {
  console.log("Starting dataset conversion and cleanup...\n");
  await processDirectory(DATASET1_DIR);
  await processDirectory(DATASET2_DIR);
  console.log("Dataset conversion completed successfully.");
}

run().catch((err) => {
  console.error("Conversion failed:", err);
});

