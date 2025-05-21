import { By, until } from 'selenium-webdriver';

export class LoginPage {
    constructor(driver) {
        this.driver = driver;
        this.selectors = {
            emailInput: '[data-testid="email-input"]',
            passwordInput: '[data-testid="password-input"]',
            loginButton: "//span[text()='Login']",
            errorMessage: '.Toastify__toast--error'
        };
    }

    async login(email, password) {
        await this.driver.findElement(By.css(this.selectors.emailInput)).sendKeys(email);
        await this.driver.findElement(By.css(this.selectors.passwordInput)).sendKeys(password);
        await this.driver.findElement(By.xpath(this.selectors.loginButton)).click();
        
        await this.driver.wait(
            until.urlContains('/dashboard'),
            10000,
            'Login failed - not redirected to dashboard'
        );
    }

    async getErrorMessage() {
        const toast = await this.driver.wait(
            until.elementLocated(By.css(this.selectors.errorMessage)),
            5000
        );
        return await toast.getText();
    }
}
