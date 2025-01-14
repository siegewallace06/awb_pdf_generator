const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const { escape } = require('lodash');
const fs = require('fs');
const puppeteer = require('puppeteer');


async function renderAwbWithOrientation(orders, printingSize, printerOrientation) {
    try {
        console.log('Printing AWB with orientation:', printerOrientation, 'and size:', printingSize);
        console.log('Orders:', orders);
        console.log('Orders Type:', typeof orders);
        if (printerOrientation === 'LANDSCAPE' && printingSize === 'A5') {
            return new ResultWrapper(new Error('Combination is not supported'));
        }

        if (printerOrientation === 'PORTRAIT' && printingSize === 'A6') {
            return new ResultWrapper(new Error('Combination is not supported'));
        }

        if (orders.length === 0) {
            return new ResultWrapper(new Error('No orders found!'));
        }

        let otherData = {
            printingSize: printingSize,
            hideShipperDetails: false
        };

        let docOptions = { size: 'A4', layout: 'portrait', margin: 35 };
        if (printingSize === 'A5') {
            docOptions.margin = printerOrientation === 'LANDSCAPE' ? 16 : 35;
        } else if (printingSize === 'A4') {
            docOptions.layout = printerOrientation === 'LANDSCAPE' ? 'landscape' : 'portrait';
        }

        let doc = new PDFDocument(docOptions);
        let htmlContent = '<html><body>';

        htmlContent += `<style>${getDefaultCssStyle()}`;
        htmlContent += generateAwbHtmlStyle(printingSize, printerOrientation); // Placeholder function
        htmlContent += '</style>';

        orders.orders.forEach((order, i) => {
            otherData.addFooterMargin = (printingSize === 'A5' && i % 2 === 0 && i < orders.length - 1) ||
                (printingSize === 'A6' && i % 2 === 1 && (i + 1) % 4 !== 0 && i < orders.length - 1);

            if (printingSize === 'A6' && i % 2 === 0) {
                htmlContent += "<table cellspacing='0' cellpadding='0' style='width: 100%;'><tr>";
            }

            htmlContent += `<td style='width: 49%; vertical-align: top;'>${generateAwbHtmlContent(order, otherData)}</td>`;

            if (printingSize === 'A6') {
                htmlContent += i % 2 === 0 ? "<td style='width: 2%;'></td>" : "</tr></table>";
            }

            if ((printingSize === 'A4' && i < orders.length - 1) ||
                (printingSize === 'A5' && i % 2 !== 0 && i < orders.length - 1) ||
                (printingSize === 'A6' && (i + 1) % 4 === 0 && i < orders.length - 1)) {
                htmlContent += "<div style='page-break-after:always'></div>";
            }
        });

        htmlContent += '</body></html>';

        let pdfBuffer = await new Promise((resolve, reject) => {
            doc.text(htmlContent).end();
            let buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
        });

        // return pdfBuffer;
        // For testing purposes, Return HTML content
        return htmlContent;
    } catch (error) {
        console.error('Exception stack:', error);
        return error;
    }
}

function generateAwbHtmlStyle(printingSize, printerOrientation) {
    return generateAwbPrintingStyleByPaperSize(printingSize, printerOrientation);
}

