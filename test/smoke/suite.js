import { describe, before, after } from 'mocha';
import { By, until } from 'selenium-webdriver';
import { BaseTest } from '../base/BaseTest.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { config } from '../../src/config/config.js';
import { testData } from '../../src/config/test.data.js';

// State management
let currentPassword = process.env.PASSWORD;

describe('Smoke Test Suite', function() {
    this.timeout(300000); // 5 minutes total
    let driver;
    let baseTest;

    before(async function() {
        baseTest = new BaseTest();
        await baseTest.setUp();
        driver = baseTest.driver;
        await driver.manage().window().maximize();
    });

    // Test order matters for state management
    describe('Authentication Flow', function() {
        it('Signup', async function() {
            await import('./signup.test.js');
        });
        it('Forgot Password', async function() {
            const result = await import('./forgotPassword.test.js');
            currentPassword = result.newPassword || currentPassword;
        });

        it('Login', async function() {
            await import('./login.test.js');

            // const loginPage = new LoginPage(driver);
            // await loginPage.login(testData.validUser.username, currentPassword);
            
            // // Verify login success
            // const welcomeText = await driver.wait(
            //     until.elementLocated(By.css('h2.text-4xl.font-bold.text-blue-700')),
            //     10000
            // );
            // const text = await welcomeText.getText();
            // if (!text.includes('Discover Simplicity')) {
            //     throw new Error('Login failed - incorrect welcome message');
            // }
        });

        
    });

    describe('Content Management', function() {
        beforeEach(async function() {
            // Ensure we're logged in before each test
            const loginPage = new LoginPage(driver);
            await driver.get(config.baseUrl);
            await loginPage.login(testData.validUser.username, currentPassword);
            await driver.sleep(2000);
        });

        it('Workspace Management', async function() {
            await import('./workspaceCRUD.test.js');
        });

        it('Post Management', async function() {
            await import('./postManagement.test.js');
        });
    });

    after(async function() {
        if (baseTest) {
            await baseTest.tearDown();
        }
    });
});
