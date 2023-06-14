const fs = require('fs');

//configuration for readline
const { createInterface } = require('readline');
const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});
const readLineAsync = msg => {
    return new Promise(resolve => {
      readline.question(msg, userRes => {
        resolve(userRes);
      });
    });
}

// validate user string
const validCurrentTime = input => {
    const pattern = /^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)/;
    return pattern.test(input);
}
const getOffset = currentTimeZone => {
    const buffer =  fs.readFileSync('timezones.json');
    const zones = JSON.parse(buffer);
    let offset = -1;
    zones.forEach( zone => {
        const timeZone = zone.abbr;
        if(currentTimeZone === timeZone) {
            offset = zone.offset;
            return;
        }
    });
    return offset;
}
 const startApp = async() => {
    const currentTime = await readLineAsync('CURRENT_TIME: ');
    if(!validCurrentTime(currentTime)) {
        readline.close();
        throw new Error('Invalid Current Time');
    }

    const currentTimeZone = await readLineAsync('CURRENT_TIMEZONE: ');
    const convertTimeZone = await readLineAsync('CONVERT_TO_TIMEZONE: ');
    
    const [timePart, meridiem] = currentTime.split(' ');

    const currentDate = new Date();
    const [hours, minutes] = timePart.split(':');
    let utcHours = parseInt(hours);

    if (meridiem === 'PM') {
        utcHours += 12;
    } else if (meridiem === 'AM' && utcHours === 12) {
        utcHours = 0;
    }

    currentDate.setHours(utcHours);
    currentDate.setMinutes(minutes);

    const utcTime = currentDate.toLocaleString({timeZone: 'UTC' });
    console.log(utcTime);

    const currentOffset = getOffset(currentTimeZone);
    process.env.TZ = currentTimeZone;

    console.log(utcTime);
}
startApp(); 

