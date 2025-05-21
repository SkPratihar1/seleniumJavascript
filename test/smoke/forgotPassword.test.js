import { Builder, By, until } from 'selenium-webdriver';
import assert from 'node:assert';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';
import { LoginPage } from '../../src/pages/LoginPage.js';

describe('Forgot Password Flow', function() {
    this.timeout(60000); // Increase timeout for async email handling
    let driver;
    let forgotPasswordPage;
    let loginPage;

    const testEmail = 'pratihar+sas@itobuz.com';
    const specialChars = ['@', '#', '$', '%', '&'];
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const newPassword = `Itobuz${randomSpecial}${randomNum}`;

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        forgotPasswordPage = new ForgotPasswordPage(driver);
        loginPage = new LoginPage(driver);
    });

    afterEach(async function() {
        if (driver) await driver.quit();
    });

    it('should handle forgot password process', async function() {
        // Step 1: Navigate to login and verify forgot password text
        await forgotPasswordPage.navigateToLogin();
        await driver.wait(until.elementLocated(By.linkText('Forgot Your Password?')), 10000);
        
        // Step 2: Click forgot password and verify redirect
        await forgotPasswordPage.clickForgotPassword();
        await driver.sleep(2000); // Wait for page load
        await driver.wait(until.urlContains('forget-password'), 10000);
        const currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('forget-password'), 'Should be on forgot password page');
       
        // Step 3: Submit email and verify success message
        await driver.sleep(2000); // Wait for page load
        await forgotPasswordPage.submitEmail(testEmail);
         await driver.sleep(2000); // Wait for page load
        await forgotPasswordPage.waitForSuccessMessage();
        await driver.sleep(2000); // Wait for page load
        
        // Step 4: Get reset token from email
        const token = await forgotPasswordPage.getResetTokenViaMailhog(testEmail);
        assert.ok(token, 'Should get valid reset token');
        
        // Step 5: Reset password with token
        await forgotPasswordPage.navigateToResetPassword(token);
        await forgotPasswordPage.resetPassword(newPassword);
        
        // Step 6: Verify redirect to login page
        await driver.wait(
            until.urlContains('/login'),
            10000,
            'Should redirect to login after password reset'
        );

        // Step 7: Verify login with new password
        await loginPage.login(testEmail, newPassword);
        await driver.sleep(2000); // Wait for page load

        // Wait for either dashboard or root URL
        // await driver.wait(
        //     until.or(
        //         until.urlIs('https://sass-starter-kit.wordpress-studio.io'),
        //         until.urlIs('https://sass-starter-kit.wordpress-studio.io/dashboard')
        //     ),
        //     10000,
        //     'Not redirected to homepage or dashboard'
        // );

        // Wait for any welcome content
        const welcomeElement = await driver.wait(
            until.elementLocated(By.css('h2.text-4xl.font-bold.text-blue-700')),
            10000,
            'Welcome heading not found'
        );

        const welcomeText = await welcomeElement.getText();
        console.log('Found welcome text:', welcomeText);
        
        // Compare with the actual text that includes the HTML entity
        assert.strictEqual(
            welcomeText,
            'Discover Simplicity & Elegance',
            'Welcome heading should match exactly'
        );
    });
});
