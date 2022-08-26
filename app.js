var Airtable = require('airtable');
const download = require('image-downloader');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { url } = require('inspector');
// const { base } = require('airtable');
require('dotenv').config();


const api_key = process.env.AIRTABLE_APIKEY;
const oh_baseid = process.env.OH_BASEID;
const team_baseid = process.env.TEAM_BASEID
const team_table = process.env.TEAM_TABLE;
const oh_table = process.env.OH_TABLE;
const oh_field = process.env.OH_FIELD;
const team_field = process.env.TEAM_FIELD;
const mediaUrl = process.env.MEDIAURL;
const auth = process.env.AUTH;
const wikiLink = process.env.WIKI_ENDPOINT

// var count = 0;
// // this create an image folder in the app root directory
// fs.mkdir(path.join(__dirname, 'images/'), { recursive: true }, (err) => {
//     if (err) {
//         return console.error(err);
//     }
//     console.log('Directory created successfully!');
// });
// // get records and download the images to the temp images folder created
// function images(tableName, tableField, baseId) {
//     var base = new Airtable({ apiKey: api_key }).base(baseId);
//     const table = base(tableName);
//     const getRecords = async() => {
//         // try {
//         table.select({
//             maxRecords: 3,
//             view: "Website Export",
//             // fields: ["video_thumbnail"]
//         }).eachPage(function page(records, fetchNextPage) {
//             // This function (`page`) will get called for each page of records.
//             records.forEach((record) => {
//                 let title = record.get('post_title');
//                 let data = (record.get(tableField));
//                 let lnk = "";
//                 if (data !== undefined) {
//                     lnk = data.substring(data.indexOf('(h') + 1, data.length - 1);
//                 } else {
//                     return;
//                 }
//                 console.log(title)
//                 console.log(lnk)
//                 count++;

//                 const newFolder = {
//                     url: lnk,
//                     dest: '../../images', // will be saved to /path/to/dest/image.jpg
//                 };
//                 download.image(newFolder)
//                     .then(({ filename }) => {
//                         console.log('Saved to', filename);

//                     })
//                     .catch((err) => console.error(err))
//             });

//             // To fetch the next page of records, call `fetchNextPage`.
//             // If there are more records, `page` will get called again.
//             // If there are no more records, `done` will get called.
//             fetchNextPage();
//             console.log("Downloaded images =: " + count)

//         }, function done(err) {
//             if (err) { console.error(err); return; }
//         });
//     };
//     getRecords();
// }

// images(team_table, team_field, team_baseid);
// images(oh_table, oh_field, oh_baseid);
async function downloadImage(imageurl) {
    try {
        fs.mkdir(path.join(__dirname, 'images/'), { recursive: true }, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Directory created successfully!');
        });

        const options = {
            url: imageurl,
            dest: '../../images',
        };
        await download.image(options)
            .then(({ filename }) => {
                const filePath = String(filename)
                console.log('Saved to', filePath);
                return filePath
            })

    } catch (e) {
        console.log(e)
    }
}
let linkURL = "https://dl.airtable.com/.attachments/77626f6727113ba2661763e8b484ea2b/5cf5bcef"
let ans = downloadImage(linkURL);
console.log(ans)
    // ans.then(result => {
    //     console.log(result)
    // })