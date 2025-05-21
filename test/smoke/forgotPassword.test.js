import { Builder, By, until } from 'selenium-webdriver';
import assert from 'node:assert';
import { ForgotPasswordPage } from '../../src/pages/ForgotPasswordPage.js';

describe('Forgot Password Flow', function() {
    this.timeout(60000); // Increase timeout for async email handling
    let driver;
    let forgotPasswordPage;

    const testEmail = 'pratihar+sas@itobuz.com';
    const newPassword = 'NewPassword123!';

    beforeEach(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.manage().window().maximize();
        forgotPasswordPage = new ForgotPasswordPage(driver);
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
    });
});
