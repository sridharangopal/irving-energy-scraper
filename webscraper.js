require('dotenv').config();
const puppeteer = require('puppeteer');
const rp = require('request-promise');
var $ = require('cheerio');

async function send(pricetoday) {
  var options = {
    uri: 'https://io.adafruit.com/api/v2/' + process.env.ADAFRUIT_USERNAME + '/feeds/' + process.env.ADAFRUIT_FEED_KEY + '/data',
    method: 'POST',
    headers: {
      'User-Agent': 'Request-Promise',
      'X-AIO-Key': process.env.ADAFRUIT_AIO
    },
    body: {
      value: pricetoday
    },
    json: true // Automatically parses the JSON string in the response
  };
  
  rp(options)
    .then(function (res) {
      console.log('Response: %s', res);
    })
    .catch(function (err) {
      // API call failed...
      console.log('API Post request failed with error:')
      console.log(err);
    });
}

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // dom element selectors
  const USERNAME_SELECTOR = '#email_check';
  const PASSWORD_SELECTOR = '#password_check';
  const BUTTON_SELECTOR = '#cmdLogin';
  const PRICE_SELECTOR = '#user-summary-table > tbody > tr:nth-child(14) > td.user-info-right-col';

  await page.goto('https://myaccount.irvingenergy.com/login');
  // await page.screenshot({
  //   path: 'screenshots/loginpage.png'
  // });

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(process.env.IRVING_USERNAME);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(process.env.IRVING_PASSWORD);

  await page.click(BUTTON_SELECTOR);

  // await page.waitForNavigation();
  // await page.screenshot({
  //   path: 'screenshots/homepage.png'
  // });

  await page.waitForSelector(PRICE_SELECTOR);

  let price = await page.evaluate((sel) => {
    return document.querySelector(sel).outerText;
  }, PRICE_SELECTOR);

  console.log('Price : ' + price);
  send(price);

  browser.close();
}

// main body
run();
