import { By } from 'selenium-webdriver';
import { BasePage } from '../core/BasePage.js';

export class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.usernameField = By.css('[data-testid="email-input"]');
        this.passwordField = By.css('[data-testid="password-input"]');
        this.loginButton = By.css('span.m_811560b9.mantine-Button-label');
        this.errorMessage = By.className('error-message');
    }

    async login(username, password) {
        await this.type(this.usernameField, username);
        await this.type(this.passwordField, password);
        await this.click(this.loginButton);
    }

    async getErrorMessage() {
        return await this.getText(this.errorMessage);
    }
}
