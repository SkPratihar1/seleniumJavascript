import { Builder } from 'selenium-webdriver';
import { config } from '../../src/config/config.js';
import { Logger } from '../../src/utils/Logger.js';
import fs from 'fs/promises';

export class BaseTest {
    async setUp() {
        this.driver = await new Builder()
            .forBrowser(config.browser)
            .build();
        await this.driver.manage().window().maximize();
        await this.driver.manage().setTimeouts(config.timeout);
    }

    async tearDown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async takeScreenshot(name) {
        try {
            const image = await this.driver.takeScreenshot();
            const dir = 'reports/screenshots';
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(`${dir}/${name}.png`, image, 'base64');
        } catch (error) {
            console.error('Screenshot error:', error);
        }
    }
}
