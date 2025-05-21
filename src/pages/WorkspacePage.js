import { By, until } from 'selenium-webdriver';
import { BasePage } from '../core/BasePage.js';

export class WorkspacePage extends BasePage {
    constructor(driver) {
        super(driver);
        // Update selectors for better reliability
        this.workspaceMenuLink = By.xpath("//a[.//span[contains(@class, 'mantine-NavLink-label') and normalize-space()='Workspace']]");
        this.addWorkspaceButton = By.xpath("//span[text()='Add Workspace']");
        this.workspaceNameInput = By.name('name');
        this.createButton = By.xpath("//span[contains(@class, 'm_811560b9') and contains(@class, 'mantine-Button-label') and text()='Create']");
        this.successMessage = By.css('.Toastify__toast--success');
        this.actionMenuButton = By.css('[data-testid="expose-button"]');
        this.editMenuItem = By.xpath("//div[contains(@class, 'mantine-Menu-item')]//span[text()='Edit']");
        this.deleteMenuItem = By.xpath("//div[contains(@class, 'mantine-Menu-item')]//span[text()='Delete']");
        this.confirmDeleteButton = By.xpath("//button//span[contains(@class, 'mantine-Button-label') and text()='Delete']");
        this.editButton = By.xpath("//button//span[contains(@class, 'mantine-Button-label') and text()='Update']");
        this.searchInput = By.css('[data-testid="search-role"]');
    }

    async createWorkspace(name) {
        await this.click(this.addWorkspaceButton);
        await this.driver.findElement(this.workspaceNameInput).sendKeys(name);
        await this.driver.sleep(2000); // Wait for the input to be filled
        
        const createButton = await this.driver.wait(
            until.elementLocated(this.createButton),
            10000,
            'Create button not found'
        );
        await createButton.click();
        await this.driver.wait(until.elementLocated(this.successMessage), 5000);
    }

    async getSuccessMessage() {
        const toast = await this.driver.wait(
            until.elementLocated(this.successMessage),
            10000,
            'Success toast not found'
        );
        await this.driver.wait(
            until.elementIsVisible(toast),
            5000,
            'Success toast not visible'
        );
        await this.driver.sleep(500); // Wait for toast animation
        return (await toast.getText()).trim();
    }

    async editWorkspace(index, newName) {
        await this.driver.sleep(2000); // Wait for page to stabilize
        
        // Get fresh list of action buttons
        await this.driver.wait(
            async () => {
                const buttons = await this.driver.findElements(this.actionMenuButton);
                return buttons.length > index;
            },
            10000,
            'Action buttons not found or index out of range'
        );
        
        const actionButtons = await this.driver.findElements(this.actionMenuButton);
        await this.driver.executeScript("arguments[0].scrollIntoView(true);", actionButtons[index]);
        await actionButtons[index].click();
        
        // Wait for menu items and click edit
        await this.driver.wait(until.elementLocated(this.editMenuItem), 10000);
        await this.driver.findElement(this.editMenuItem).click();
        
        // Update name with retries
        await this.driver.wait(async () => {
            try {
                const nameInput = await this.driver.findElement(this.workspaceNameInput);
                await nameInput.clear();
                await nameInput.sendKeys(newName);
                return true;
            } catch (e) {
                if (e.name === 'StaleElementReferenceError') return false;
                throw e;
            }
        }, 10000, 'Failed to update workspace name');

        // Click update with retry
        await this.driver.wait(async () => {
            try {
                const updateButton = await this.driver.findElement(this.editButton);
                await updateButton.click();
                return true;
            } catch (e) {
                if (e.name === 'StaleElementReferenceError') return false;
                throw e;
            }
        }, 10000, 'Failed to click update button');
    }

    async clickWorkspaceMenu() {
        await this.driver.sleep(2000); // Wait for page stability
        
        // Retry mechanism for clicking workspace menu
        await this.driver.wait(async () => {
            try {
                // Wait for menu to be present and visible
                const menu = await this.driver.wait(
                    until.elementLocated(this.workspaceMenuLink),
                    5000,
                    'Workspace menu not found'
                );
                
                await this.driver.wait(
                    until.elementIsVisible(menu),
                    5000,
                    'Workspace menu not visible'
                );

                // Scroll menu into view and click
                await this.driver.executeScript("arguments[0].scrollIntoView(true);", menu);
                await this.driver.sleep(500);
                await menu.click();
                
                // Verify navigation success
                return await this.driver.wait(
                    until.elementLocated(this.addWorkspaceButton),
                    5000
                ).then(() => true, () => false);
            } catch (error) {
                if (error.name === 'StaleElementReferenceError') {
                    return false;
                }
                throw error;
            }
        }, 15000, 'Failed to click workspace menu after multiple attempts');
    }

    async deleteWorkspace(index) {
        // Get action buttons and wait for them to be present
        const actionButtons = await this.driver.wait(
            until.elementsLocated(this.actionMenuButton),
            10000,
            'Action menu buttons not found'
        );
        
        // Ensure we have buttons and index is valid
        if (!actionButtons || actionButtons.length <= index) {
            throw new Error(`No action button found at index ${index}`);
        }
        
        // Click the action menu
        await actionButtons[index].click();
        await this.driver.sleep(1000);

        // Rest of delete workflow
        await this.driver.wait(until.elementLocated(this.deleteMenuItem), 10000);
        await this.driver.findElement(this.deleteMenuItem).click();
        
        await this.driver.wait(until.elementLocated(this.confirmDeleteButton), 10000);
        await this.driver.findElement(this.confirmDeleteButton).click();
    }

    async searchWorkspace(name) {
        await this.driver.wait(until.elementLocated(this.searchInput), 10000);
        const searchBox = await this.driver.findElement(this.searchInput);
        await searchBox.clear();
        await searchBox.sendKeys(name);
        await this.driver.sleep(1000); // Wait for search results
    }
}
