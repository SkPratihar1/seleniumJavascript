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
        createdWorkspaceName = faker.company.name();
        await workspacePage.createWorkspace(createdWorkspaceName);
        const message = await workspacePage.getSuccessMessage();
        expect(message).to.include('Workspace created successfully');
    });

    it('2. should edit workspace successfully', async function() {
        await test.driver.sleep(2000);
        await workspacePage.clickWorkspaceMenu();
        
        // Search for created workspace
        await workspacePage.searchWorkspace(createdWorkspaceName);
        
        const newWorkspaceName = faker.company.name();
        await workspacePage.editWorkspace(0, newWorkspaceName);
        createdWorkspaceName = newWorkspaceName; // Update name for delete test
        
        // Wait and retry for success message
        await test.driver.wait(
            async () => {
                try {
                    const message = await workspacePage.getSuccessMessage();
                    return message.includes('Workspace updated successfully');
                } catch (error) {
                    return false;
                }
            },
            15000,
            'Workspace update success message not found'
        );
    });

    it('3. should delete workspace successfully', async function() {
        await test.driver.sleep(2000);
        await workspacePage.clickWorkspaceMenu();
        
        // Search for edited workspace
        await workspacePage.searchWorkspace(createdWorkspaceName);
        
        await workspacePage.deleteWorkspace(0);
        
        // Wait and retry for success message
        await test.driver.wait(
            async () => {
                try {
                    const message = await workspacePage.getSuccessMessage();
                    return message.includes('Workspace deleted successfully');
                } catch (error) {
                    return false;
                }
            },
            15000,
            'Workspace delete success message not found'
        );
    });

    after(async function() {
        if (test && test.driver) {
            await test.tearDown();
        }
    });
});
