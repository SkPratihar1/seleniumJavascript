import { By, until } from 'selenium-webdriver';
import { BasePage } from '../core/BasePage.js';

export class PostManagement extends BasePage {
    constructor(driver) {
        super(driver);
        this.postMenuLink = By.xpath("//span[contains(@class, 'mantine-NavLink-label') and text()='Post']");
        this.postListLink = By.xpath("//span[contains(@class, 'mantine-NavLink-label') and text()='Post List']");
        this.createPostLink = By.xpath("//span[contains(@class, 'mantine-NavLink-label') and text()='Create Post']");
        this.addButton = By.xpath("//button[.//span[text()='Add']]");
        this.titleInput = By.name('title');
        this.contentFrame = By.css('.tox-edit-area__iframe');  // Updated to use class instead of ID
        this.contentBody = By.css('#tinymce');
        this.publishButton = By.xpath("//span[contains(@class, 'mantine-Button-label') and text()='Publish']");
        this.successMessage = By.css('.Toastify__toast--success');
        this.searchInput = By.css('[data-testid="search-role"]');
        this.postTitleInList = By.css('[data-field="title"]');
        this.actionButton = By.css('button[aria-haspopup="menu"][data-variant="subtle"]');
        this.actionMenuInRow = By.css('button.mantine-Button-root[aria-haspopup="menu"]');
        this.actionButtonInGrid = By.css('.MuiDataGrid-row button[aria-haspopup="menu"]');
        this.editMenuItem = By.xpath("//div[@role='menu']//span[text()='Edit']");
        this.deleteMenuItem = By.xpath("//div[contains(@class, 'mantine-Menu-item')]//div[contains(@class, 'text-red-500')]//span[text()='Delete']");
        this.confirmDeleteButton = By.xpath("//button//span[contains(text(), 'Delete')]");
        this.gridRow = By.css('.MuiDataGrid-row');
        this.gridLoaded = By.css('.MuiDataGrid-root');
        this.postManagementUrl = 'https://sass-starter-kit.wordpress-studio.io/dashboard/post-management/list';
        this.noRowsMessage = By.css('.MuiDataGrid-overlay');
    }

    async navigateToPostList() {
        await this.driver.get(this.postManagementUrl);
        await this.driver.sleep(2000);
        await this.driver.wait(until.elementLocated(this.gridLoaded), 10000);
    }

    async createPost(title, content) {
        // Click add button
        await this.driver.wait(until.elementLocated(this.addButton), 10000);
        await this.driver.findElement(this.addButton).click();
        await this.driver.sleep(1000); // Wait for form to load
        
        // Enter title
        await this.driver.wait(until.elementLocated(this.titleInput), 10000);
        await this.driver.findElement(this.titleInput).sendKeys(title);
        await this.driver.sleep(1000); // Wait for editor to initialize
        
        // Enter content in iframe with retry
        await this.driver.wait(async () => {
            try {
                const frame = await this.driver.findElement(this.contentFrame);
                await this.driver.switchTo().frame(frame);
                await this.driver.findElement(this.contentBody).sendKeys(content);
                await this.driver.switchTo().defaultContent();
                return true;
            } catch (error) {
                await this.driver.switchTo().defaultContent();
                return false;
            }
        }, 15000, 'Editor iframe not ready');
        
        // Publish post
        await this.driver.findElement(this.publishButton).click();
        await this.driver.sleep(2000);
        
        // Navigate back to post list after creation
        await this.navigateToPostList();
    }

    async getSuccessMessage() {
        const toast = await this.driver.wait(
            until.elementLocated(this.successMessage),
            10000,
            'Success toast not found'
        );
        await this.driver.sleep(1000); // Wait for toast to be fully visible
        return await toast.getText();
    }

    async searchPost(title) {
        await this.driver.wait(until.elementLocated(this.searchInput), 10000);
        const searchBox = await this.driver.findElement(this.searchInput);
        await searchBox.clear();
        await searchBox.sendKeys(title);
        await this.driver.sleep(2000); // Wait for search results
    }

    async waitForGridAndSearch(title) {
        // Wait for grid to load
        await this.driver.wait(
            until.elementLocated(this.gridLoaded),
            15000,
            'Grid not loaded'
        );
        
        // Wait and perform search
        const searchBox = await this.driver.wait(
            until.elementLocated(this.searchInput),
            10000,
            'Search input not found'
        );
        await searchBox.clear();
        await searchBox.sendKeys(title);
        await this.driver.sleep(3000); // Wait for search results
    }

