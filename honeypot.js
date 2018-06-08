const ganache = require('./ganache-core/lib/server');

const ganacheServer = ganache.create({
  gasLimit: 7000000,
});

ganacheServer.listen('8545');
