const axios = require('axios');
const cheerio = require('cherio');
const windows1251 = require('windows-1251');

/**
 * It was very hard to find working solution to decode mobile.bg to cyrillic,
 * so this helped me a lot: https://grigcore.blogspot.com/2019/04/my-experience-nodejs-how-decode-windows.html
 * The KEY was => 'latin1' <= encoding
 */

module.exports = async (url) => axios({
  url,
  method: 'GET',
  responseEncoding: 'latin1'
}).then((resp) => {

  const carsObject = { title: '', cars: [] };
  const $ = cheerio.load(windows1251.decode(resp.data), { decodeEntities: false });

  const titleText = $('form[name="search"] > table > tbody > tr > td > div').text().trim();
  carsObject.title = titleText;

  console.log(`>>> ${titleText} <<<`);
  console.log('-----------------------------------');

  const tables = $('form[name="search"] > table > tbody > tr > td > table').toArray();
  const tablesLength = tables.length;

  let carsCount = 0;
  tables.forEach((table, i) => {
    if (i > 1 && i < tablesLength - 4) {
      carsCount++;
      const secondTrWithTableData = $('tbody > tr', table).next();
      const carPrice = $('span[class="price"]', secondTrWithTableData).text();
      const secondTdWithCarTitle = $('td', secondTrWithTableData).next();
      const aTagWithCarName = $('a', secondTdWithCarTitle.html());

      const carTechnicalDescription = $('tbody > tr', table).next().next();
      const carTechnicalDescriptionText = carTechnicalDescription.text().trim();
      const indexOfKm = carTechnicalDescriptionText.indexOf('км,');
      const carTechData = carTechnicalDescriptionText.substring(18, indexOfKm + 3);
  
      const toPrint = `${aTagWithCarName.text()} || ${carPrice} || ${carTechData}`;
      carsObject.cars.push(`${toPrint}`);

      console.log(`${carsCount} - ${toPrint}`);
    }
  });

  console.log('-----------------------------------');
  console.log('-----------------------------------');

  return carsObject;
}).catch(e => console.log('ERROR', e));


// // -----> TEST LOCAL WITH SAMPLE.HTML <----- //
// const fs = require('fs');
// const path = require('path');

// module.exports = async (url) => axios.get(url).then((resp) => {
//   console.log(`---| URL to GET: ${url} |---`);
//   const carsObject = {
//     title: '',
//     cars: [],
//   };
//   const { data } = resp;

//   // let $ = cheerio.load(data, { decodeEntities: false,  });
//   let $ = cheerio.load(fs.readFileSync(path.join(__dirname + '/sample.html')));

//   const titleText = $('form[name="search"] > table > tbody > tr > td > div').text().trim();
//   // const titleText = $('table > tbody > tr > td > div', formToStart).text().trim();
//   console.log(`>>> ${titleText} <<<`);
//   carsObject.title = titleText;
//   console.log('-----------------------------------');

//   const tables = $('form[name="search"] > table > tbody > tr > td > table').toArray();
//   const tablesLength = tables.length;

//   let carsCount = 0;
//   tables.forEach((table, i) => {
//     if (i > 1 && i < tablesLength - 4) {
//       carsCount++;
//       const secondTrWithTableData = $('tbody > tr', table).next();
//       const carPrice = $('span[class="price"]', secondTrWithTableData).text();
//       const secondTdWithCarTitle = $('td', secondTrWithTableData).next();
//       const aTagWithCarName = $('a', secondTdWithCarTitle.html());

//       const carTechnicalDescription = $('tbody > tr', table).next().next();
//       const carTechnicalDescriptionText = carTechnicalDescription.text().trim();
//       const indexOfKm = carTechnicalDescriptionText.indexOf('км,');
//       const carTechData = carTechnicalDescriptionText.substring(18, indexOfKm + 3);
  
//       const toPrint = `${aTagWithCarName.text()} || ${carPrice} || ${carTechData}`;
//       carsObject.cars.push(`${toPrint}`);
//       console.log(`${carsCount} - ${toPrint}`);
//     }
//   });
//   console.log('-----------------------------------');
//   return carsObject;
// }).catch(e => console.log('ERROR', e));
