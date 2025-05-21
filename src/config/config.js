import dotenv from 'dotenv';
dotenv.config();

export const config = {
    browser: process.env.BROWSER || 'chrome',
    baseUrl: process.env.BASE_URL || 'https://sass-starter-kit.wordpress-studio.io',
    timeout: {
        implicit: 5000,
        pageLoad: 10000,
        script: 10000
    },
    viewports: {
        desktop: { width: 1920, height: 1080 },
        mobile: { width: 375, height: 812 }
    }
};
