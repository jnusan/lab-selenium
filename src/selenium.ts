const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

export class SeleniumService {
  public driver;
  public By;
  public until;

  public async initializeDriver() {
    try {
      const screen = {
        width: 2880,
        height: 1800,
      };
      const firefoxOptions = new firefox.Options();
      firefoxOptions.setAcceptInsecureCerts(true);
      if (!!Number(process.env.HEADLESS)) {
        firefoxOptions.headless().windowSize(screen);
      }
      firefoxOptions
        .setPreference('security.mixed_content.block_active_content', false)
        .setPreference('security.mixed_content.block_display_content', true)
        .setPreference('javascript.enabled', true)
        .setPreference('useAutomationExtension', false)
        .setPreference('webgl.disabled', false)
        .setPreference('browser.cache.disk.enable', false)
        .setPreference('browser.cache.memory.enable', false)
        .setPreference('browser.cache.offline.enable', false)
        .setPreference('network.http.use-cache', false)
        .setPreference('extensions.firebug.onByDefault', false);

      this.driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(firefoxOptions)
        .build();
      return this.driver;
    } catch (error) {
      throw error;
    }
  }

}
