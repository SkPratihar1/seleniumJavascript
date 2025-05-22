import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

export class EnvManager {
    static async updateCredentials(type, email, password) {
        try {
            const envPath = path.resolve(process.cwd(), '.env');
            let content = await fs.readFile(envPath, 'utf8');

            switch(type) {
                case 'signup':
                    if (!this.isValidEmail(email)) {
                        throw new Error('Invalid email format');
                    }
                    content = content.replace(/LoginEmail ?=.*\n/, `LoginEmail="${email}"\n`);
                    content = content.replace(/LoginPassword ?=.*\n/, `LoginPassword="${password}"\n`);
                    break;
                case 'forgot':
                    // Only update LoginPassword, preserve original PASSWORD
                    content = content.replace(/LoginPassword ?=.*\n/, `LoginPassword="${password}"\n`);
                    break;
            }

            await fs.writeFile(envPath, content, 'utf8');
            dotenv.config(); // Reload env vars
            console.log(`Credentials updated for ${type}`);
        } catch (error) {
            console.error('Failed to update credentials:', error);
            throw error;
        }
    }

    static getLoginCredentials() {
        return {
            email: process.env.LoginEmail || process.env.USERNAME,
            password: process.env.LoginPassword || process.env.PASSWORD
        };
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static async backupEnv() {
        const envPath = path.resolve(process.cwd(), '.env');
        const backupPath = path.resolve(process.cwd(), '.env.backup');
        await fs.copyFile(envPath, backupPath);
    }

    static async restoreEnv() {
        const envPath = path.resolve(process.cwd(), '.env');
        const backupPath = path.resolve(process.cwd(), '.env.backup');
        await fs.copyFile(backupPath, envPath);
        dotenv.config();
    }
}
