import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { By, until } from 'selenium-webdriver';
import { SeleniumService } from './selenium';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private provinces = [];
  private cantons = [];
  private districts = [];
  private readonly URL = 'https://www.bnventadebienes.com/';
  private readonly URL_TEST = `https://www.bnventadebienes.com/Home/HomeFilter?__RequestVerificationToken=EsS-8FNelVU-uYGOSkTtUOu-VZIsLJVJ__KUKmRNGqh0BAjoXPeH2aec5Ql0_BjdyRsQFeGLxLxfzkwo0FrlU4Myjk4uQcImf39B56htP-o1&ProvinceId=1&CantonId=19&DistrictId=105&PropertyTypeId=&MinPrice=&MaxPrice=&ExdebtorCode=&MinSize=&MaxSize=&PropertySaleTypeId=&PropertyStatusId=&MustBeForDevelopers=false&MustBeNegotiable=false&MustBeDiscounted=false&MustBeHighlighted=false&MustBeNovelty=false&MustBeInTheCoast=false`
  private currentIndexProvince = 0;
  private currentIndexCanton = 0;
  private currentIndexDistrict = 0;
  private finalData = {};
  private maxPrice = 0;
  private minPrice = 0;

  constructor(private selenium: SeleniumService) { }

  private selectors = {
    sltProvince: '//select[@id="ProvinceId"]',
    sltCanton: '//select[@id="CantonId"]',
    sltDistrict: '//select[@id="DistrictId"]',
    btnGoFilter: '//div[@id="btn-search-by-address-1"]/button[@type="submit"]',
    btnSearch: '//button[@type="submit"]',
    pathData: '.properties-list',
    minPrice: '//input[@name="MinPrice"]',
    maxPrice: '//input[@name="MaxPrice"]'
  }
  private validationSearch = 'Lo sentimos, pero no hay propiedades';

  protected setupRecipe = ['setupSelenium'];
  protected shopRecipe = [
    'goTo',
    'goToFilter',
    'getProvinces',
    'searchProvinceProcess'
  ];

  protected searchProvinceProcessRecipe = [
    'setProvince',
    'getCantons',
    'searchDistrictProcess'
  ];

  protected searchDistrictProcessRecipe = [
    'setCanton',
    'getDistricts',
    'search'
  ];

  protected searchProcessRecipe = [
    'setDistrict',
    'setPrice',
    'getInfo',
  ];

  protected testRecipe = [
    'setupSelenium',
    'goToTest',
    'getProperties'
  ]

  public async initProcess(price) {
    try {
      this.maxPrice = price;
      await this.setupTargetIterator();
      for (const theFunction of this.shopRecipe) {
        Logger.log(`initProcess:: Executing ${theFunction}`)
        await this[theFunction]();
      }
    } catch (error) {
      Logger.error(`Error on initProcess:: ${error}`, 'ERROR');
    }
  }

  protected async setupTargetIterator() {
    try {
      for (const theFunction of this.setupRecipe) {
        Logger.log(`setupTargetIterator:: Executing ${theFunction}`)
        await this[theFunction]();
      }
    } catch (error) {
      Logger.error(`Error on setupTargetIterator:: ${error}`, 'ERROR');
    }
  }

  public async setupTest(price) {
    try {
      this.maxPrice = price;
      for (const theFunction of this.testRecipe) {
        Logger.log(`setupTest:: Executing ${theFunction}`)
        await this[theFunction]();
      }
    } catch (error) {
      Logger.error(`Error on setupTest:: ${error}`, 'ERROR');
    }
  }

  protected async goToTest(): Promise<any> {
    try {
      await this.selenium.driver.get(this.URL_TEST);
      return true;
    } catch (error) {
      Logger.error(`Error on goToTest:: ${error}`, 'ERROR');
    }
  }

  protected async setupSelenium(): Promise<any> {
    try {
      await this.selenium.initializeDriver();
      return true;
    } catch (error) {
      Logger.error(`Error on setupSelenium:: ${error}`, 'ERROR');
    }
  }

  protected async goTo(): Promise<any> {
    try {
      await this.selenium.driver.get(this.URL);
      await this.selenium.driver.wait(
        until.elementLocated(
          By.xpath(this.selectors.sltProvince)
        ),
        20000
      );
      return true;
    } catch (error) {
      Logger.error(`Error on goTo:: ${error}`, 'ERROR');
    }
  }

  protected async goToFilter(): Promise<any> {
    try {
      await this.selenium.driver.findElement(By.xpath(this.selectors.btnGoFilter)).click()
      return true;
    } catch (error) {
      Logger.error(`Error on goToFilter:: ${error}`, 'ERROR');
    }
  }

  protected async getProvinces(): Promise<any> {
    try {
      const tempProvinces = await this.selenium.driver.findElements(By.xpath(`${this.selectors.sltProvince}/option`));
      for (const tempProvince of tempProvinces) {
        const name = await tempProvince.getText();
        if (name !== 'Provincia') {
          const rawProvince = {
            value: await tempProvince.getAttribute('value'),
            name,
            selector: `${this.selectors.sltProvince}/option[@value="${await tempProvince.getAttribute('value')}"]`
          }
          this.provinces.push(rawProvince);
        }
      }
      Logger.log('this.provinces', 'INFO');
      Logger.log(JSON.stringify(this.provinces), 'INFO');
      return true;
    } catch (error) {
      Logger.error(`Error on getProvinces:: ${error}`, 'ERROR');
    }
  }

  protected async setProvince(): Promise<any> {
    try {
      const currentProvince = this.provinces[this.currentIndexProvince];
      await this.openSlt(this.selectors.sltProvince);
      // await this.sleep();
      await this.selenium.driver.findElement(By.xpath(currentProvince.selector)).click();
      await this.sleep();
      this.cantons = [];
      this.currentIndexCanton = 0;
      Logger.log('currentProvince', 'INFO');
      Logger.log(JSON.stringify(currentProvince), 'INFO');
      // this.currentIndexProvince++;
      return true;
    } catch (error) {
      Logger.error(`Error on getProvinces:: ${error}`, 'ERROR');
    }
  }

  protected async searchProvinceProcess(): Promise<any> {
    try {
      while (this.provinces[this.currentIndexProvince]) {
        for (const theFunction of this.searchProvinceProcessRecipe) {
          Logger.log(`searchProvinceProcess:: Executing ${theFunction}`)
          await this[theFunction]();
          await this.sleep();
        }
        this.currentIndexProvince++;
      }
    } catch (error) {
      Logger.error(`Error on searchProcess:: ${error}`, 'ERROR');
    }
  }

  protected async getCantons(): Promise<any> {
    try {
      const tempCantons = await this.selenium.driver.findElements(By.xpath(`${this.selectors.sltCanton}/option`));
      for (const tempCanton of tempCantons) {
        const name = await tempCanton.getText();
        if (name !== 'Cantón') {
          const rawCanton = {
            value: await tempCanton.getAttribute('value'),
            name,
            selector: `${this.selectors.sltCanton}/option[@value="${await tempCanton.getAttribute('value')}"]`
          }
          this.cantons.push(rawCanton);
        }
      }
      Logger.log('this.cantons', 'INFO');
      Logger.log(JSON.stringify(this.cantons), 'INFO');
      return true;
    } catch (error) {
      Logger.error(`Error on getCantons:: ${error}`, 'ERROR');
    }
  }

  protected async setCanton(): Promise<any> {
    try {
      const currentCanton = this.cantons[this.currentIndexCanton];
      await this.openSlt(this.selectors.sltCanton);
      // await this.sleep();
      await this.selenium.driver.findElement(By.xpath(currentCanton.selector)).click();
      await this.sleep();
      this.districts = [];
      this.currentIndexDistrict = 0;
      Logger.log('currentCanton', 'INFO');
      Logger.log(JSON.stringify(currentCanton), 'INFO');
      return true;
    } catch (error) {
      Logger.error(`Error on getProvinces:: ${error}`, 'ERROR');
    }
  }

  protected async searchDistrictProcess(): Promise<any> {
    try {
      while (this.cantons[this.currentIndexCanton]) {
        for (const theFunction of this.searchDistrictProcessRecipe) {
          Logger.log(`searchDistrictProcess:: Executing ${theFunction}`);
          await this[theFunction]();
          await this.sleep();
        }
        this.currentIndexCanton++;
      }
    } catch (error) {
      Logger.error(`Error on searchDistrictProcess:: ${error}`, 'ERROR');
    }
  }

  protected async getDistricts(): Promise<any> {
    try {
      const tempDistricts = await this.selenium.driver.findElements(By.xpath(`${this.selectors.sltDistrict}/option`));
      for (const tempDistrict of tempDistricts) {
        const name = await tempDistrict.getText();
        if (name !== 'Distrito') {
          const rawDistrict = {
            value: await tempDistrict.getAttribute('value'),
            name,
            selector: `${this.selectors.sltDistrict}/option[@value="${await tempDistrict.getAttribute('value')}"]`
          }
          this.districts.push(rawDistrict);
        }
      }
      Logger.log('this.districts', 'INFO');
      Logger.log(JSON.stringify(this.districts), 'INFO');
      return true;
    } catch (error) {
      Logger.error(`Error on getDistricts:: ${error}`, 'ERROR');
    }
  }

  protected async setDistrict(): Promise<any> {
    try {
      const currentDistrict = this.districts[this.currentIndexDistrict];
      await this.openSlt(this.selectors.sltDistrict);
      await this.selenium.driver.findElement(By.xpath(currentDistrict.selector)).click();
      await this.sleep();
      Logger.log('currentDistrict', 'INFO');
      Logger.log(JSON.stringify(currentDistrict), 'INFO');
      // this.currentIndexDistrict++;
      return true;
    } catch (error) {
      Logger.error(`Error on getProvinces:: ${error}`, 'ERROR');
    }
  }

  protected async search(): Promise<any> {
    try {
      while (this.districts[this.currentIndexDistrict]) {
        for (const theFunction of this.searchProcessRecipe) {
          Logger.log(`search:: Executing ${theFunction}`);
          await this[theFunction]();
          await this.sleep();
        }
        this.currentIndexDistrict++;
      }
    } catch (error) {
      Logger.error(`Error on search:: ${error}`, 'ERROR');
    }
  }

  protected async setPrice() {
    try {
      const minPrice = await this.selenium.driver.findElement(By.xpath(this.selectors.minPrice));
      const maxPrice = await this.selenium.driver.findElement(By.xpath(this.selectors.maxPrice));
      await minPrice.clear();
      await minPrice.sendKeys(this.minPrice);
      await maxPrice.clear();
      await maxPrice.sendKeys(this.maxPrice);
      return true;
    } catch (error) {
      Logger.error(`Error on getInfo:: ${error}`, 'ERROR');
    }
  }

  protected async getInfo() {
    try {
      await this.selenium.driver.findElement(By.xpath(this.selectors.btnSearch)).click();
      // await this.sleep();
      const pageSource = await this.selenium.driver.getPageSource();
      const provinceName = this.provinces[this.currentIndexProvince]['name'];
      const cantonName = this.cantons[this.currentIndexCanton]['name'];
      const districtName = this.districts[this.currentIndexDistrict]['name'];
      // console.log('this.currentIndexProvince', this.currentIndexProvince);
      // console.log('this.currentIndexCanton', this.currentIndexCanton);
      // console.log('this.currentIndexDistrict',this.currentIndexDistrict);
      // if (!pageSource.includes(this.validationSearch)) {
        // this.finalData = {
        //   ...this.finalData,
        //   [provinceName]: {
        //     [cantonName]: {
        //       [districtName]: await this.getProperties()
        //     }
        //   }
        // }
        const properties = await this.getProperties();
        if(properties.length > 0) {
          Logger.log('properties', 'INFO');
          Logger.log(JSON.stringify(properties), 'INFO');
          const headers = [`Provincia - ${provinceName} \n`, `Cantón - ${cantonName}  \n`, `Distrito - ${districtName} \n`].join('');
          let body = '';
          for (const property of properties) {
            const currentProperty = [`Nombre: ${property.name} | `, `Precio: ${property.price} | `, `URL: ${property.url}`].join('');
            body += `${currentProperty} \n`;
          }
          fs.writeFileSync('./data-properties.txt', `${headers}${body} \n`, { flag: 'a+' });
        }
      // }
      // console.log(`provinceName::${JSON.stringify(provinceName)}`)
      // console.log(`cantonName::${JSON.stringify(cantonName)}`)
      // console.log(`districtName::${JSON.stringify(districtName)}`)
      return true;
    } catch (error) {
      Logger.error(`Error on getInfo:: ${error}`, 'ERROR');
    }
  }

  protected async getProperties() {
    try {
      const properties = await this.selenium.driver.findElements(By.xpath(`//div[@class="col-xs-12 col-md-8 properties-list"]/a`));
      const propertiesInfo = [];
      for (const property of properties) {
      // for (let i = 0; i < properties.length; i++) {
      //   const property = properties[i];
        // let nameElement = await property.findElement(By.xpath('*//div[@class="property-item-title"]'));
        // let nameText = await nameElement.getText();
        // console.log('name::', nameText);
        let currentProperty = {
          name: await property.findElement(By.xpath('*//div[@class="property-item-title"]')).getText(),
          price: (await property.findElement(By.xpath('*//div[@class="property-price"]')).getText()).split(':')[1].replace(/ /gi, ''),
          url: await property.getAttribute('href')
        }
        propertiesInfo.push(currentProperty);
      }
      Logger.log('properties', 'INFO');
      Logger.log(JSON.stringify(propertiesInfo));
      return propertiesInfo;
    } catch (error) {
      Logger.error(`Error on getProperties:: ${error}`, 'ERROR');
    }
  }

  protected async sleep() {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, 2500)
    })
  }

  protected async openSlt(slt) {
    try {
      await this.selenium.driver.findElement(By.xpath(slt)).click();
      return true;
    } catch (error) {
      Logger.error(`Error on openSlt:: ${error}`, 'ERROR');
    }
  }

}
