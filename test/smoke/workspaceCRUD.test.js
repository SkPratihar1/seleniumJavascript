import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { faker } from '@faker-js/faker';
import { BaseTest } from '../base/BaseTest.js';
import { LoginPage } from '../../src/pages/LoginPage.js';
import { WorkspacePage } from '../../src/pages/WorkspacePage.js';
import { config } from '../../src/config/config.js';
import { testData } from '../../src/config/test.data.js';
import { By, until } from 'selenium-webdriver';

describe('Workspace Management Tests', function() {
    let test;
    let loginPage;
    let workspacePage;
    let createdWorkspaceName;

    before(async function() {
        test = new BaseTest();
        await test.setUp();
        loginPage = new LoginPage(test.driver);
        workspacePage = new WorkspacePage(test.driver);
        
        // Single login for all tests
        await test.driver.get(config.baseUrl);
        await loginPage.login(testData.validUser.username, testData.validUser.password);
        await test.driver.sleep(2000);
        
        await test.driver.get('https://sass-starter-kit.wordpress-studio.io/dashboard/me');
        await test.driver.sleep(2000);
        await workspacePage.clickWorkspaceMenu();
    });

    it('1. should create workspace successfully', async function() {
        createdWorkspaceName = `Test Workspace ${faker.string.alphanumeric(6)}`;
        await workspacePage.createWorkspace(createdWorkspaceName);
        await workspacePage.searchAndVerifyWorkspace(createdWorkspaceName, true);
    });

    it('2. should edit workspace successfully', async function() {
        await workspacePage.searchWorkspace(createdWorkspaceName);
        await test.driver.sleep(2000);
        
        const newWorkspaceName = `Updated Workspace ${faker.string.alphanumeric(6)}`;
        await workspacePage.editWorkspace(0, newWorkspaceName);
        
        // Verify update
        const isUpdated = await workspacePage.searchAndVerifyWorkspace(newWorkspaceName, true);
        expect(isUpdated).to.be.true;
        createdWorkspaceName = newWorkspaceName;
    });

    it('3. should delete workspace successfully', async function() {
        await workspacePage.searchWorkspace(createdWorkspaceName);
        await test.driver.sleep(2000);
        
        console.log(`Attempting to delete workspace: "${createdWorkspaceName}"`);
        await workspacePage.deleteWorkspace(0);
        
        // Final verification
        const isDeleted = await workspacePage.searchAndVerifyWorkspace(createdWorkspaceName, false);
        expect(isDeleted).to.be.true;
    });

    after(async function() {
        if (test && test.driver) {
            await test.tearDown();
        }
    });
});
