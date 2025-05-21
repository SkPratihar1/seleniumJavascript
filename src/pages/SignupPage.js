import { By, until } from 'selenium-webdriver';
import axios from 'axios';

export class SignupPage {
    constructor(driver) {
        this.driver = driver;
        this.selectors = {
            loginPageTitle: "//div[contains(@class, 'text-gray-600') and contains(@class, 'text-xl')]",
            loginForm: 'form',
            signupLink: "//span[text()=\"You don't have an account?\"]",
            signupPageTitle: "//div[contains(@class, 'text-gray-600') and contains(@class, 'text-xl') and contains(text(), 'Create a new account')]",
            emailInput: '[data-testid="email-input"]',
            passwordInput: '[data-testid="password-input"]',
            registerButton: "//span[text()='Register']",
            successMessage: "//div[contains(text(), 'Please check your email for verification')]",
            verificationSuccess: "//div[contains(text(), 'Account verified. Please login')]"
        };
        this.mailhogApi = 'https://mailhog.x-studio.io/api/v2/messages';
    }

    async navigateToLogin() {
        await this.driver.get('https://sass-starter-kit.wordpress-studio.io/login');
        await this.driver.sleep(2000); // Wait for initial page load

        // Wait for login page title
        const titleElement = await this.driver.wait(
            until.elementLocated(By.xpath(this.selectors.loginPageTitle)),
            10000,
            'Login page title not found'
        );

        // Verify login page text
        const titleText = await titleElement.getText();
        if (!titleText.includes('Login To Your Account')) {
            throw new Error(`Expected "Login To Your Account" but found "${titleText}"`);
        }
    }

    async clickSignupLink() {
        const signupLink = await this.driver.findElement(By.xpath(this.selectors.signupLink));
        await signupLink.click();
        await this.driver.wait(
            until.urlIs('https://sass-starter-kit.wordpress-studio.io/register'),
            10000
        );
    }

    async registerNewUser(email, password) {
        await this.driver.sleep(2000); // Wait for page load
        // Wait for signup form with retry
        // await this.driver.wait(async () => {
        //     try {
        //         const titleElement = await this.driver.findElement(By.xpath(this.selectors.signupPageTitle));
        //         const text = await titleElement.getText();
        //         return text.includes('Create a new account');
        //     } catch (error) {
        //         return false;
        //     }
        // }, 10000, 'Signup page title not found');

        await this.driver.sleep(1000); // Wait for form to be fully loaded
        
        // Fill in registration form
        await this.driver.findElement(By.css(this.selectors.emailInput)).sendKeys(email);
        await this.driver.findElement(By.css(this.selectors.passwordInput)).sendKeys(password);
        await this.driver.findElement(By.xpath(this.selectors.registerButton)).click();

        // Wait for success message
        await this.driver.wait(
            until.elementLocated(By.xpath(this.selectors.successMessage)),
            10000,
            'Registration success message not found'
        );
    }

    async getVerificationLink(email, retryCount = 5, delayMs = 2000) {
        for (let i = 0; i < retryCount; i++) {
            try {
                console.log(`Attempt ${i + 1}: Fetching welcome email...`);
                const response = await axios.get(`${this.mailhogApi}?limit=50`);
                
                const welcomeEmail = response.data.items.find(msg => 
                    msg.Content.Headers.Subject?.[0] === 'Welcome' && 
                    msg.Content.Headers.To?.[0].includes(email)
                );

                if (!welcomeEmail) {
                    console.log('Welcome email not found, retrying...');
                    await new Promise(res => setTimeout(res, delayMs));
                    continue;
                }

                const body = welcomeEmail.Content.Body;
                //console.log('Email body:', body);

                // Try multiple token extraction patterns
                const patterns = [
                    /verify-email\?token=([^"&\s]+)/i,
                    /token[=&#x3D;]([a-f0-9-]+)/i,
                    /token\\?&#x3D;([a-f0-9-]+)/i,
                    /token=3D([^"&\s]+)/
                ];

                for (const pattern of patterns) {
                    const match = body.match(pattern);
                    if (match && match[1]) {
                        const token = match[1]
                            .replace(/&#x3D;/g, '=')
                            .replace(/&amp;/g, '&')
                            .replace(/=3D/g, '=');
                        
                        const verificationUrl = `https://sass-starter-kit.wordpress-studio.io/verify-email?token=${token}`;
                        console.log('Constructed verification URL:', verificationUrl);
                        return verificationUrl;
                    }
                }

                console.log('No token pattern matched, retrying...');
                await new Promise(res => setTimeout(res, delayMs));

            } catch (error) {
                console.error(`Error in attempt ${i + 1}:`, error.message);
                if (i === retryCount - 1) throw error;
                await new Promise(res => setTimeout(res, delayMs));
            }
        }
        throw new Error('Token not found in welcome email');
    }

    async verifyAccount(verificationLink, retryCount = 3) {
        // Extract token if full URL is provided
        const token = verificationLink.split('token=')[1];
        if (!token) {
            throw new Error('Invalid verification link - no token found');
        }

        const cleanUrl = `https://sass-starter-kit.wordpress-studio.io/verify-email?token=${token}`;
        console.log('Navigating to:', cleanUrl);
        
        await this.driver.get(cleanUrl);
        await this.driver.sleep(2000);

        await this.driver.wait(
            until.elementLocated(By.xpath(this.selectors.verificationSuccess)),
            10000,
            'Verification success message not found'
        );
    }
}
