/*
The Script is used to generate a AWB and save it in PDF format. Here how it works:
1. First a list of information is collected from the user.
2. The collected information will be put into a HTML template (First init an empty string variable then append the HTML template with the user input). Also the barcode will be generated using the collected AWB ID.
3. The HTML template will be converted to PDF by adjusting the page size and orientation.

Here are a sample of user input:
{
    "orders": [
        {
            "trackingId": "A0000001",
            "sentFrom": "Shipper A",
            "fromName": "Shipper A",
            "fromContact": "Shipper A'\''s Contact Number",
            "fromAddress1": "Shipper A'\''s Warehouse Address 1",
            "fromAddress2": "Shipper A'\''s Warehouse Address 2",
            "fromCity": "Shipper A'\''s Warehouse City",
            "fromPostcode": "Shipper A'\''s Warehouse Postcode",
            "fromCountry": "Shipper A'\''s Warehouse Country",
            "toName": "Consignee A",
            "toContact": "Consignee A'\''s Contact Number",
            "toAddress1": "Consignee A'\''s Home Address 1",
            "toAddress2": "Consignee A'\''s Home Address 2",
            "toCity": "Consignee A'\''s Home City",
            "parcelSize": "Consignee A'\''s Parcel Size",
            "sortCode": "Consignee A'\''s Parcel Sort Code",
            "deliveryInstructions": "Please place the parcel outside the door",
            "companyUrl": "Logistic Provider'\''s Company Url"
        }
    ],
    "printingSize": "A4",
    "printerOrientation": "PORTRAIT"
}
*/

// Import the required modules
const fs = require('fs');
const pdf = require('html-pdf');
const path = require('path');
const jsBarcode = require('jsbarcode');
const readline = require('readline');

// Get the user input from console prompt
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

// Generate barcode using the AWB ID and save it as a PNG file for later use
function generateBarcode(awbId) {
    const canvas = createCanvas();
    jsBarcode(canvas, awbId, { format: 'CODE128' });
    return canvas.toDataURL('image/png');
}

// Create the HTML template using the user input and barcode
function createAWBHTML(trackingId, sentFrom, fromName, fromContact, fromAddress1, fromAddress2, fromCity, fromPostcode, fromCountry, toName, toContact, toAddress1, toAddress2, toCity, parcelSize, sortCode, deliveryInstructions, companyUrl, barcodeData) {
    let htmlString = "<!DOCTYPE html>";
    htmlString += "<html><body>";

    htmlString += "<style>";
    // Call Get CSS Function
    htmlString += getDefaultCssStyle();

}

// Create Default CSS function
function getDefaultCssStyle() {
    let css = "";
    css += "body, td, p { font-family: arial unicode ms; }";
    css += "pre, tt, code, kbd, samp { font-family: arial unicode ms; font-size: 9pt; line-height: 12pt; }";
    css += "dt { margin: 0; }";
    css += "body { margin: 10%; font-size: 12pt; }";
    css += "p, dl, multicol { margin: 1em 0; }";
    css += "dd { margin-left: 40px; margin-bottom: 0; margin-right: 0; margin-top: 0; }";
    css += "blockquote, figure { margin: 1em 40px; }";
    css += "center { display: block; text-align: center; }";
    css += "blockquote[type='cite'] { border: 3px solid; padding-left: 1em; border-color: blue; border-width: thin; margin: 1em 0; }";
    css += "h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }";
    css += "h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }";
    css += "h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }";
    css += "h4 { font-size: 1em; font-weight: bold; margin: 1.33em 0; }";
    css += "h5 { font-size: 0.83em; font-weight: bold; margin: 1.67em 0; }";
    css += "h6 { font-size: 0.67em; font-weight: bold; margin: 2.33em 0; }";
    css += "listing { font-size: medium; margin: 1em 0; white-space: pre; }";
    css += "xmp, pre, plaintext { margin: 1em 0; white-space: pre; }";
    css += "table { margin-bottom: 0; margin-top: 0; margin-left: 0; margin-right: 0; text-indent: 0; }";
    css += "caption { text-align: center; }";
    css += "tr { vertical-align: inherit; }";
    css += "tbody { vertical-align: middle; }";
    css += "thead { vertical-align: middle; }";
    css += "tfoot { vertical-align: middle; }";
    css += "table > tr { vertical-align: middle; }";
    css += "td { padding: 1px; text-align: inherit; vertical-align: inherit; }";
    css += "th { display: table-cell; font-weight: bold; padding: 1px; vertical-align: inherit; }";
    css += "sub { font-size: smaller; vertical-align: sub; }";
    css += "sup { font-size: smaller; vertical-align: super; }";
    css += "nobr { white-space: nowrap; }";
    css += "mark { background: none repeat scroll 0 0 yellow; color: black; }";
    css += "abbr[title], acronym[title] { border-bottom: 1px dotted; }";
    css += "ul, menu, dir { list-style-type: disc; }";
    css += "ul li ul { list-style-type: circle; }";
    css += "ol { list-style-type: decimal; }";
    css += "hr { color: gray; height: 2px; }";
    return css;
}

