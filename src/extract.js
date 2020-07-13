// const playwright = require('playwright');
const { chromium } = require('playwright');
const fs = require('fs');
const parallel = 1;
const url = `https://www.baanpolballs.com/pb/before.php`
const daysback = 365

function leadingzeroes(num, leadnum) {
  return ("0" + num).slice(-leadnum)
}

function getDays(daysback) {
  const d = new Date();
  let datearray = []
  for (let i = 0; i < daysback; i++) {
    let newd = d
    newd.setDate(d.getDate() - 1);
    datearray.push(leadingzeroes(newd.getDate(), 2) + '/' + leadingzeroes(newd.getMonth(), 2) + '/' + newd.getFullYear())
  }
  return datearray
}


async function fetchHTML(page) {
  let table = {};
  await page.waitForSelector('#soccer-table > thead > tr:nth-child(1) > td');
  table.date = await page.$eval('#soccer-table > thead > tr:nth-child(1) > td', el => el.textContent);
  table.data = []
  let tmp = {};
  // await console.log(page.$('#soccer-table > tbody > tr'));
  const el = await page.$$eval('#soccer-table tbody tr', rows => {
    return Array.from(rows, row => {
      const columns = row.querySelectorAll('td');
      return Array.from(columns, column => column.innerText);
    })
  })

  el.forEach( (element) => {
    if (element.length === 1) {
      tmp = {};
      tmp.league_name = element[0];
    } else {
      const row = element;
      tmp.time = row[0];
      tmp.home = row[1];
      tmp.away = row[2];
      tmp.ratio = row[3];
      tmp.forecast = row[4].split('-');
      tmp.result = row[5].split('-');
      tmp.opinion = row[6];
      tmp.winner = ''
      if (tmp.result[0]>0) {
        tmp.winner = tmp.home
      } else if (tmp.result[0] < 0) {
        tmp.winner = tmp.away
      }
      table.data.push(tmp);
    }
  })

  // console.log(table);
  return table;
}

const days = getDays(daysback);

const savepage = async (days, parallel) => {
  const parallelBatches = Math.ceil(days.length / parallel)

  let k = 0;
  for (let i = 0; i < days.length; i += parallel) {
    k++
    console.log('\nBatch ' + k + ' of ' + parallelBatches)
    // Launch and Setup Chromium
    process.setMaxListeners(0);
    const browser = await chromium.launch({
      args: ['--disable-dev-shm-usage'],
      // headless: false
    });
    // const context = await browser.createIncognitoBrowserContext();
    // const page = await context.newPage();
    // page.setJavaScriptEnabled(false)



    for (let j = 0; j < parallel; j++) {
      let elem = i + j
      // only proceed if there is an element 
      if (days[elem] != undefined) {
        // Promise to take Screenshots
        // promises push
        console.log('🖖 I promise to match: ' + days[elem]);
        browser.newPage().then(async page => {
          try {
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, {waitUntil: 'load', timeout: 0});
            const form = await page.$('#dateBefore');
            await page.waitForSelector('#dateBefore');
            form.fill(days[elem]);
            console.log(days[elem]);
            // await form.type(day);
            // await form.evaluate(form => form.submit());
            await page.waitForSelector('#dateSearch > input[type=submit]:nth-child(4)');
            await page.click('#dateSearch > input[type=submit]:nth-child(4)');
            // await page.waitForSelector('#dateSearch');
            // await page.screenshot({
            //   path: `example_${i}.png`
            // });
            let parse = await fetchHTML(page);
            // console.log(parse);
            let json = JSON.stringify(parse);
            fs.mkdir('raw_table', { recursive: true }, (err) => {
              if (err) throw err;
            });
            fs.writeFile(`raw_table/${days[elem].replace(/[\/]/gi,'-')}.json`, json, 'utf8', function (err) {
              if (err) {
                return console.log(err);
              }
              console.log("File saved successfully!");
            });
            await browser.close();
            await page.close();
          } catch (err) {
            console.log('❌ Sorry! I couldn\'t keep my promise to crawl ' + days[elem]);
            console.log(err)
          }
        })
        // await browser.close();
      }
    }
  }
}

savepage(days, parallel);