const schedule = require('node-schedule');

const mailer = require('./mailer');
const mobileScrapper = require('./scrapers/mobile_bg/mobileBgScrapper');
const sfaScrapper = require('./scrapers/sofiaFranceAuto/sfaScrapper');

const URL_MOBILE_BG = 'https://euratec.mobile.bg/';
const URL_SFA_308 = 'https://occasion.sfa.bg/cars/search?slink=a9165e4c1b1a8388d86b6aa903ab80d1'; // 308
const URL_SFA_508 = 'https://occasion.sfa.bg/cars/search?slink=1e7acee8c882e02e49847baff02e0bf4'; // 508

const extractCarInfoAsHtml = (carDataObj, url) => {
  let html = `<h3>${carDataObj.title}</h3>`;

  for(let car of carDataObj.cars) {
    html += `<p>${car}</p>`;
  }

  html += `<div><a target="_blank" href="${url}">${url}</a></div>`;
  return html;
};

console.log('! CRAWLER STARTED !');

const run = () => {
  Promise.allSettled([
    mobileScrapper(URL_MOBILE_BG),
    sfaScrapper(URL_SFA_308),
    sfaScrapper(URL_SFA_508),
  ]).then((resp) => {
    const [mobile, sfa308, sfa508] = resp;

    let mobileHtmlContent = '';
    let sfa308HtmlContent = '';
    let sfa508HtmlContent = '';

    if (mobile.status === 'fulfilled') {
      mobileHtmlContent = extractCarInfoAsHtml(mobile.value, URL_MOBILE_BG);
    } else {
      mobileHtmlContent = `<h3>${mobile.reason}</h3>`;
    }

    if (sfa308.status === 'fulfilled') {
      sfa308HtmlContent = extractCarInfoAsHtml(sfa308.value, URL_SFA_308);
    } else {
      sfa308HtmlContent = `<h3>${sfa308.reason}</h3>`;
    }

    if (sfa508.status === 'fulfilled') {
      sfa508HtmlContent = extractCarInfoAsHtml(sfa508.value, URL_SFA_308);
    } else {
      sfa508HtmlContent = `<h3>${sfa508.reason}</h3>`;
    }

    const mailContent = mobileHtmlContent + '</br></br></br>' + sfa308HtmlContent + '</br></br></br>' + sfa508HtmlContent;

    mailer(mailContent).catch(console.error);
  });
};

run();

// https://stackoverflow.com/questions/41597538/node-cron-run-job-every-3-hours
schedule.scheduleJob('0 0 */3 * * *', run);
