import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
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
        
        // Wait for URL to change and verify
        await test.driver.wait(async function() {
            const currentUrl = await test.driver.getCurrentUrl();
            return currentUrl.includes('sass-starter-kit.wordpress-studio.io/onboarding/create-workspace');
        }, 10000, 'URL did not change to expected value');
        
        const currentUrl = await test.driver.getCurrentUrl();
        expect(currentUrl).to.include('sass-starter-kit.wordpress-studio.io/onboarding/create-workspace');
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
