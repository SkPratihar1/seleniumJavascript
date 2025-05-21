import { By, until } from 'selenium-webdriver';

export class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.selectors = {
            emailInput: '[data-testid="email-input"]',
            passwordInput: '[data-testid="password-input"]',
            loginButton: "//span[text()='Login']",
            errorMessage: '.Toastify__toast--error',
            userAvatar: '[data-avatar-placeholder-icon="true"]',
            profileMenuItem: '.mantine-Menu-itemLabel:has-text("Profile")',
            profileMenuXPath: "//div[contains(@class, 'mantine-Menu-itemLabel') and text()='Profile']"
        };
    }

    async login(email, password) {
        await this.driver.findElement(By.css(this.selectors.emailInput)).sendKeys(email);
        await this.driver.findElement(By.css(this.selectors.passwordInput)).sendKeys(password);
        await this.driver.findElement(By.xpath(this.selectors.loginButton)).click();
        await this.driver.sleep(2000); // Wait for login to process
        // await this.driver.wait(
        //     until.urlContains('/dashboard'),
        //     10000,
        //     'Login failed - not redirected to dashboard'
        // );
        //await this.navigateToProfile();
    }

    async navigateToProfile() {
        await this.driver.sleep(2000); // Wait for page load
        // Click user avatar
        const avatar = await this.driver.wait(
            until.elementLocated(By.css(this.selectors.userAvatar)),
            10000,
            'User avatar not found'
        );
        await avatar.click();
        await this.driver.sleep(1000); // Wait for menu

        // Click profile menu item
        const profileItem = await this.driver.wait(
            until.elementLocated(By.xpath(this.selectors.profileMenuXPath)),
            10000,
            'Profile menu item not found'
        );
        await profileItem.click();
        await this.driver.sleep(2000); // Wait for profile page
    }

    async getErrorMessage() {
        const toast = await this.driver.wait(
            until.elementLocated(By.css(this.selectors.errorMessage)),
            5000
        );
        return await toast.getText();
    }
}
