const { ocrSpace } = require('ocr-space-api-wrapper');

function getTotal(rawArr) {
    let results = []
    for (i = 0; i < rawArr.length; i++) {
        let str = rawArr[i].toLowerCase();
        if(str.includes('total') || str.includes('balance') || str.includes('due')) {
            results.push(rawArr[i].replace(/[^0-9.]/g, ''));
        }
    }
    return Math.max(...results);
}

exports.handler = async function(context, event, callback) {
  const ocrKey = context.OCR_KEY;
  const twiml = new Twilio.twiml.MessagingResponse();
  const imgUrl = event.MediaUrl0;

  try {
    const response = await ocrSpace(imgUrl, {
        apiKey: ocrKey, 
        isTable: true
    });
    
    if (response.OCRExitCode != 1) {
      console.error(response.ErrorMessage[0]);
      return callback(error);
    }

    const parsedContents = response.ParsedResults[0].ParsedText;
    const rawArr = parsedContents.split(/\r?\n/);

    const total = getTotal(rawArr);
    console.log("Total: ", total);
    twiml.message(`Total= ${total}`);

  } catch (error) {
      console.error(error);
      return callback(error);
  }

  return callback(null, twiml);
};