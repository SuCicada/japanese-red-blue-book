const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const jsyaml = require('js-yaml');

const envPath = path.resolve(__dirname, '../.env.development');
dotenv.config({ path: envPath });
console.log('Environment variables loaded from:', envPath);


// Configure AWS SDK
const s3 = new AWS.S3({
  // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
  // profile: 'default',
});

let s3_dir = process.env.AWS_UPLOAD_PATH;
if (!s3_dir.endsWith('/')) {
  s3_dir += '/';
}

// Load environment variables from .env.development

async function getAudio(text) {
  const payload = {
    tts_engine: "lain_style_bert_vits2",
    text: text,
  }
  const params = new URLSearchParams(payload).toString();
  const url = `${process.env.VITE_TTS_API_URL}?${params}`
  const audio = await fetch(url);
  const blob = await audio.blob();
  // Convert Blob to Buffer
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function isExistInS3(key) {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };
  try {
    const data = await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
}

function getKey(index) {
  return `${s3_dir}${index}.mp3`;
}

async function uploadAudioToS3(key, text, force = false) {
  if (!force && await isExistInS3(key)) {
    console.log(`File already exists: ${key}`);
    return;
  }
  // Read the file
  const fileContent = await getAudio(text);

  console.log('Uploading file to:', key);
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: 'audio/mpeg'
  };

  try {
    // Upload to S3
    const data = await s3.upload(params).promise();
    // console.log(`File uploaded successfully at ${data.Location}`);
    return data.Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

async function getTextList() {
  const filePath = path.resolve(__dirname, '../public/1000.md');
  const str = fs.readFileSync(filePath, 'utf-8');
  const yaml = jsyaml.load(str);
  return yaml;
}

async function all() {
  let textList = await getTextList();
  // textList = textList.slice(0, 1);
  for (let i = 0; i < textList.length; i++) {
    const key = getKey(i + 1);
    await uploadAudioToS3(key, textList[i]);
  }
} 

async function custom() {
  let textList = await getTextList();
  const index = 80
  const key = getKey(index);
  await uploadAudioToS3(key,
    textList[index - 1],
    // "急病にかかった彼は、簡単な手続きを経て入院した。",
    true);  
}
(async () => {
  await custom();
  // await all();
})();
