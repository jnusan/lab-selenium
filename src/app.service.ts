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
}
