import * as dotenv from 'dotenv'
dotenv.config()

import puppeteer from 'puppeteer'
import got from 'got'

async function send(feedKey, data) {
  const options = {
    url: 'https://io.adafruit.com/api/v2/' + process.env.ADAFRUIT_USERNAME + '/feeds/' + feedKey + '/data',
    method: 'POST',
    headers: {
      'User-Agent': 'Got',
      'X-AIO-Key': process.env.ADAFRUIT_AIO
    },
    json: {
      value: data
    }
  };

  const response = await got(options);
  if(response.statusCode !== 200) throw new Error('Send to Adafruit failed : ' + response.statusCode)
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 60000,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // dom element selectors
  const USERNAME_SELECTOR = '#email_check';
  const PASSWORD_SELECTOR = '#password_check';
  const BUTTON_SELECTOR = '#cmdLogin';
  const PRICE_SELECTOR = 'body.user-record-summary:nth-child(2) div.outer-div table.body-table:nth-child(2) tr.main-row:nth-child(4) td.main-column div.main-div div.user-info:nth-child(1) div.user-info-table-div table.user-info-table tbody:nth-child(2) tr.user-home-data.odd:nth-child(13) > td.user-info-right-col';
  const LEVEL_SELECTOR = 'body.body-style:nth-child(2) div.outer-div table.body-table:nth-child(2) tr.main-row:nth-child(4) td.main-column div.main-div div:nth-child(2) table.tank-table:nth-child(1) tbody:nth-child(1) tr:nth-child(5) > td:nth-child(2)';
  const GALLONS_SELECTOR = 'body.body-style:nth-child(2) div.outer-div:nth-child(1) table.body-table:nth-child(2) tr.main-row:nth-child(4) td.main-column div.main-div div:nth-child(2) table.tank-table:nth-child(1) tbody:nth-child(1) tr:nth-child(6) > td:nth-child(2)';
  const LOGOUT_BUTTON = '#user-option-button-logout'

  await page.goto('https://myaccount.irvingenergy.com/login');
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(process.env.IRVING_USERNAME);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(process.env.IRVING_PASSWORD);
  await page.click(BUTTON_SELECTOR);
  await page.waitForSelector(PRICE_SELECTOR);

  let price = await page.evaluate((sel) => {
    return document.querySelector(sel).outerText;
  }, PRICE_SELECTOR);
  console.log('Price : ' + price);

  await page.goto('https://myaccount.irvingenergy.com/tankmonitors')

  let level = await page.evaluate((sel) => {
    return document.querySelector(sel).outerText;
  }, LEVEL_SELECTOR);
  console.log('Level : ' + level.split(".")[0]);

  let gallons = await page.evaluate((sel) => {
      return document.querySelector(sel).outerText;
  }, GALLONS_SELECTOR);
  console.log('Gallons : ' + gallons);

  await page.goto('https://myaccount.irvingenergy.com/logout')

  await send('propaneprice', price);
  await send('propanelevel', level);
  await send('gallonsremaining', gallons);

  // await page.click(LOGOUT_BUTTON)
  await browser.close();
}

// main body
run();
