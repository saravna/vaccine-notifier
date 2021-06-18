const fetch = require('node-fetch');
const sendMail = require('./mailer');

const url = "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict"
const district = process.env.district

function getTwoDigit (digit) {
  if (digit > 9 ) return digit;
  return `0${digit}`;
}

function fetchAvailability () {
  const date = new Date(Date.now());
  const dateInFormat = `${getTwoDigit(date.getDate())}-${getTwoDigit(date.getMonth() + 1)}-${date.getUTCFullYear()}`;
  let availableSessions = [];
  fetch(`${url}?district_id=${district}&date=${dateInFormat}`)
  .then(data => data.json())
  .then(data => {
    data.centers.forEach(center => {
      center.sessions.forEach(session => {
        if ((session.available_capacity_dose2 > 0 || session.available_capacity_dose1 > 0) && session.min_age_limit === 18 && session.vaccine === 'COVISHIELD') {
          availableSessions = [ ...availableSessions, {
            name: center.name,
            date: session.date,
            age: session.min_age_limit,
            dose1: session.available_capacity_dose1,
            dose2: session.available_capacity_dose2,
            vaccine: session.vaccine,
          } ]
        }
      })
    });
    if (availableSessions.length > 0) {
      let html = `
        <table>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Vaccine</th>
            <th>Dose 1</th>
            <th>Dose 2</th>
          </tr>
      `;
      availableSessions.forEach(session => {
        html += `
          <tr>
            <td>${session.name}</td>
            <td>${session.date}</td>
            <td>${session.vaccine}</td>
            <td>${session.dose1}</td>
            <td>${session.dose2}</td>
          </tr>
        `
      })
      html += '</table>'
      sendMail(html);
    }
  })
  .catch(e => {
    console.log('Error', e);
  });
}

// setInterval(fetchAvailability, 3000);
fetchAvailability();