const schedule = require('node-schedule');

const mailer = require('./mailer');
const mobileScrapper = require('./scrapers/mobile_bg/mobileBgScrapper');
const sfaScrapper = require('./scrapers/sofiaFranceAuto/sfaScrapper');
const sfaUrlScrapper = require('./scrapers/sfaPuppeteer/sfaURLScrapper');

const URL_MOBILE_BG = 'https://euratec.mobile.bg/';

const extractCarInfoAsHtml = (carDataObj, url) => {
  let html = `<h3>${carDataObj.title}</h3>`;

  for(let car of carDataObj.cars) {
    html += `<p>${car}</p>`;
  }

  html += `<div><a target="_blank" href="${url}">${url}</a></div>`;
  return html;
};

console.log('! CRAWLER STARTED !');

// peugeot -> value = 9
const carBrand = '9';
// peugeot model -> value = 28 (308 SW), value = 37 (508)
const carModel308sw = '28';
const carModel508 = '37';

const run = async () => {

  const [p308swObj, p508Obj] = await Promise.allSettled([
    sfaUrlScrapper(carBrand, carModel308sw),
    sfaUrlScrapper(carBrand, carModel508),
  ]);

  if (p308swObj.status === 'fulfilled' && p508Obj.status === 'fulfilled') {
    Promise.allSettled([
      mobileScrapper(URL_MOBILE_BG),
      sfaScrapper(carModel308sw),
      sfaScrapper(carModel508),
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
        sfa308HtmlContent = extractCarInfoAsHtml(sfa308.value, p308swObj.value);
      } else {
        sfa308HtmlContent = `<h3>${sfa308.reason}</h3>`;
      }

      if (sfa508.status === 'fulfilled') {
        sfa508HtmlContent = extractCarInfoAsHtml(sfa508.value, p508Obj.value);
      } else {
        sfa508HtmlContent = `<h3>${sfa508.reason}</h3>`;
      }

      const mailContent = mobileHtmlContent + '</br></br></br>' + sfa308HtmlContent + '</br></br></br>' + sfa508HtmlContent;

      mailer(mailContent).catch(console.error);
    });
  } else {
    const mailContent = `308SW FAIL: ${p308swObj.reason}` + '</br></br></br>' + `508 FAIL: ${p308swObj.reason}`;
    mailer(mailContent).catch(console.error);
  }
};

// run();
// https://stackoverflow.com/questions/41597538/node-cron-run-job-every-3-hours
// schedule.scheduleJob('0 0 */3 * * *', run);

// https://stackoverflow.com/questions/55426667/using-node-schedule-to-run-at-specific-times
let hour = [9, 12, 15, 18];
let minute = [1, 1, 1, 1];

for (let i = 0; i < hour.length; i++) {
  const rule = new schedule.RecurrenceRule();
  rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
  rule.hour = hour[i];
  rule.minute = minute[i];

  schedule.scheduleJob(rule, run);
}
