import fs from 'fs/promises';
import path from 'path';

export async function updatePassword(newPassword) {
    const envPath = path.join(process.cwd(), '.env');
    try {
        let content = await fs.readFile(envPath, 'utf8');
        content = content.replace(
            /PASSWORD=["'].*["']/,
            `PASSWORD="${newPassword}"`
        );
        await fs.writeFile(envPath, content, 'utf8');
        console.log('Password updated in .env file');
    } catch (error) {
        console.error('Failed to update .env file:', error);
    }
}
