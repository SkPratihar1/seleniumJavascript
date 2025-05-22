import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { By, until } from 'selenium-webdriver';
import { BaseTest } from '../base/BaseTest.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { PostManagement } from '../../src/pages/postManagement.js';
import { config } from '../../src/config/config.js';
import { testData } from '../../src/config/test.data.js';

describe('Post Management Tests', function() {
    this.timeout(300000); // Set timeout to 5 minutes for debugging
    let test;
    let loginPage;
    let postManagement;

    before(async function() {
        test = new BaseTest();
        await test.setUp();
        loginPage = new LoginPage(test.driver);
        postManagement = new PostManagement(test.driver);
        
        // Single login for all tests
        await test.driver.get(config.baseUrl);
        await loginPage.login(testData.validUser.username, testData.validUser.password);
        await test.driver.sleep(2000);
        
        await test.driver.get('https://sass-starter-kit.wordpress-studio.io/dashboard/me');
        await test.driver.sleep(2000);
        // Changed from clickPostMenu to navigateToPostList
        await postManagement.navigateToPostList();
    });

    it('should create post successfully', async function() {
        const title = `Test Post ${faker.string.alphanumeric(8)}`; // Shorter, unique title
        const content = faker.lorem.paragraph();
        await postManagement.createPost(title, content);
        global.createdPostTitle = title;
        
        // Wait for navigation to post list
        await test.driver.wait(
            until.elementLocated(By.css('.MuiDataGrid-root')),
            15000,
            'Post list not loaded after creation'
        );
    });

    it('should post list displayed successfully', async function() {
        // Remove refresh since we're already on the list page
        await test.driver.sleep(2000);
        await test.driver.wait(
            until.elementsLocated(By.css('.MuiDataGrid-root')),
            15000,
            'Post list grid not loaded'
        );

        // Wait for search input to be ready
        await test.driver.wait(
            until.elementLocated(By.css('[data-testid="search-role"]')),
            10000,
            'Search input not found'
        );

        const isFound = await postManagement.verifyPostInList(global.createdPostTitle);
        expect(isFound).to.be.true;
    });

    it('should edit post successfully', async function() {
        await test.driver.sleep(2000);
        
        const newTitle = `Updated Post ${faker.string.alphanumeric(8)}`; // Shorter title for edit
        await postManagement.editPost(global.createdPostTitle, newTitle);
        
        // Wait for edit to complete and verify
        await test.driver.sleep(3000);
        const isEdited = await postManagement.verifyPostInList(newTitle);
        expect(isEdited).to.be.true;
        
        global.createdPostTitle = newTitle;
        await test.driver.sleep(2000); // Additional wait before next operation
    });

    it('should delete post successfully', async function() {
        // Ensure we're on the post list page
        await test.driver.sleep(2000);
        await postManagement.navigateToPostList();
        await test.driver.sleep(2000);
        
        // Verify post exists before deletion
        const existsBeforeDelete = await postManagement.verifyPostInList(global.createdPostTitle);
        expect(existsBeforeDelete).to.be.true;
        
        await postManagement.deletePost(global.createdPostTitle);
        await test.driver.sleep(3000);
        
        // Refresh page to ensure list is updated
        await test.driver.navigate().refresh();
        await test.driver.sleep(2000);
        
        const isFound = await postManagement.verifyPostInList(global.createdPostTitle);
        expect(isFound).to.be.false;
    });

    after(async function() {
        if (test && test.driver) {
            await test.tearDown();
        }
    });
});
