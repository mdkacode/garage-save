import path from "path";
const fs = require('fs');
const puppeteer = require('puppeteer');


const coverttopdf = async () => {
    try {
        const htmlPath = path.join(__dirname, 'public', 'index.html');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://127.0.0.1:8080/public/`);
        const pdfBuffer = await page.pdf();
        const pdfPath = path.join(__dirname, 'public', 'generated.pdf');
        fs.writeFileSync(pdfPath, pdfBuffer);
        await browser.close();
    } catch (error) {
        console.log(error)
    }


    // Send the PDF as a response

}

export default coverttopdf;