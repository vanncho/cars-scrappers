
const cheerio = require('cherio');
const fs = require('fs');
const path = require('path');

module.exports = async (carModel) => {
  const carsObject = {
    title: '',
    cars: [],
  };

  let $ = cheerio.load(fs.readFileSync(path.join(__dirname + `/../sfaPuppeteer/${carModel}-sample.html`)));

  const carBoxes = $('div[class="carBox  "]').toArray();
  const carBoxesLength = carBoxes.length;

  console.log(`>>> ${carBoxesLength} car(s) in Sofia France Auto <<<`);
  console.log('-----------------------------------');

  carBoxes.forEach((carBox, i) => {
    const aTagWithCarName = $('a[class="carBoxTitle"]', carBox).text();
    const carPrice = $('div[class="left w100 bgrispons"] > div[class="priceBox"] > span[class="priceCar"]', carBox).text();
    const carDescriptionHtml = $('div[class="left w100 descriptionCar"]', carBox).html();

    const carParsedDescription = $('p', carDescriptionHtml).next().next().text();
    const indexOfKmRef = carParsedDescription.indexOf('кмRef');
    const cardDesc = carParsedDescription.substring(0, indexOfKmRef + 2);

    const toPrint = `${aTagWithCarName} || ${carPrice} || ${cardDesc}`;
    carsObject.cars.push(`${toPrint}`);

    console.log(`${i + 1} - ${toPrint}`);
  });

  console.log('-----------------------------------');

  return carsObject;
};


// // -----> TEST LOCAL WITH SAMPLE.HTML <----- //
// const fs = require('fs');
// const path = require('path');

// module.exports = async (url) => {
//   console.log(`---| URL to GET: ${url} |---`);
//   const carsObject = {
//     title: '',
//     cars: [],
//   };
//   // const { data } = resp;

//   let $ = cheerio.load(fs.readFileSync(path.join(__dirname + '/sample.html')));

//   const carBoxes = $('div[class="carBox  "]').toArray();
//   const carBoxesLength = carBoxes.length;

//   console.log(`>>> ${carBoxesLength} car(s) in Sofia France Auto <<<`);
//   console.log('-----------------------------------');

//   carBoxes.forEach((carBox, i) => {
//     const aTagWithCarName = $('a[class="carBoxTitle"]', carBox).text();
//     const carPrice = $('div[class="left w100 bgrispons"] > div[class="priceBox"] > span[class="priceCar"]', carBox).text();
//     const carDescriptionHtml = $('div[class="left w100 descriptionCar"]', carBox).html();

//     const carParsedDescription = $('p', carDescriptionHtml).next().next().text();
//     const indexOfKmRef = carParsedDescription.indexOf('кмRef');
//     const cardDesc = carParsedDescription.substring(0, indexOfKmRef + 2);

//     const toPrint = `${aTagWithCarName} || ${carPrice} || ${cardDesc}`;
//     carsObject.cars.push(`${toPrint}`);

//     console.log(`${i + 1} - ${toPrint}`);
//   });

//   console.log('-----------------------------------');

//   return carsObject;
// };