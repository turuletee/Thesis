Marketplace = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,
    var content = $('#content');
    content.show();

  init: function() {
    console.log("Marketplace initialized...")
    $('#content').show();
    $('#loader').hide();
    return Marketplace.initWeb3();

  }}

$(function() {
  $(window).load(function() {
    Marketplace.init();
  })
});