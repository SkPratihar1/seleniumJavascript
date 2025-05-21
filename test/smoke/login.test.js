import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { until, By } from 'selenium-webdriver';
import { BaseTest } from '../base/BaseTest.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { config } from '../../src/config/config.js';
import { testData } from '../../src/config/test.data.js';

describe('Login Tests', function() {
    let test;
    let loginPage;

    beforeEach(async function() {
        test = new BaseTest();
        await test.setUp();
        loginPage = new LoginPage(test.driver);
        await test.driver.get(config.baseUrl);
    });

    it('should login successfully with valid credentials', async function() {
        await loginPage.login(testData.validUser.username, testData.validUser.password);

        // Wait for any welcome content
        await test.driver.sleep(2000); // Adjust sleep time as needed
        const welcomeElement = await test.driver.wait(
            until.elementLocated(By.css('h2.text-4xl.font-bold.text-blue-700')),
            10000,
            'Welcome heading not found'
        );

        const welcomeText = await welcomeElement.getText();
        console.log('Found welcome text:', welcomeText);
        
        expect(welcomeText).to.equal('Discover Simplicity & Elegance');
    });

    // it('should show error message with invalid credentials', async function() {
    //     await loginPage.login('invalidUser', 'invalidPass');
    //     const errorMessage = await loginPage.getErrorMessage();
    //     expect(errorMessage).to.equal('Invalid credentials');
    // });

    afterEach(async function() {
        try {
            if (this.currentTest.state === 'failed') {
                await test.takeScreenshot(this.currentTest.title);
            }
            // Clear cookies and local storage
            await test.driver.manage().deleteAllCookies();
            await test.driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
        } catch (error) {
            console.error('Cleanup error:', error);
        } finally {
            await test.tearDown();
        }
    });
});
