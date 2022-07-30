import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AppService } from './app.service';



@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test-selenium')
  @ApiProperty({
    description: 'Money',
    type: Number
  })
  testSelenium(@Query('money') money: Number) {
    this.appService.setupTest(money);
    return true;
  }

  @Get('get-properties')
  @ApiProperty({
    description: 'Money',
    type: Number
  })
  getProperties(@Query('money') money: Number){
    this.appService.initProcess(money);
    return true;
  }

}
