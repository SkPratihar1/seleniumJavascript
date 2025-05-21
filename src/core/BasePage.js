import { until } from 'selenium-webdriver';
import { Logger } from '../utils/Logger.js';

export class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.timeout = 10000;
    }

    async waitForElement(locator) {
        try {
            return await this.driver.wait(until.elementLocated(locator), this.timeout);
        } catch (error) {
            Logger.error(`Element not found: ${locator}`);
            throw error;
        }
    }

    async click(locator) {
        const element = await this.waitForElement(locator);
        await element.click();
    }

    async type(locator, text) {
        const element = await this.waitForElement(locator);
        await element.sendKeys(text);
    }
}
