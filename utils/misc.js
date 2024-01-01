const fs = require('fs');
const path = require('path');


const indexerLogPath = path.join(__dirname, '../logs', 'indexer.log');

function saveTransactionLog(obj) {
  let filePath = path.join(__basedir, 'logs', 'transactions.csv');
  let headers = Object.keys(obj);
  let values = Object.values(obj);

  // Convert object values to CSV format
  let csvData = values.map(value => {
    if (typeof value === 'string') {
      return `"${value.replace(/"/g, '""')}"`; // Escape double quotes
    } else {
      return value;
    }
  }).join(',');

  // Append CSV data to file
  fs.appendFileSync(filePath, `\n${csvData}`, { flag: 'a+' });

  // Append headers to file if it is the first time writing to the file
  if (fs.statSync(filePath).size === 0) {
    let csvHeaders = headers.map(header => {
      return `"${header.replace(/"/g, '""')}"`; // Escape double quotes
    }).join(',');
    fs.appendFileSync(filePath, csvHeaders);
  }
}

const arrayToHexString = (arr)=>{
  console.log(arr[0],arr[0].toString("hex"))
  let hexArr = arr.map(num => num.toString(16));
  console.log(hexArr.join(""));
  return hexArr.join('');
}

const getCampaignCost = (rewardPerClick,targetClicks)=>{
  let cost = rewardPerClick*targetClicks;
  let platformFee = (cost*process.env.AD_CAMPAIGN_PLATFORM_FEE_PERC)/100;
  return cost+platformFee;
}



const parseUserAgent = (userAgent) => {
  console.log(userAgent)
  const result = {};
  const ua = userAgent.toLowerCase();

  // Parsing logic for extracting browser information
  if (ua.includes('firefox')) {
    result.browser = 'Firefox';
  } else if (ua.includes('chrome')) {
    result.browser = 'Chrome';
  } else if (ua.includes('safari')) {
    result.browser = 'Safari';
  } else if (ua.includes('msie') || ua.includes('trident')) {
    result.browser = 'Internet Explorer';
  } else {
    result.browser = 'Unknown';
  }

  // Parsing logic for extracting operating system information
  if (ua.includes('windows')) {
    result.os = 'Windows';
  } else if (ua.includes('macintosh')) {
    result.os = 'macOS';
  } else if (ua.includes('linux')) {
    result.os = 'Linux';
  } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    result.os = 'iOS';
  } else if (ua.includes('android')) {
    result.os = 'Android';
  } else {
    result.os = 'Unknown';
  }

  // Parsing logic for extracting device information
  if (ua.includes('mobile')) {
    result.device = 'Mobile';
  } else {
    result.device = 'Desktop';
  }

  return result;
};

const delay = (ms)=>{
  return new Promise(resolve => setTimeout(resolve, ms));
}

const bitcoinToSatoshis = (bitcoin)=>{
  const satoshis = bitcoin * 100000000;
  return satoshis;
}

const satoshisToBitcoin = (sats)=>{
  if(sats>0){
    const bitcoin = sats/100000000;
    return bitcoin;
  }else{
    return sats;
  }

}

const getNumberWithMaxDecimal = (number, maxDecimal)=>{
  let roundedNumber = parseFloat(number.toFixed(maxDecimal));
  return roundedNumber;
}

const parseStringToArrayObj = (inputString)=>{
  const cleanedString = inputString.replace(/\s/g, '');
  const pairs = cleanedString.split(',');
  const result = [];

  pairs.forEach(pair => {
    const [recipient, percentage] = pair.split(':');
    const obj = {
      recipient: recipient.trim(),
      perc: parseFloat(percentage)
    };
    result.push(obj);
  });
  return result;
}

const textToHex = (text)=>{
  // Create a Buffer from the text
  const buffer = Buffer.from(text, 'utf8');

  // Convert the buffer to a hex string
  const hexString = buffer.toString('hex');

  return hexString;
}


function hexToText(hexString) {
  const buffer = Buffer.from(hexString, 'hex');
  return buffer.toString('utf8');
}

function hexToBin(hexString) {
  // Remove "0x" if present
  hexString = hexString.replace(/^0x/, '');

  // Convert hex to buffer
  const buffer = Buffer.from(hexString, 'hex');

  return buffer;
}

function binToHex(binaryData) {
  // Convert buffer to hex string
  const hexString = binaryData.toString('hex');

  return hexString;
}


function hexToDecimalLittleEndian(hexString) {
  // Reverse the hex string in pairs (little endian)
  const reversedHex = hexString.match(/.{1,2}/g).reverse().join('');

  // Convert the reversed hex string to decimal
  const decimalNumber = parseInt(reversedHex, 16);

  return decimalNumber;
}

function updateIndexerLog(newContent) {
  try {
    fs.writeFileSync(indexerLogPath, newContent, 'utf8');
  } catch (err) {
    console.error(`Error updating indexer log: ${err}`);
  }
}





module.exports = {
    saveTransactionLog,
    arrayToHexString,
    getCampaignCost,
    parseUserAgent,
    delay,
    bitcoinToSatoshis,
    satoshisToBitcoin,
    parseStringToArrayObj,
    getNumberWithMaxDecimal,
    textToHex,
    hexToBin,
    binToHex,
    hexToText,
    hexToDecimalLittleEndian,
    updateIndexerLog,
}