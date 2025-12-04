const serverless = require("serverless-http");
const { app, initConnections } = require("../server.js");
module.exports.handler = async (req, res) => {
  await initConnections();
  return serverless(app)(req, res);
};