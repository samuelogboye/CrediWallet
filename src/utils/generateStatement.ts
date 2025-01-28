import fs from "fs";
import path from "path";
import pdfmake from "pdfmake";
import { MetricsType, Transaction, User } from "../types";
import { TDocumentDefinitions } from "pdfmake/interfaces";

// Function to generate the file path with current date and time
const generateFilePath = (userId: number): string => {
  const statementsDir = path.join(__dirname, "..", "statements");

  // Create statements directory if it doesn't exist
  if (!fs.existsSync(statementsDir)) {
    fs.mkdirSync(statementsDir);
  }

  // Get the current date and time
  const now = new Date();
  const dateString = now.toISOString().replace(/[-:.]/g, "");

  // Construct the file path
  return path.join(statementsDir, `statement_${userId}_${dateString}.pdf`);
};

// Function to generate PDF
const generateStatementPDF = async (
  transactions: Transaction[],
  user: Partial<User>,
  metrics: MetricsType
): Promise<string> => {
  const filePath = generateFilePath(user.id);

  const printer = new pdfmake({
    Roboto: {
      normal: path.join(__dirname, "..", "fonts", "Roboto-Regular.ttf"),
      bold: path.join(__dirname, "..", "fonts", "Roboto-Medium.ttf"),
      italics: path.join(__dirname, "..", "fonts", "Roboto-Italic.ttf"),
      bolditalics: path.join(
        __dirname,
        "..",
        "fonts",
        "Roboto-MediumItalic.ttf"
      ),
    },
  });

  const docDefinition: TDocumentDefinitions = {
    content: [
      { text: "Account Statement", style: "header" },
      { text: `Name: ${user.name}`, style: "subheader" },
      { text: `Wallet Number: ${user.account_number}`, style: "subheader" },
      { text: `Phone Number: ${user.account_number}`, style: "subheader" },
      { text: `Account Number: ${user.account_number}`, style: "subheader" },
      {
        text: `Total Money In: ₦${metrics.totalCredit}`,
        style: "subheader",
      },
      {
        text: `Total Money Out: ₦${metrics.totalDebit}`,
        style: "subheader",
      },
      {
        text: `Statement Period: ${metrics.from} - ${metrics.to}`,
        style: "subheader",
      },
      { text: `Print Time: ${metrics.currentDate}`, style: "subheader" },
      { text: "Transactions", style: "tableHeader" },
      {
        table: {
          headerRows: 1,
          widths: ["20%", "40%", "10%", "10%", "20%"],
          body: [
            [
              "Transaction Date",
              "Transaction Detail",
              "Money In (NGN)",
              "Money Out (NGN)",
              "Transaction ID",
            ],
            ...transactions.map((transaction) => [
              transaction.created_at,
              transaction.description,
              transaction.money_in ? `+${transaction.money_in}` : "",
              transaction.money_out ? `-${transaction.money_out}` : "",
              transaction.id,
            ]),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
      },
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.end();

  return new Promise((resolve, reject) => {
    pdfDoc.on("end", () => {
      resolve(filePath);
    });
    pdfDoc.on("error", reject);
  });
};

export { generateStatementPDF };
