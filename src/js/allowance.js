Allowance = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("Allowance initialized...")
    return Allowance.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      Allowance.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      Allowance.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(Allowance.web3Provider);
    }
    console.log("CurrentProvider:", web3.currentProvider);
    return Allowance.initContracts();
  },
  initContracts: function() {
    $.getJSON("UniTokenSale.json", function(uniTokenSale) {
      Allowance.contracts.UniTokenSale = TruffleContract(uniTokenSale);
      Allowance.contracts.UniTokenSale.setProvider(Allowance.web3Provider);
      Allowance.contracts.UniTokenSale.deployed().then(function(uniTokenSale) {
        console.log("Uni Token Sale Address:", uniTokenSale.address);
      });
    }).done(function() {
      $.getJSON("UniToken.json", function(uniToken) {
        Allowance.contracts.UniToken = TruffleContract(uniToken);
        Allowance.contracts.UniToken.setProvider(Allowance.web3Provider);
        Allowance.contracts.UniToken.deployed().then(function(uniToken) {
          console.log("Uni Token Address:", uniToken.address);
        });

        Allowance.listenForEvents();
        return Allowance.render();
      });
    })
  },
  // Listen for events emitted from the contract
  listenForEvents: function() {
    Allowance.contracts.UniTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        Allowance.render();
      })
    })
  },
  render: function() {
    if (Allowance.loading) {
      return;
    }
    Allowance.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getAccounts(function(err, account) {
      if(err === null) {
        Allowance.account = account;
        $('#account-address').html("Your Account: " + account);
      }
    })
  }

allowTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#ammount').val();
    Allowance.contracts.UniToke.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: Allowance.account,
        value: numberOfTokens * Allowance.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }


}

$(function() {
  $(window).load(function() {
    Allowance.init();
  })
});