const { createCanvas } = require('canvas');
const jsBarcode = require('jsbarcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const readline = require('readline');

// Function to prompt user for details using readline
function getAWBDetails() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const questions = [
        'Enter sender name: ',
        'Enter receiver name: ',
        'Enter AWB ID: ',
        'Enter package weight (kg): ',
        'Enter package dimensions (LxWxH): '
    ];

    // Default answers
    const defaultAnswers = ['John Doe', 'Jane', '123456', '2', '10x5x5'];

    const answers = [];

    return new Promise((resolve) => {
        const askQuestion = (index) => {
            if (index === questions.length) {
                rl.close();
                resolve({
                    sender: answers[0],
                    receiver: answers[1],
                    awbId: answers[2],
                    weight: answers[3],
                    dimensions: answers[4]
                });
            } else {
                rl.question(questions[index], (answer) => {
                    answers.push(answer);
                    askQuestion(index + 1);
                });
            }
        };
        askQuestion(0);
    });
}

// Function to generate barcode
function generateBarcode(awbId) {
    const canvas = createCanvas();
    jsBarcode(canvas, awbId, { format: 'CODE128' });
    return canvas.toDataURL('image/png');
}

// Function to create PDF
function createAWBPDF(details, barcodeData) {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('AWB.pdf'));

    doc.fontSize(18).text('Airway Bill (AWB)', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Sender: ${details.sender}`);
    doc.text(`Receiver: ${details.receiver}`);
    doc.text(`AWB ID: ${details.awbId}`);
    doc.text(`Weight: ${details.weight} kg`);
    doc.text(`Dimensions: ${details.dimensions}`);
    doc.moveDown();

    // Add barcode image
    const barcodeBuffer = Buffer.from(barcodeData.split(',')[1], 'base64');
    doc.image(barcodeBuffer, { fit: [250, 100], align: 'center' });

    doc.end();
}

async function main() {
    try {
        const details = await getAWBDetails();
        const barcodeData = generateBarcode(details.awbId);
        createAWBPDF(details, barcodeData);
        console.log('AWB PDF generated successfully.');
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
