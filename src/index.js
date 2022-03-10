const startWeb = require('./web');

module.exports = async () => {
    await startWeb();
    console.log('Web Server Active');
};