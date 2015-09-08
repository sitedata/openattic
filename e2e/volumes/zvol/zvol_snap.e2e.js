var helpers = require('../../common.js');


describe('Zvol tests', function(){

  var volumesItem = element.all(by.css('ul .tc_menuitem')).get(3);
  var volumePoolSelect = element(by.model('data.sourcePool'));
  var addBtn = element(by.css('.tc_add_btn'));
  var volumename = 'protractor_test_zvol';
  var volume = element.all(by.cssContainingText('tr', volumename)).get(0);
  var snapshotname = 'protractor_test_snap';
  var snapshot = element(by.cssContainingText('tr', snapshotname));
  var clonename ="protractor_test_clone";
  var clone = element(by.cssContainingText('tr', clonename));
  var snapMenuBtn = element.all(by.css('.tc_menudropdown')).get(1);

  beforeAll(function(){
    helpers.login();
  });

  beforeEach(function(){
    volumesItem.click();
  });

  it('should have a zpool', function(){
    element(by.css('oadatatable .tc_add_btn')).click();
    for(var key in helpers.configs.pools) {
      volumePoolSelect.click();
      var zpool = element.all(by.cssContainingText('option', 'zpool')).get(0);
      expect(zpool.isDisplayed()).toBe(true);

      break;
    }
  });

  it('should create a zvol', function(){
    element(by.css('oadatatable .tc_add_btn')).click();
    for(var key in helpers.configs.pools) {
      element(by.id('volume.name')).sendKeys(volumename);
      volumePoolSelect.click();
      element.all(by.cssContainingText('option', 'zpool')).get(0).click();
      element(by.id('zfs')).click();
      element(by.model('data.megs')).sendKeys('100MB');
      element(by.css('.tc_submitButton')).click();
      browser.sleep(helpers.configs.sleep);

      break;
     }
  });

  it('should display the zvol in volumeslist', function(){
    expect(volume.isDisplayed()).toBe(true);
  });

  it('should create a snapshot of the zvol', function(){
    expect(volume.isDisplayed()).toBe(true);
    volume.click();
    browser.sleep(400);
    element(by.css('.tc_snapshotTab')).click();
    browser.sleep(400);
    element(by.css('.tc_snapshotAdd')).click();
    browser.sleep(400);
    element(by.id('snap.name')).clear();
    browser.sleep(400);
    element(by.model('snap.name')).sendKeys(snapshotname);
    browser.sleep(400);
    element(by.css('.tc_submitButton')).click();
  });

  it('should display the zvol snapshot', function(){
    volume.click();
    browser.sleep(400);
    element(by.css('.tc_snapshotTab')).click();

    expect(snapshot.isPresent()).toBe(true);
  });

  it('should delete the zvol snapshot', function(){
      volume.click();
      browser.sleep(400);
      element(by.css('.tc_snapshotTab')).click();
      browser.sleep(400);
      expect(snapshot.isPresent()).toBe(true);
      snapshot.click();
      browser.sleep(400);
      element(by.css('.tc_deleteSnapItem')).click();
      browser.sleep(400);
      element(by.id('bot2-Msg1')).click();
      browser.sleep(400);
  });

  it('should delete the zvol', function(){
    volume.click();
    browser.sleep(400);
    element(by.css('.tc_menudropdown')).click();
    browser.sleep(400);
    element(by.css('.tc_deleteItem')).click();
    browser.sleep(400);
    element(by.model('input.enteredName')).sendKeys(volumename);
    element(by.id('bot2-Msg1')).click();

    expect(element(by.cssContainingText('tr', volumename)).isPresent()).toBe(false);
  });

});