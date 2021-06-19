const fetch = require('node-fetch');
const sendMail = require('./mailer');

const url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict"

function getTwoDigit (digit) {
  if (digit > 9 ) return digit;
  return `0${digit}`;
}

async function fetchAvailability () {
  const date = new Date(Date.now());
  const dateInFormat = `${getTwoDigit(date.getDate())}-${getTwoDigit(date.getMonth() + 1)}-${date.getUTCFullYear()}`;
  let toList = [];
  const env = process.env;
  const envKeys = Object.keys(env);
  toList = envKeys.filter(k => k.startsWith('to')).map(k => process.env[k]);
  for (let i = 0; i < toList.length ; i+=1) {
    let availableSessions = [];
    const district = process.env[`district${i}`];
    const res = await fetch(`${url}?district_id=${district}&date=${dateInFormat}`)
    const data = await res.json();
    data.centers.forEach(center => {
      center.sessions.forEach(session => {
        if (
          (session.available_capacity_dose2 > 0) 
          && (district  === '539' ? session.min_age_limit === 18 : session.min_age_limit >=18 )
          && session.vaccine === 'COVISHIELD') {
          availableSessions = [ ...availableSessions, {
            name: center.name,
            date: session.date,
            age: session.min_age_limit,
            dose1: session.available_capacity_dose1,
            // dose2: session.available_capacity_dose2,
            vaccine: session.vaccine,
          } ]
        }
      })
    });
    console.log(availableSessions.length);
    if (availableSessions.length > 0) {
      let html = `
        <table style="border-collapse: collapse;">
          <tr style="border-collapse: collapse;">
            <th style="border: 1px solid black; border-collapse: collapse;">Name</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Date</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Vaccine</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Min Age</th>
            <th style="border: 1px solid black; border-collapse: collapse;">Dose 1</th>
            </tr>
      `;
            // <th>Dose 2</th>
      availableSessions.forEach(session => {
        html += `
          <tr>
            <td style="border: 1px solid black; border-collapse: collapse;">${session.name}</td>
            <td style="border: 1px solid black; border-collapse: collapse;">${session.date}</td>
            <td style="border: 1px solid black; border-collapse: collapse;">${session.vaccine}</td>
            <td style="border: 1px solid black; border-collapse: collapse;">${session.age}</td>
            <td style="border: 1px solid black; border-collapse: collapse;">${session.dose1}</td>
            </tr>
            `
            // <td>${session.dose2}</td>
      })
      html += '</table>'
      await sendMail(html, process.env[`to${i}`]);
    }
  }
}

// setInterval(fetchAvailability, 60 * 3 * 1000);
fetchAvailability();