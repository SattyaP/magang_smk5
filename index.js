require('dotenv').config()
const {
  executablePath
} = require("puppeteer");
const path = require('node:path')
const fs = require('node:fs')
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const captcha = path.join(process.cwd(), "./extension/captcha/");

const proccess = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
    args: [
      `--disable-extensions-except=${captcha}`,
      `--load-extension=${captcha}`,
    ]
  });
  const page = await browser.newPage();
  page.sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  page.sleep = function (timeout) {
    return new Promise(function (resolve) {
      setTimeout(resolve, timeout);
    });
  };

  try {
    await handleBuster(page)

    await page.goto("https://guestpostlinks.net/bulk-da-pa-checker-tool/", {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 120000,
    });

    const fileContent = fs.readFileSync('./list.txt', 'utf8').trim();
    await page.type('#dapa_link', fileContent);

    await page.sleep(10000);

    console.log("Check captcha....");
    await page.waitForSelector('iframe[title="reCAPTCHA"]')
    let frames = await page.frames();
    const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'));

    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
    await checkbox.click({
      delay: rdn(30, 150)
    });

    console.log("Solve captcha....");

    /**
     * TODO: Mengkondisikan apabila ada kotak puzzle captcha maka di click menggunakan solver dibawah jika tidak ada langsung click submit
     */

    const iframe = await page.waitForSelector('iframe[title="recaptcha challenge expires in two minutes"]');

    if (iframe) {
      const iframeContent = await iframe.contentFrame();
      const body = await iframeContent.waitForSelector('body');

      frames = await page.frames();
      const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'));
      const busterSolver = await imageFrame.$('#solver-button');
      await busterSolver.click({
        delay: rdn(30, 150)
      });
    }

    const submit = await page.waitForSelector(
      'button[type="submit"][id="DAPAformsend"]'
    );
    await submit.click();

    await page.sleep(5000);

    await page.waitForSelector("#dapa_tbl > tbody tr > td:not(:last-child):not(:nth-child(1)")

    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('#dapa_tbl > tbody tr > td:not(:last-child):not(:nth-child(1)');
      const data = [];
      rows.forEach((row) => {
        data.push(row.innerText);
      });
      return data;
    });
    console.log(data);

  } catch (error) {
    console.log("Error", error);
    // await browser.close();
  }
};

function rdn(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

const handleBuster = async (page) => {
  try {
    const pathId = path.join(process.cwd(), './data/id.txt');
    const id = fs.readFileSync(pathId, 'utf-8')
    if (id === '') {
      await page.goto('chrome://extensions', {
        waitUntil: ['domcontentloaded', "networkidle2"],
        timeout: 120000
      })
    } else {
      await page.goto(`chrome-extension://${id.trim()}/src/options/index.html`, {
        waitUntil: ['domcontentloaded', "networkidle2"],
        timeout: 120000
      })
    }

    if (id === '') {
      const idExtension = await page.evaluateHandle(
        'document.querySelector("body > extensions-manager").shadowRoot.querySelector("#items-list").shadowRoot.querySelectorAll("extensions-item")[0]'
      );
      await page.evaluate(e => e.style = "", idExtension)

      const id = await page.evaluate(e => e.getAttribute('id'), idExtension)

      await page.goto(`chrome-extension://${id}/src/options/index.html`, {
        waitUntil: ['domcontentloaded', "networkidle2"],
        timeout: 120000
      })

      fs.writeFileSync(pathId, id)
    }

    await page.sleep(3000)

    await page.evaluate(() => {
      document.querySelector("body > div.v-application.v-theme--dark.v-layout.v-layout--full-height.v-locale--is-ltr.vn-app > div > div:nth-child(1) > div.option-wrap > div > div > div.v-input__control > div").click()
    })
    await page.sleep(3000)
    await page.evaluate(() => {
      document.querySelector("body > div.v-overlay-container > div:nth-child(1) > div > div > div:nth-child(2)").click()
    })
    const fieldApi = await page.waitForSelector('#input-22')
    fieldApi && await fieldApi.type(process.env.APIKEY)
  } catch (error) {
    throw error;
  }
}

proccess().catch(console.error);