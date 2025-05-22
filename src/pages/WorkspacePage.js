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
        this.noRowsMessage = By.css('.MuiDataGrid-overlay');
        this.workspaceNameInList = By.css('.MuiDataGrid-row .MuiDataGrid-cell[data-field="name"]');
    }

    async createWorkspace(name) {
        await this.driver.wait(
            until.elementLocated(this.addWorkspaceButton),
            10000,
            'Add Workspace button not found'
        );
        await this.click(this.addWorkspaceButton);
        await this.driver.sleep(2000);

        const nameInput = await this.driver.wait(
            until.elementLocated(this.workspaceNameInput),
            10000,
            'Workspace name input not found'
        );
        await nameInput.clear();
        await nameInput.sendKeys(name);
        await this.driver.sleep(1000);
        
        await this.driver.findElement(this.createButton).click();
        await this.waitForSuccessMessage('Workspace created successfully');
    }

    async waitForSuccessMessage(expectedText, timeout = 15000) {
        return await this.driver.wait(
            async () => {
                try {
                    const message = await this.getSuccessMessage();
                    return message.includes(expectedText);
                } catch (error) {
                    return false;
                }
            },
            timeout,
            `Success message "${expectedText}" not found`
        );
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

    async verifyNoRows(maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.driver.sleep(2000);
                const noRowsElement = await this.driver.wait(
                    until.elementLocated(this.noRowsMessage),
                    5000
                );
                const text = await noRowsElement.getText();
                console.log(`Attempt ${i + 1} - Grid message:`, text);
                if (text.includes('No rows')) {
                    return true;
                }
            } catch (error) {
                console.log(`Attempt ${i + 1} failed:`, error.message);
                if (i === maxRetries - 1) throw error;
                await this.driver.navigate().refresh();
                await this.driver.sleep(2000);
            }
        }
        return false;
    }

    async searchAndVerifyWorkspace(name, shouldExist = true) {
        await this.searchWorkspace(name);
        await this.driver.sleep(2000);
        
        if (shouldExist) {
            const workspaces = await this.driver.findElements(this.workspaceNameInList);
            for (const workspace of workspaces) {
                const text = await workspace.getText();
                if (text === name) {
                    console.log(`Workspace "${name}" found`);
                    return true;
                }
            }
            return false;
        } else {
            const noRows = await this.verifyNoRows();
            console.log(`No rows found for "${name}": ${noRows}`);
            return noRows;
        }
    }

    async editWorkspace(index, newName) {
        await this.driver.sleep(2000);
        
        // Get fresh list of action buttons with retry
        const actionButtons = await this.driver.wait(
            until.elementsLocated(this.actionMenuButton),
            15000,
            'Action buttons not found'
        );
        
        if (!actionButtons[index]) {
            throw new Error(`No action button found at index ${index}`);
        }

        // Click action menu with retry
        await this.driver.wait(async () => {
            try {
                await this.driver.executeScript("arguments[0].scrollIntoView(true);", actionButtons[index]);
                await this.driver.sleep(1000);
                await actionButtons[index].click();
                return true;
            } catch (e) {
                return false;
            }
        }, 10000, 'Failed to click action menu');

        // Click edit and update name
        await this.driver.findElement(this.editMenuItem).click();
        await this.driver.sleep(1000);

        const nameInput = await this.driver.findElement(this.workspaceNameInput);
        await nameInput.clear();
        await nameInput.sendKeys(newName);
        
        // Click update and wait for success
        await this.driver.findElement(this.editButton).click();
        
        // Wait for success message
        const successMessage = await this.getSuccessMessage();
        console.log('Update success message:', successMessage);
        
        // Verify update
        await this.searchWorkspace(newName);
        await this.driver.sleep(2000);
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

    async verifyWorkspaceDeletion(name) {
        // First verify through search
        await this.searchWorkspace(name);
        await this.driver.sleep(2000);

        // Check for no rows message
        const hasNoRows = await this.verifyNoRows();
        console.log(`Checking if "${name}" is deleted - No rows found:`, hasNoRows);

        // Double check by refreshing
        await this.driver.navigate().refresh();
        await this.driver.sleep(2000);
        
        // Search again after refresh
        await this.searchWorkspace(name);
        await this.driver.sleep(2000);
        
        // Final verification
        const isDeleted = await this.verifyNoRows();
        console.log(`Final deletion verification for "${name}":`, isDeleted);
        
        return hasNoRows && isDeleted;
    }

    async deleteWorkspace(index) {
        await this.driver.sleep(2000);

        // Get all workspace rows first
        const rows = await this.driver.wait(
            until.elementsLocated(By.css('.MuiDataGrid-row')),
            10000,
            'No workspace rows found'
        );

        if (!rows[index]) {
            throw new Error(`No workspace row found at index ${index}`);
        }

        // Get workspace name from the specific row
        const nameCell = await rows[index].findElement(By.css('[data-field="name"]'));
        const targetWorkspaceName = await nameCell.getText();
        console.log(`Found workspace to delete: "${targetWorkspaceName}"`);

        // Find and click action button in the same row
        const actionButton = await rows[index].findElement(this.actionMenuButton);
        await this.driver.executeScript("arguments[0].scrollIntoView(true);", actionButton);
        await actionButton.click();
        await this.driver.sleep(1000);

        // Delete workflow
        await this.driver.findElement(this.deleteMenuItem).click();
        await this.driver.sleep(1000);
        await this.driver.findElement(this.confirmDeleteButton).click();
        await this.driver.sleep(2000);

        // Verify deletion
        const isDeleted = await this.searchAndVerifyWorkspace(targetWorkspaceName, false);
        if (!isDeleted) {
            throw new Error(`Workspace "${targetWorkspaceName}" still exists after deletion`);
        }
        console.log(`Successfully deleted workspace: "${targetWorkspaceName}"`);
    }

    async searchWorkspace(name) {
        await this.driver.wait(until.elementLocated(this.searchInput), 10000);
        const searchBox = await this.driver.findElement(this.searchInput);
        await searchBox.clear();
        await searchBox.sendKeys(name);
        await this.driver.sleep(1000); // Wait for search results
    }
}
