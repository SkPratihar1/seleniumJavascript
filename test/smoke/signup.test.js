import { Builder } from 'selenium-webdriver';
import { faker } from '@faker-js/faker';
import { SignupPage } from '../../src/pages/SignupPage.js';
import { LoginPage } from '../../src/pages/LoginPage.js';

describe('Signup Flow', function() {
    this.timeout(60000);
    let driver;
    let signupPage;
    let loginPage;
    const testEmail = faker.internet.email();
    const password = 'Itobuz@1234';

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        signupPage = new SignupPage(driver);
        loginPage = new LoginPage(driver);
    });

    it('should complete signup process successfully', async function() {
        // Step 1: Navigate to login and click signup
        await signupPage.navigateToLogin();
        await signupPage.clickSignupLink();

        // Step 2: Register new user
        await signupPage.registerNewUser(testEmail, password);

        // Step 3: Get verification link from email and clean it
        await driver.sleep(5000);
        let verificationLink = await signupPage.getVerificationLink(testEmail);
        verificationLink = verificationLink.replace('wordpress-studio.=io', 'wordpress-studio.io');
        console.log('Cleaned verification link:', verificationLink);

        // Step 4: Verify account with retry and cleaned URL
        try {
            await signupPage.verifyAccount(verificationLink);
        } catch (error) {
            console.error('First verification attempt failed:', error);
            await driver.sleep(5000);
            await signupPage.verifyAccount(verificationLink);
        }

        // Step 5: Login with new account
        await driver.sleep(3000);
        await loginPage.login(testEmail, password);
    });

    after(async function() {
        if (driver) await driver.quit();
    });
});
