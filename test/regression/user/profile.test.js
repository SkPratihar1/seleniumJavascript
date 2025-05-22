import { describe, beforeEach, it } from 'mocha';
import { By, until } from 'selenium-webdriver';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../../../src/pages/LoginPage.js';
import { config } from '../../../src/config/config.js';

export default async function(driver) {
    describe('User Profile Tests', function() {
        beforeEach(async function() {
            const loginPage = new LoginPage(driver);
            await driver.get(config.baseUrl);
            await loginPage.login(process.env.USERNAME, process.env.PASSWORD);
        });

        it('should update user profile details', async function() {
            // Click avatar icon
            await driver.findElement(By.css('[data-avatar-placeholder-icon="true"]')).click();
            
            // Click Profile menu item
            await driver.findElement(By.css('.mantine-Menu-itemLabel')).click();
            
            // Click Update Profile button
            await driver.findElement(By.xpath("//span[contains(@class, 'mantine-Button-label') and text()='Update Profile']")).click();
            
            // Clear name field and enter new name
            const nameInput = await driver.findElement(By.css('[data-testid="name"]'));
            await nameInput.clear();
            const newName = faker.person.fullName();
            await nameInput.sendKeys(newName);
            
            // Click Save button
            await driver.findElement(By.xpath("//span[contains(@class, 'mantine-Button-label') and text()='Save']")).click();
            
            // Verify update success
            await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
        });

        it('should update user preferences', async function() {
            await driver.findElement(By.css('[data-testid="user-preferences"]')).click();
            // Add preferences update implementation
        });
    });
}
