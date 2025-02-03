const puppeteer = require('puppeteer');
const express = require('express');
var app = express(exports);

const main = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');

    const pdf = await page.pdf();
    return pdf;
}


app.get('/', async function (req, res) {
    const pdf = await main();
    res.contentType("application/pdf");
    res.setHeader('Content-Disposition', 'inline; filename="awb.pdf"');

    res.end(pdf);
});

app.listen(3000, function () { console.log('Listening on 3000') });