import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://ipanel.local';
const urls = [BASE+'/visualizer/', BASE+'/visualizer/?gl=1', BASE+'/visualizer/?pbr=1'];
let fail = 0;
const browser = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for (const u of urls) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR '+e.message));
  await page.goto(u, {waitUntil:'load', timeout:30000});
  await page.waitForSelector('.rv-card', {timeout:15000});
  await page.click('[data-next]'); await page.click('[data-back]');
  const bad = errs.filter(e => !/404|Failed to load resource|net::/.test(e));
  console.log(u, '→', bad.length ? bad : 'clean');
  if (bad.length) fail = 1;
  await page.close();
}
await browser.close();
process.exit(fail);
