const {
  executablePath
} = require("puppeteer");
const path = require('node:path')
const fs = require('node:fs')
const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth());

const captcha = path.join(process.cwd(), "./extension/captcha/");

/**
 * TODO: Get url /20 
 */

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

  page.on("response", (response) => {
    const request = response.request();
    if (
      request.resourceType() === "xhr" &&
      request.url().includes("https://guestpostlinks.net/wp-admin/admin-ajax.php")
    ) {
      response.text().then((text) => console.log("Body", text));
    }
  })

  try {
    await handleBuster(page)

    await page.goto("https://guestpostlinks.net/bulk-da-pa-checker-tool/", {
      waitUntil: ["domcontentloaded", "networkidle2"],
      timeout: 120000,
    });

    await page.waitForSelector("#dapa_link");
    await page.$eval(
      "#dapa_link",
      (el) => (el.value = "https://guestpostlinks.net/")
    );

    console.log("Check captcha ...");
    await page.waitForSelector('iframe[title="reCAPTCHA"]')
    let frames = await page.frames();
    const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'));

    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
    await checkbox.click({
      delay: rdn(30, 150)
    });

    /**
     * TODO: Mengkondisikan apabila ada modal kotak itu click solver dibawah kalo ngga ada langsung ke  click submit
     */
    
    // CLICK SOLVER ORANGE
    // frames = await page.frames();
    // const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'));
    // const busterSolver = await imageFrame.$('#solver-button');
    // await busterSolver.click({
    //   delay: rdn(30, 150)
    // });

    console.log("Solve captcha....");

    const submit = await page.waitForSelector(
      'button[type="submit"][id="DAPAformsend"]'
    );
    await submit.click();

  } catch (error) {
    console.log("Error", error);
    await browser.close();
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
