const PDFDocument = require('pdfkit');

const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const bwipjs = require('bwip-js');

const { escape, get } = require('lodash');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

function getNormalizeCss() {
    const normalizeCss = `
        <style>
        /*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */
        button,
        hr,
        input {
            overflow: visible
        }

        progress,
        sub,
        sup {
            vertical-align: baseline
        }

        [type=checkbox],
        [type=radio],
        legend {
            box-sizing: border-box;
            padding: 0
        }

        html {
            line-height: 1.15;
            -webkit-text-size-adjust: 100%
        }

        body {
            margin: 0
        }

        details,
        main {
            display: block
        }

        h1 {
            font-size: 2em;
            margin: .67em 0
        }

        hr {
            box-sizing: content-box;
            height: 0
        }

        code,
        kbd,
        pre,
        samp {
            font-family: monospace, monospace;
            font-size: 1em
        }

        a {
            background-color: transparent
        }

        abbr[title] {
            border-bottom: none;
            text-decoration: underline;
            text-decoration: underline dotted
        }

        b,
        strong {
            font-weight: bolder
        }

        small {
            font-size: 80%
        }

        sub,
        sup {
            font-size: 75%;
            line-height: 0;
            position: relative
        }

        sub {
            bottom: -.25em
        }

        sup {
            top: -.5em
        }

        img {
            border-style: none
        }

        button,
        input,
        optgroup,
        select,
        textarea {
            font-family: inherit;
            font-size: 100%;
            line-height: 1.15;
            margin: 0
        }

        button,
        select {
            text-transform: none
        }

        [type=button],
        [type=reset],
        [type=submit],
        button {
            -webkit-appearance: button
        }

        [type=button]::-moz-focus-inner,
        [type=reset]::-moz-focus-inner,
        [type=submit]::-moz-focus-inner,
        button::-moz-focus-inner {
            border-style: none;
            padding: 0
        }

        [type=button]:-moz-focusring,
        [type=reset]:-moz-focusring,
        [type=submit]:-moz-focusring,
        button:-moz-focusring {
            outline: ButtonText dotted 1px
        }

        fieldset {
            padding: .35em .75em .625em
        }

        legend {
            color: inherit;
            display: table;
            max-width: 100%;
            white-space: normal
        }

        textarea {
            overflow: auto
        }

        [type=number]::-webkit-inner-spin-button,
        [type=number]::-webkit-outer-spin-button {
            height: auto
        }

        [type=search] {
            -webkit-appearance: textfield;
            outline-offset: -2px
        }

        [type=search]::-webkit-search-decoration {
            -webkit-appearance: none
        }

        ::-webkit-file-upload-button {
            -webkit-appearance: button;
            font: inherit
        }

        summary {
            display: list-item
        }

        [hidden],
        template {
            display: none
        }
    </style>
    `;
    return normalizeCss;
}

function getDefaultCssStyle() {
    const defaultCssStyle = `
        <style>
        body {
            font-family: Arial, sans-serif;
            margin: 24px;
        }

        main {
            border-width: 1px 1px 0px 1px;
            border-style: solid;
            max-width: 300px;
            /* padding: 8px; */
        }

        h1,
        h2,
        h3,
        h4,
        p {
            margin: 0;
        }

        h1 {
            font-size: 10px;
        }

        h3 {
            font-size: 9px;

        }

        h3.title {
            margin-left: 14px;
        }


        p,
        span {
            font-size: 9px;
        }

        svg {
            width: 9px;
            height: 9px;
            /* margin-right: 4px; */
            flex-shrink: 0;
        }

        .center {
            text-align: center;
            display: block;
        }

        .px-4 {
            padding-inline: 4px;
        }

        .py-4 {
            padding-block: 4px;
        }

        .p-4 {
            padding: 4px;
        }

        img.center {
            display: block;
            margin-inline: auto;
        }

        .w-100 {
            width: calc(100% - 16px);
            padding: 8px;
        }

        .w-50>* {
            width: calc(50% - 16px);
            padding: 8px;
            flex-shrink: 0;
            flex-grow: 1;
        }

        .w-25>* {
            width: calc(25% - 16px);
            padding: 8px;
            flex-shrink: 0;
            flex-grow: 1;
        }

        .w-50>.p-0 {
            width: 50%;
            padding: 0 !important;
        }

        .h-33 {
            height: calc(100% / 3 - 16px);

        }

        .h-66 {
            height: calc(100% * 2 / 3 - 16px);
        }

        *.border-right>*:not(:last-of-type) {
            border-right: 1px solid;
        }

        *.border-bottom>* {
            border-bottom: 1px solid;
        }

        *.border-bottom-not-last>*:not(:last-of-type) {
            border-bottom: 1px solid;
        }

        .pengirim {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .pengirim__store {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .pengirim__store>* {
            width: calc(50% - 2px);
        }

        .text-with-icon {
            display: flex;
            gap: 4px;
        }

        /* BARCODE 1 */
        .barcode-1 {
            img {
                width: 100%;
            }
        }

        /* CONTENT 1 */
        .content-1 {
            display: flex;

            .container {
                padding-inline: 4px;
            }
        }

        /* CONTENT 2 */

        .content-2 {
            display: flex;

            >* {

                padding: 4px;

            }



            span {
                display: block;
            }

            span:first-of-type {
                margin-bottom: 2px;
            }
        }

        /* CONTENT 3 */
        .content-3.w-50>* {
            flex-grow: 0;
        }

        .content-3 {
            display: flex;

            >*:not(:last-of-type) {
                border-right: 1px solid;
            }

            .content-3__penerima {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .content-3__keterangan {
                display: flex;
                flex-direction: column;

                img {
                    height: 18px;
                }
            }


        }

        /* BARCODE 2 */
        .barcode-2 {
            img {
                width: 50%;
                display: block;
                margin-inline: auto;
                margin-block: 4px;
                aspect-ratio: 3 / 1;
            }
        }

        /* LINE ITEMS */
        .line-items {

            .line-items__header,
            .line-items__list>div {
                display: flex;
                gap: 8px;
                margin-bottom: 4px;
            }

            h3:first-of-type,
            span:first-of-type {
                width: 22px;
                display: inline-block;
                flex-shrink: 0;
            }
        }
    </style>
    `
    return defaultCssStyle;
}