// Create Default CSS function
function getDefaultCssStyle() {
    let css = "";
    css += "body, td, p { font-family: arial, sans-serif; }";
    css += "pre, tt, code, kbd, samp { font-family: arial unicode ms; font-size: 9pt; line-height: 12pt; }";
    css += "dt { margin: 0; }";
    css += "body * { margin: 10%; font-size: 12pt; font-size: 8px !important; }";
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
    css += "table { margin-bottom: 0; margin-top: 0; margin-left: 0; margin-right: 0; text-indent: 0; max-width: 300px; }";
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

// =============== AWB Util =================
const A4_AWB_PRINTING_STYLE = {
    subtitleFontSize: 14,
    descriptionFontSize: 9,
    trackingNumberFontSize: 14,
    boxTitleFontSize: 13,
    boxContentHeight: 145,
    rowContentHeight: 30,
    boxContentTableFontSize: 12,
    boxContentTableWidthPercentage: 100,
    marginHeight: 10,
    marginFontSize: 1,
    footerMarginHeight: 10,
    footerMarginFontSize: 1,
    parcelSizeTitleFontSize: 14,
    parcelSizeImageHeight: 40,
    parcelSizeDescriptionFontSize: 10,
    boxSmallTitleFontSize: 10,
    boxCommentHeight: 50,
    boxCodFontSize: 17,
    boxCodHeight: 40,
    infoIconHeight: 17,
    addressFontSize: 12,
    timeslotFontSize: 12,
    codFontSize: 12,
    commentsFontSize: 12,
    sortCodeFontSize: 24,
    sortCodeGuideFontSize: 10,
    boxQRHeight: 32,
    boxBarcodeHeight: 24,
};

const A4_LANDSCAPE_AWB_PRINTING_STYLE = {
    subtitleFontSize: 20,
    descriptionFontSize: 13,
    trackingNumberFontSize: 20,
    boxTitleFontSize: 18,
    boxContentHeight: 203,
    rowContentHeight: 42,
    boxContentTableFontSize: 17,
    boxContentTableWidthPercentage: 100,
    marginHeight: 14,
    marginFontSize: 1,
    footerMarginHeight: 14,
    footerMarginFontSize: 1,
    parcelSizeTitleFontSize: 20,
    parcelSizeImageHeight: 56,
    parcelSizeDescriptionFontSize: 14,
    boxSmallTitleFontSize: 14,
    boxCommentHeight: 70,
    boxCodFontSize: 24,
    boxCodHeight: 56,
    infoIconHeight: 24,
    addressFontSize: 17,
    timeslotFontSize: 17,
    codFontSize: 17,
    commentsFontSize: 17,
    sortCodeFontSize: 34,
    sortCodeGuideFontSize: 14,
    boxQRHeight: 45,
    boxBarcodeHeight: 45,
};

const A5_AWB_PRINTING_STYLE = {
    subtitleFontSize: 14,
    descriptionFontSize: 9,
    trackingNumberFontSize: 14,
    boxTitleFontSize: 13,
    boxContentHeight: 145,
    rowContentHeight: 30,
    boxContentTableFontSize: 12,
    boxContentTableWidthPercentage: 100,
    marginHeight: 10,
    marginFontSize: 1,
    footerMarginHeight: 80,
    footerMarginFontSize: 1,
    parcelSizeTitleFontSize: 14,
    parcelSizeImageHeight: 40,
    parcelSizeDescriptionFontSize: 10,
    boxSmallTitleFontSize: 10,
    boxCommentHeight: 50,
    boxCodFontSize: 17,
    boxCodHeight: 40,
    infoIconHeight: 20,
    addressFontSize: 12,
    timeslotFontSize: 12,
    codFontSize: 12,
    commentsFontSize: 12,
    sortCodeFontSize: 24,
    sortCodeGuideFontSize: 10,
    boxQRHeight: 32,
    boxBarcodeHeight: 24,
};

const DEFAULT_AWB_PRINTING_STYLE = {
    subtitleFontSize: 8,
    descriptionFontSize: 6,
    trackingNumberFontSize: 9,
    boxTitleFontSize: 8,
    boxContentHeight: 90,
    rowContentHeight: 22,
    boxContentTableFontSize: 8,
    boxContentTableWidthPercentage: 100,
    marginHeight: 5,
    marginFontSize: 1,
    footerMarginHeight: 20,
    footerMarginFontSize: 1,
    parcelSizeTitleFontSize: 8,
    parcelSizeImageHeight: 27,
    parcelSizeDescriptionFontSize: 8,
    boxSmallTitleFontSize: 8,
    boxCommentHeight: 40,
    boxCodFontSize: 10,
    boxCodHeight: 24,
    infoIconHeight: 12,
    addressFontSize: 16,
    timeslotFontSize: 16,
    codFontSize: 16,
    commentsFontSize: 16,
    sortCodeFontSize: 20,
    sortCodeGuideFontSize: 8,
};


function generateAwbPrintingStyleByPaperSize(paperSize, printerOrientation) {
    let style;

    if (!paperSize) {
        style = DEFAULT_AWB_PRINTING_STYLE;
    } else {
        switch (paperSize) {
            case "A4":
                style = (printerOrientation === "LANDSCAPE")
                    ? A4_LANDSCAPE_AWB_PRINTING_STYLE
                    : A4_AWB_PRINTING_STYLE;
                break;
            case "A5":
                style = A5_AWB_PRINTING_STYLE;
                break;
            default:
                style = DEFAULT_AWB_PRINTING_STYLE;
        }
    }

    return generateAwbPrintingStyle(style);
}

function generateAwbPrintingStyle(style) {
    return `
        .awb_table .subtitle { font-size: ${style.subtitleFontSize}px; }
        .awb_table .description { font-style: italic; color: #828385; font-size: ${style.descriptionFontSize}px; }
        .awb_table .tracking_num { font-size: ${style.trackingNumberFontSize}px; }
        .awb_table .sort_code_box { border: 1px solid #000; width: 100%; }
        .awb_table .sort_code { font-weight: bold; font-size: ${style.sortCodeFontSize}px; }
        .awb_table .sort_code_guide { font-weight: bold; font-size: ${style.sortCodeGuideFontSize}px; color: #9d9d9d; letter-spacing: 4px; }
        .awb_table .sort_code_margin { height: 10px; font-size: 1px; }
        .awb_table .text_center { text-align: center; }
        .awb_table .box { border: 1.5px solid #cccccc; width: 100%; }
        .awb_table .box .box_title { border-bottom: 1.5px solid #cccccc; font-weight: bold; font-size: ${style.boxTitleFontSize}px; }
        .awb_table .box_content { height: ${style.boxContentHeight}px; }
        .awb_table .row_content { height: ${style.rowContentHeight}px; }
        .awb_table .box_content_table { font-size: ${style.boxContentTableFontSize}px; width: ${style.boxContentTableWidthPercentage}%; }
        .awb_table .grey_text { color: #828385; }
        .awb_table .margin { height: ${style.marginHeight}px; font-size: ${style.marginFontSize}px; }
        .footer_margin { height: ${style.footerMarginHeight}px; font-size: ${style.footerMarginFontSize}px; }
        .awb_table .parcel_size_title { font-weight: bold; font-size: ${style.parcelSizeTitleFontSize}px; text-align: center; }
        .awb_table .parcel_size_image { height: ${style.parcelSizeImageHeight}px; }
        .awb_table .parcel_size_description { color: #828385; font-size: ${style.parcelSizeDescriptionFontSize}px; text-align: center; }
        .awb_table .box .small_title { font-weight: bold; font-size: ${style.boxSmallTitleFontSize}px; }
        .awb_table .box .comment { height: ${style.boxCommentHeight}px; }
        .awb_table .box .cod { font-weight: bold; font-size: ${style.boxCodFontSize}px; height: ${style.boxCodHeight}px; text-align: center; }
        .awb_table .info_icon { height: ${style.infoIconHeight}px; }
        .awb_table img.qr_code { height: ${style.boxQRHeight}px; }
        .awb_table img.barcode_code { height: ${style.boxBarcodeHeight}px; }
    `;
}


function getCompanyLogo() {
    return 'https://modinity.com/cdn/shop/files/Modinity_logo_black-01_170x@2x.png?v=1650881836';
}

const Messages = {
    get: function (key) {
        const messages = {
            "renderAwb.AIRWAYBILL": "Airway Bill (AWB)",
            "renderAwb.FromSender": "From Sender",
            "renderAwb.COD": "Cash on Delivery",
            "renderAwb.ToAddressee": "To Addressee",
            "renderAwb.deliverBy": "Deliver By"
        };
        return messages[key] || key;
    }
};

function generateAwbHtmlContent(order, otherData) {
    let html = "";

    let deliveryTiming = "-";
    let instructions = order.deliveryInstructions;
    let tableCellPadding = 4;

    if (otherData.printingSize === "A6") {
        tableCellPadding = 2;
    }

    html += "<table cellspacing='0' cellpadding='6' style='width: 100%;' class='border'><tr><td>";
    html += "<table cellspacing='0' cellpadding='" + tableCellPadding + "' style='width: 100%;' class='awb_table'>";
    html += "<tr>";
    html += "<td class='text_center'>";
    const messages = "Placeholder";
    html += generateAwbHtmlBarcodeHeader(
        messages,
        getCompanyLogo(),
        order.companyUrl,
        order.trackingId,
        order.parcelSize,
        order.sortCode
    );
    html += "</td></tr><tr><td>";
    html += "<table cellspacing='0' cellpadding='0' border='0' width='100%'>";
    html += "<tr><td style='width: 39%;'>";
    html += "<table cellspacing='0' cellpadding='" + tableCellPadding + "' class='box'>";
    html += "<tr><td class='box_title'>" + Messages.get("renderAwb.FromSender") + "</td></tr>";
    html += "<tr><td class='box_content' valign='top'>";
    html += "<table cellspacing='0' cellpadding='0' class='box_content_table'>";
    html += "<tr><td valign='middle' style='width: 12%;'><img src='/public/images/ic_person_black_18dp_2x.png' class='info_icon' /></td>";
    html += "<td valign='middle' style='width: 3%;'></td>";
    html += "<td valign='middle' style='width: 85%;' class='address'>";

    if (otherData.hideShipperDetails) {
        html += escapeHtml(order.sentFrom || "");
    } else if (order.fromName) {
        html += escapeHtml(ellipsis(order.fromName, 35));
    }

    if (order.fromAddress2 && order.fromCity &&
        order.fromAddress2.toLowerCase().includes(order.fromCity.toLowerCase())) {
        order.fromAddress2 = order.fromAddress2.replace(order.fromCity, "");
    }

    if (order.toAddress2 && order.toCity &&
        order.toAddress2.toLowerCase().includes(order.toCity.toLowerCase())) {
        order.toAddress2 = order.toAddress2.replace(order.toCity, "");
    }

    html += "</td></tr><tr><td colspan='3' class='margin'></td></tr>";

    if (!otherData.hideShipperDetails) {
        html += "<tr><td valign='middle'><img src='/public/images/ic_call_black_18dp_2x.png' class='info_icon' /></td>";
        html += "<td valign='middle'></td>";
        html += "<td valign='middle' class='address'>" + escapeHtml(ellipsis(order.fromContact, 35)) + "</td>";
        html += "</tr><tr><td colspan='3' class='margin'></td></tr>";
        html += "<tr><td valign='top'><img src='/public/images/ic_place_black_18dp_2x.png' class='info_icon' /></td>";
        html += "<td valign='top'></td>";
        html += "<td valign='top' class='address'>" + escapeHtml(ellipsis(`${order.fromAddress1} ${order.fromAddress2 || ""} ${order.fromCity || ""} ${order.fromCountry || ""} ${order.fromPostcode || ""}`, 300)) + "</td>";
        html += "</tr><tr><td colspan='3' class='margin'></td></tr>";
    }

    html += "</table></td></tr></table><div class='margin'></div>";
    html += "<table cellspacing='0' cellpadding='" + tableCellPadding + "' class='box' style='border: 3px solid #000000;'>";
    html += "<tr><td class='row_content' valign='middle'>";
    html += "<table cellspacing='0' cellpadding='0' class='box_content_table'>";
    html += "<tr><td valign='middle' style='width: 14%;'>" + Messages.get("renderAwb.COD") + ":</td><td valign='middle' style='width: 1%;'></td></tr>";
    html += "</table></td></tr></table></td><td style='width: 2%;'></td><td style='width: 59%;'>";
    html += "<table cellspacing='0' cellpadding='" + tableCellPadding + "' class='box'>";
    html += "<tr><td class='box_title'>" + Messages.get("renderAwb.ToAddressee") + "</td></tr>";
    html += "<tr><td class='box_content' valign='top'>";
    html += "<table cellspacing='0' cellpadding='0' class='box_content_table'>";
    html += "<tr><td valign='middle' style='width: 8%;'><img src='/public/images/ic_person_black_18dp_2x.png' class='info_icon' /></td>";
    html += "<td valign='middle' style='width: 2%;'></td>";
    html += "<td valign='middle' style='width: 90%'>" + escapeHtml(ellipsis(order.toName, 50)) + "</td></tr>";
    html += "<tr><td colspan='3' class='margin'></td></tr>";

    let toContact = order.toContact ? escapeHtml(ellipsis(order.toContact, 50)) : "";

    if (toContact) {
        const lastFourDigits = toContact.slice(-4);
        toContact = toContact.replace(lastFourDigits, "****");
    }

    const disclaimer = "Note: The contact number & address information on the Air Waybill have been temporarily hidden as we are in the midst of a system enhancement. You can still process and ship out your orders as per usual.";

    html += "<tr><td valign='middle'><img src='/public/images/ic_call_black_18dp_2x.png' class='info_icon' /></td>";
    html += "<td valign='middle'></td>";
    html += "<td valign='middle' class='address'>" + toContact + "</td></tr>";
    html += "<tr><td valign='top' colspan='3' class='margin'></td></tr>";
    html += "<tr><td valign='top'></td><td valign='top'></td>";
    html += "<td valign='bottom' style='font-size:8px;'>" + disclaimer + "</td></tr></table></td></tr></table><div class='margin'></div>";
    html += "<table cellspacing='0' cellpadding='" + tableCellPadding + "' class='box'>";
    html += "<tr><td class='row_content' valign='middle'>";
    html += "<table cellspacing='0' cellpadding='0' class='box_content_table'>";
    html += "<tr><td valign='middle' style='width: 8%;'><img src='/public/images/ic_access_time_black_18dp_2x.png' class='info_icon' /></td>";
    html += "<td valign='middle' style='width: 20%;'>" + Messages.get("renderAwb.deliverBy") + ":</td>";
    html += "<td valign='middle' style='width: 2%;'></td>";
    html += "<td valign='middle' style='width: 70%;'>" + deliveryTiming + "</td></tr></table></td></tr></table></td></tr></table></td></tr></table>";

    if (otherData.addFooterMargin) {
        html += "<table cellspacing='0' cellpadding='0' style='width: 100%;'><tr><td class='footer_margin'></td></tr></table>";
    }

    return html;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function ellipsis(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

function getFontURL(url) {
    return url;
}

function generateAwbHtmlBarcodeHeader(messages, logo, companyUrl, orderTrackingNumber, parcelSize, sortCode) {
    return `
        <table cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
            <tr>
                <td style="width: 25%; text-align: left; padding: 0">
                    <img class="qr_code" src="data:image/png;base64,${generateBarcodeQRCode(orderTrackingNumber)}" style="margin: 0;" />
                </td>
                <td style="width: 1%;"></td>
                <td style="width: 30%; text-align: left;">
                    <img src="${logo}" style="height: 10px;" /><br />
                    <span class="subtitle"> ${companyUrl}</span><br />
                </td>
                <td style="width: 2%;"></td>
                <td style="width: 41%;">
                    <table cellspacing="0" cellpadding="8" class="sort_code_box">
                        <tr><td>
                            <div class="text_center sort_code">${sortCode}</div>
                            <div style="height: 3px;"></div>
                            <div class="text_center sort_code_guide">FOR INTERNAL USE</div>
                        </td></tr>
                    </table>
                    <div class="sort_code_margin"></div>
                    <div class="tracking_num">${escape(orderTrackingNumber)}</div>
                    <img class="barcode_code" src="data:image/png;base64,${generateBarcode128String(orderTrackingNumber)}" />
                    <div style="height: 3px;"></div>
                    <div class="tracking_num">
                        ${messages.at("Size")}/${messages.at("Weight")}: ${parcelSize}
                    </div>
                </td>
            </tr>
        </table>
    `;
}


// Function to generate QR Code as base64 PNG
async function generateBarcodeQRCode(orderTrackingNumber) {
    const canvas = createCanvas(500, 500); // Matching the 500x500 size in the Java method
    return new Promise((resolve, reject) => {
        QRCode.toCanvas(canvas, orderTrackingNumber, {
            width: 500,
            margin: 0,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error) => {
            if (error) reject(error);
            else resolve(canvas.toDataURL('image/png').split(',')[1]); // Return base64 part
        });
    });
}

// Function to generate Code 128 barcode as base64 PNG
function generateBarcode128String(orderTrackingNumber) {
    const canvas = createCanvas();
    JsBarcode(canvas, orderTrackingNumber, {
        format: 'CODE128',
        width: 2,
        height: 100,
        displayValue: true,
        background: '#FFFFFF',
        lineColor: '#000000',
        margin: 0
    });
    return canvas.toDataURL('image/png').split(',')[1]; // Return base64 part
}


// Save the generated PDF to a file
function savePdfToFile(pdfBuffer, fileName) {
    fs.writeFileSync(fileName, pdfBuffer);
}

// Read a JSON file for the user input
function readJsonFile(fileName) {
    const parsedJson = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    console.log(`Read ${fileName} successfully. JSON data:`, parsedJson);
    return parsedJson;
}

// Main function to generate the AWB PDF
async function generateAwbPdf() {
    const orders = readJsonFile('orders.json');
    console.log('Orders from JSON:', orders);

    const htmlContent = await renderAwbWithOrientation(orders, 'A4', 'PORTRAIT');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    savePdfToFile(pdfBuffer, 'AWB.pdf');

    // For testing purposes, print the HTML content to a file
    fs.writeFileSync('AWB.html', htmlContent);

    console.log('AWB PDF generated successfully.');
}

generateAwbPdf();
