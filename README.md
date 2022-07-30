# Selenium service

This application works to get property information from https://www.bnventadebienes.com/ website, where you send an amount of money to filter.

## Information output

You can check the output opening the **data-properties-with-results.txt** file

You will see information like:

- Name
- Price
- URL to get more details

## Requirements
This app needs to have installed **Firefox browser** to run.

*If you don't have it* please go to https://www.mozilla.org/es-ES/firefox/new/ and download it


## Installation

```bash
$ npm install
```

## Running the app

```bash
# Compile
$ npm run build

# Start app
$ npm run start
```

## How to use it?
After execute the **Start app command (npm run start)**
1. Go to a browser and open this web address: 
http://localhost:3000/api
2. Open the **/get-properties** tab
3. Click on *Try it out* button
4. Add the quantity of money to filter the properties. **It's required**
5. Click on *Execute*

The app will show you a **True** as result, but it'll start to running and check each *Province, per canton per district* to search the properties with a price equal or less than the money you already wrote.

You can check the results by opening the folder app and searching the **data-properties.txt** file located in root folder. If it's not there, you need to wait some time until the process is finish.
