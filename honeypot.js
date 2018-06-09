const fs = require('fs');
const util = require('util');
const ganache = require('./ganache-core/lib/server');

const write = util.promisify(fs.writeFile);

const ganacheServer = ganache.create({
  gasLimit: 7000000,
  total_accounts: 50,
});

ganacheServer.listen('8545');

const ganacheAccounts = {
  accounts: ganacheServer.provider.manager.state.accounts,
  private_keys: Object.keys(ganacheServer.provider.manager.state.accounts).reduce(
    (keys, address) =>
      Object.assign({}, keys, {
        [address]: ganacheServer.provider.manager.state.accounts[
          address
        ].secretKey.toString('hex'),
      }),
    {},
  ),
};

write('ganache-accounts.json', JSON.stringify(ganacheAccounts));
