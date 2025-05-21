export const testData = {
    validUser: {
        username: process.env.USERNAME || 'pratihar+sas@itobuz.com',
        password: process.env.PASSWORD || 'Itobuz#1234'
    },
    invalidUser: {
        username: 'invalid',
        password: 'invalid'
    }
};
