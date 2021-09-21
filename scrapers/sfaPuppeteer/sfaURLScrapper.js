// https://github.com/puppeteer/puppeteer/blob/v10.2.0/docs/api.md#
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const url = 'https://occasion.sfa.bg/';

module.exports = (carBrand, carModel) => {
  return new Promise(async (res, rej) => {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        slowMo: 450,
      });
    
      const page = await browser.newPage();
    
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });
    
      // click on a cookie agreement button
      await page.click('button.cc_b_ok');
    
      // select peugeot -> value = 9
      await page.select('select[name="Search[brand]"]', carBrand);
    
      // select model
      // value = 28 (308 SW)
      // value = 37 (508)
      await page.select('#model-holder', carModel);
    
      // select gear, value = 1 (manual)
      await page.select('select[name="Search[gear_box]"]', '1');
    
      // select engine, value = 3 (diesel)
      await page.select('select[name="Search[engine]"]', '3');
    
      // SEARCH
      await page.click('input[type="submit"]');
    
      const html = await page.content();
      
      fs.writeFile(path.join(__dirname + `/${carModel}-sample.html`), html, async () => {
        // get current url
        const currentUrl = await page.evaluate(() => document.location.href)
        await browser.close();
        
        res(currentUrl);
      });
    } catch (error) {
      console.log('PUPPETEER ERROR', error.message);
    }
  });
};