function generateHtml() {
    let html = `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AWB Document</title>
    ${getNormalizeCss()}
    ${getDefaultCssStyle()}
</head>
    <!-- To Do Body Here -->
    ${generateHtmlBody(readJsonFile('order.json'))}
</html>
`;
    // html += getNormalizeCss();
    // html += getDefaultCssStyle();
    // html += '</head>'
    // ToDo add Body
    // html += '</html>'

    // For Testing generate the HTML and put to "test.html"
    fs.writeFileSync('test.html', html);
    return html;
}

// Generate HTML Body for the PDF
function generateHtmlBody(orderData) {
    // For Receiver Name, Hide the Word to only show first two characters from each word
    // Ex: "John Smith" --> "Jo** Sm***"
    const receiverName = orderData.receiverName.replace(/\w+/g, (word) => {
        return word.slice(0, 2) + '*'.repeat(word.length - 2);
    });
    // For Phone Number, Only show First 2 and Last 2 digits.
    // Ex: "081234567890" --> "08********90"
    // Ex: "+6281298765432" --> "+62********32"
    const receiverPhoneNumber = orderData.receiverPhoneNumber.replace(/(\+?\d{2})\d*(\d{2})/, (match, p1, p2) => {
        return p1 + '*'.repeat(match.length - p1.length - p2.length) + p2;
    });
    const htmlBody = `
<body>


    <main class="border-bottom">
        <!-- PENGIRIM -->
        <div class="pengirim container w-100">
            <h3 class="title">PENGIRIM</h3>
            <div class="pengirim__store">
                <div class="text-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-user-round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                    <h3>
                        ${orderData.shopName}
                    </h3>
                </div>

                <div class="text-with-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-phone">
                        <path
                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>
                        ${orderData.shopPhoneNumber}
                        </span>
                </div>
            </div>
            <div class="text-with-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-map-pin">
                    <path
                        d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <p>
                    ${orderData.shopAddress}
                </p>
            </div>
        </div>

        <!-- BARCODE 1 -->
        <div class="barcode-1 container w-100">
            <img src="${generateBarcode128String(orderData.orderID)}" alt="">
            <h3 class="center">${orderData.orderID}</h3>
        </div>

        <div class="content border-bottom-not-last">
            <!-- CONTENT 1 -->
            <!-- CONTENT 2 -->
            <!-- CONTENT 3 -->
            <div class="content-3 w-50">
                <div class="content-3__penerima">
                    <h3 class="title">PENERIMA</h3>
                    <div class="text-with-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-user-round">
                            <circle cx="12" cy="8" r="5" />
                            <path d="M20 21a8 8 0 0 0-16 0" />
                        </svg>
                        <span>${receiverName}</span>
                    </div>

                    <div class="text-with-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-phone">
                            <path
                                d="M21 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>${receiverPhoneNumber}</span>
                    </div>

                    <div class="text-with-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-map-pin">
                            <path
                                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <p>
                            ${orderData.receiverAddress}
                            </p>
                    </div>
                </div>
                <div class="content-3__keterangan border-bottom-not-last p-0">
                    <div class=" w-100 h-33">
                        <h3 class="center"> ${orderData.orderType} </h3>
                    </div>
                    <div class="w-100 h-33">
                        <p class="center">${getCodType(orderData.orderCodValue)} - Rp. ${formatNumber(orderData.orderShippingCost)}</p>
                    </div>
                    <div class="w-100 h-66">
                        <img class="center" src="${getShipperLogo(orderData.logisticName)}" alt="">
                    </div>
                </div>
            </div>
        </div>

        <!-- BARCODE 2 -->
        <div class="barcode-2 w-100">
            <span class="center">Tgl. Order - ${orderData.orderDate}</span>
            <img src="${generateBarcode128String(orderData.orderNumber)}"
            alt=""/>
            <span class="center">No. Order - ${orderData.orderNumber}</span>
        </div>

        <!-- LINE ITEMS -->
        <div class="line-items w-100">
            <div class="line-items__header">
                <h3>QTY</h3>
                <h3>ITEMS</h3>
            </div>
            <div class="line-items__list">
                ${generateOrderItems(orderData.orderItems)}
            </div>
        </div>

    </main>
</body>
`;
    return htmlBody;
}

