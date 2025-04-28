const Auth = artifacts.require("Auth");

module.exports = function (deployer) {
  deployer.deploy(Auth, { gas: 5000000 }); // Increase gas if needed
};
