const puppeteer = require("puppeteer-extra");
const path = require('path');

const spoof = path.join(process.cwd(), "extension/spoof/");

let browser;
let page;
let stopFlag = false;

const runaAway = async (logToTextarea, headless) => {
    stopFlag = false;
    const options = {
        ignoreHTTPSErrors: true,
        args: [
            `--load-extension=${spoof}`,
            `--disable-extensions-except=${spoof}`,
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-popup-blocking",
            "--allow-popups-during-page-unload",
            "--disable-setuid-sandbox",
            "--force-device-scale-factor=0.5"
        ]
    };

    browser = await puppeteer.launch({
        defaultViewport: null,
        headless: headless,
        ...options,
    });

    page = await browser.newPage();

    page.sleep = function (timeout) {
        return new Promise(function (resolve) {
            setTimeout(resolve, timeout);
        });
    };

    try {
        logToTextarea("Navigating");

        const scrap = async () => {
            await page.goto('https://webscraper.io/test-sites/e-commerce/allinone', {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            await page.waitForSelector(".title");
            const choice = await page.$$(".title");

            for (let i = 0; i < choice.length; i++) {
                await choice[i].click();
                await page.waitForTimeout(1000);

                const data = [".card-title", ".price", ".description", ".ratings .pull-right"];
                await page.waitForSelector(data[0]);

                for (let j = 0; j < data.length; j++) {
                    const item = await page.$eval(data[j], (el) => el.innerText);
                    if (j === data.length - 1) {
                        console.log(item + "\n");
                    } else {
                        console.log(item);
                    }
                }

                await page.goBack({
                    waitUntil: "networkidle2"
                });
                await page.waitForSelector(".title", {
                    timeout: 5000
                });
            }
        }

        await scrap();
        await browser.close();
    } catch (error) {
        logToTextarea(error);
        if (browser) {
            await browser.close();
        }
    }
};

const startProcess = async (logToTextarea, progress, headless) => {
    let loop = 100;
    for (let i = 0; i < loop; i++) {
        try {
            stopFlag = false;
            const progressValue = parseInt(((i + 1) / loop) * 100);

            progress(progressValue);

            logToTextarea("Iteration: " + i);
            await runaAway(logToTextarea, headless);
        } catch (error) {
            logToTextarea(error);
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        if (stopFlag) {
            logToTextarea("Stop the process successfully");
            break;
        }
    }
};

const stopProcess = (logToTextarea) => {
    stopFlag = true;
    logToTextarea("Stop process, waiting until this process is done");
};

module.exports = {
    startProcess,
    stopProcess
};

// To start the process
const logToTextarea = console.log;
const progress = (value) => console.log(`Progress: ${value}%`);
const headless = false;

startProcess(logToTextarea, progress, headless);