function generateAwbPdf() {
    const html = generateHtml();
    puppeteer.launch().then(browser => {
        return browser.newPage().then(page => {
            return page.setContent(html).then(() => {
                return page.pdf({ path: 'awb.pdf', format: 'A6' }).then(() => {
                    browser.close();
                    console.log('PDF Generated Successfully');
                });
            });
        });
    }).catch(err => {
        console.error('Error generating PDF:', err);
    });
}

// Function to Loop the Order Items from the JSON and generate div for each item
function generateOrderItems(orderItems) {
    let orderItemsHtml = '';
    orderItems.forEach((orderItem, index) => {
        if (index < 10) {
            orderItemsHtml += `
            <div>
                <span class="center">${orderItem.qty}</span>
                <span>${orderItem.orderName}</span>
            </div>
            `;
        }
    });

    if (orderItems.length > 10) {
        const remainingItems = orderItems.length - 10;
        orderItemsHtml += `
        <div>
            <span class="center"></span>
            <span><b> ${remainingItems} Produk Lainnya </b></span>
        </div>
        `;
    }

    return orderItemsHtml;
}

// Function get Shipper Logo
// "SAP" --> "sap.jpg"
// "JNE" --> "jne.jpg"
function getShipperLogo(shopName) {
    const basePath = path.resolve(__dirname);
    const shipperLogoPath = basePath + '/' + shopName.toLowerCase() + '.jpg';
    console.log('Shipper Logo Path: ', shipperLogoPath);
    return shipperLogoPath;
}

// COD Type or Non-COD Type
function getCodType(orderCodValue) {
    return orderCodValue > 0 ? 'COD' : 'NON-COD';
}

// Generate Barcode 128 with 708x128
function generateBarcode128String(orderNumber) {
    // Create a canvas
    const canvas = createCanvas(708, 128);

    // Generate the barcode on the canvas
    JsBarcode(canvas, orderNumber, {
        format: 'CODE128',
        width: 4,
        height: 128,
        displayValue: false
    });

    // Convert the canvas to a base64 string
    const base64Str = canvas.toDataURL('image/png').split(',')[1]; // Extract base64 part
    const response = `data:image/png;base64,${base64Str}`;

    // Log the generated barcode
    console.log('Barcode 128 Generated: ', response);

    // Save the barcode to a file for testing
    // fs.writeFileSync('barcode-1.jpeg', Buffer.from(base64Str, 'base64'));

    return response;
}

// function generateBarcode128String(orderTrackingNumber) {
//     console.log(`Generating Barcode for ${orderTrackingNumber}`)
//     return new Promise((resolve, reject) => {
//         // Generate barcode with bwip-js
//         bwipjs.toBuffer({
//             bcid: 'code128',       // Barcode type
//             text: orderTrackingNumber, // Text to encode
//             scale: 3,              // 3x scaling factor
//             height: 10,            // Bar height, in millimeters
//             includetext: false,    // Do not include the text below the barcode
//         }, (err, png) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 // Convert the PNG buffer to a base64 string
//                 const base64Str = png.toString('base64');
//                 const response = `data:image/png;base64,${base64Str}`;

//                 // Log the generated barcode
//                 console.log('Barcode 128 Generated: ', response);

//                 // Save the barcode to a file for testing
//                 fs.writeFileSync('barcode-128.png', png);

//                 resolve(response);
//             }
//         });
//     });
// }


// Read a JSON file for the user input
function readJsonFile(fileName) {
    const parsedJson = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    console.log(`Read ${fileName} successfully.JSON data: `, parsedJson);
    return parsedJson;
}

// Function to add "." every 3 digits for the number
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Helper function to convert an image to a base64 string
function imageToBase64(filePath) {
    console.log('Image to Base64: ', filePath);
    const bitmap = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${Buffer.from(bitmap).toString('base64')}`;
}

// For Testing generate the HTML and put to "test.html"
// fs.writeFileSync('test.html', generateHtml());
generateAwbPdf();