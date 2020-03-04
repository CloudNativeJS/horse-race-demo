const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const url = process.env.DB_URL;

module.exports = {
    "CloudantDS": {
        "url": `https://${username}:${password}@${url}`,
        "database": "horserace",
        "username": `${username}`,
        "password": `${password}`,
        "name": "CloudantDS",
        "modelIndex": "",
        "connector": "cloudant"
      }
};