    async clickActionMenu() {
        // Wait for action button with retry
        await this.driver.wait(async () => {
            try {
                // Find all action buttons and get the first one
                const actionButtons = await this.driver.findElements(this.actionButtonInGrid);
                if (actionButtons.length > 0) {
                    // Scroll into view and force click
                    await this.driver.executeScript("arguments[0].scrollIntoView(true);", actionButtons[0]);
                    await this.driver.sleep(500);
                    await this.driver.executeScript("arguments[0].click();", actionButtons[0]);
                    
                    // Wait for menu to appear
                    await this.driver.sleep(1000);
                    const menuItems = await this.driver.findElements(this.editMenuItem);
                    return menuItems.length > 0;
                }
                return false;
            } catch (error) {
                console.log('Action button click failed:', error.message);
                return false;
            }
        }, 20000, 'Action menu not clickable or menu items not visible');
    }

    async editPost(title, newTitle) {
        await this.waitForGridAndSearch(title);
        await this.driver.sleep(2000); // Wait for search results
        
        await this.clickActionMenu();
        await this.driver.sleep(200);
        // Click edit menu item
        await this.driver.findElement(this.editMenuItem).click();
        await this.driver.sleep(200);
        // Update title
        const titleInput = await this.driver.wait(
            until.elementLocated(this.titleInput),
            5000
        );
        await titleInput.clear();
        await titleInput.sendKeys(newTitle);
        
        await this.driver.findElement(this.publishButton).click();
        await this.driver.sleep(3000);
        // Verify old title is gone
        const oldTitleGone = await this.searchAndVerifyPost(title, false);
        console.log(`Old title "${title}" removed:`, oldTitleGone);
        // Verify new title exists
        const newTitleExists = await this.searchAndVerifyPost(newTitle, true);
        console.log(`New title "${newTitle}" found:`, newTitleExists);
        if (!oldTitleGone || !newTitleExists) {
            throw new Error('Edit verification failed');
        }
    }

    async deletePost(title) {
        await this.waitForGridAndSearch(title);
        await this.driver.sleep(3000);

        await this.clickActionMenu();
        await this.driver.sleep(2000);

        // Click delete with explicit wait and scroll
        const deleteBtn = await this.driver.wait(
            until.elementLocated(this.deleteMenuItem),
            10000,
            'Delete menu item not found'
        );
        await this.driver.executeScript("arguments[0].scrollIntoView(true);", deleteBtn);
        await this.driver.sleep(1000);
        await deleteBtn.click();
        await this.driver.sleep(2000);

        // Handle confirmation dialog with explicit wait
        // const confirmBtn = await this.driver.wait(
        //     until.elementLocated(By.xpath("//span[text()='Delete']/ancestor::button")),
        //     10000,
        //     'Confirm delete button not found'
        // );
        // await this.driver.executeScript("arguments[0].scrollIntoView(true);", confirmBtn);
        // await this.driver.sleep(1000);
        // await this.driver.executeScript("arguments[0].click();", confirmBtn);
        
        // Wait for delete completion
        await this.driver.sleep(3000);
        // await this.driver.wait(
        //     until.stalenessOf(await this.driver.findElement(this.gridLoaded)),
        //     10000,
        //     'Grid not refreshed after delete'
        // );
        // Verify deletion by searching
        const isDeleted = await this.searchAndVerifyPost(title, false);
        if (!isDeleted) {
            throw new Error('Post still exists after deletion');
        }
    }

    async verifyPostInList(title) {
        await this.searchPost(title);
        const posts = await this.driver.findElements(this.postTitleInList);
        for (const post of posts) {
            const text = await post.getText();
            if (text === title) return true;
        }
        return false;
    }

    async verifyNoRows() {
        await this.driver.sleep(2000);
        const noRowsElement = await this.driver.wait(
            until.elementLocated(this.noRowsMessage),
            10000,
            'No rows message not found'
        );
        const text = await noRowsElement.getText();
        console.log('Grid message:', text);
        return text.includes('No rows');
    }

    async searchAndVerifyPost(title, shouldExist = true) {
        await this.searchPost(title);
        await this.driver.sleep(2000);
        
        if (shouldExist) {
            const exists = await this.verifyPostInList(title);
            console.log(`Post "${title}" found: ${exists}`);
            return exists;
        } else {
            const noRows = await this.verifyNoRows();
            console.log(`No rows found for "${title}": ${noRows}`);
            return noRows;
        }
    }
}
