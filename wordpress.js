const axios = require('axios');
var Airtable = require('airtable');
const fs = require('fs');
const { image } = require('image-downloader');
require('dotenv').config();
const path = require('path');
const download = require('image-downloader');



const mediaUrl = process.env.MEDIAURL;
const auth = process.env.AUTH;
const wikiLink = process.env.WIKI_ENDPOINT
const api_key = process.env.AIRTABLE_APIKEY;
const teamid = process.env.TEAM_BASEID;
const ohId = process.env.OH_BASEID
const teambase = process.env.TEAM_TABLE
const oralHistbase = process.env.OH_TABLE
const post_title = process.env.TITLE
const teamField = process.env.TEAM_FIELD
const ohField = process.env.OH_FIELD


//-----------------------------------------------------------------------------------------
function handleAirtableRow(baseid, base, post_title, urlField) {
    var base = new Airtable({ apiKey: api_key }).base(baseid);

    base(base).select({
        maxRecords: 1,
        view: "Website Export"
    }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.
            try {
                records.forEach(function(record) {
                    const title = ('Retrieved', record.get(post_title));
                    const postTitle = title.replace(/\s+/g, '-');
                    const imgData = ('Retrieved', record.get(urlField));
                    let imageurl = '';
                    if (imgData !== undefined) {
                        imageurl = imgData.substring(imgData.indexOf('(h') + 1, imgData.length - 1);
                    } else {
                        return;
                    }
                    console.log(postTitle);
                    console.log(imageurl);
                    let filePath = downloadImage(imageurl);
                    let imagePostId = uploadImage(filePath);
                    let targetPostID = lookUpTargetPost(postTitle)
                    setImageForPost(imagePostId, targetPostID)
                });
            } catch (e) { console.log('error inside eachPage => ', e) }
            fetchNextPage();

        },
        function done(err) {
            if (err) { console.error(err); return; }
        });
}

handleAirtableRow(teamid, teambase, post_title, teamField);
handleAirtableRow(ohId, oralHistbase, post_title, ohField);


//-----------------------------------------------------------------------------------------
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
                console.log('Saved to', filename);
                const filePath = String(filename)
                return filePath;

            })

    } catch (e) {
        console.log(e)
    }
}


//-----------------------------------------------------------------------------------------
async function uploadImage(filePath) {
    try {
        var config = {
            method: 'post',
            url: mediaUrl,
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json',
                "Content-Disposition": 'form-data; filename="image.jpeg"',
                "Content-Type": "image/jpeg",
            },
            data: fs.readFileSync(filePath)
        };

        const res = await axios(config)

        const imagePostId = JSON.stringify(res.data.id);
        console.log("image id " + imagePostId)
        return imagePostId

    } catch (e) {
        console.log("ERROR " + e)
    }
}


//-----------------------------------------------------------------------------------------
async function lookUpTargetPost(postTitle) {
    try {
        const config = {
            url: `http://localhost:8888/wikitongues/wp-json/wp/v2/team?slug=${postTitle}`,
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json;charset=UTF-8',
            }
        };
        let res = await axios(config)

        const targetPostID = JSON.stringify(res.data[0].id);
        console.log("post id " + targetPostID)
        return targetPostID;
    } catch (e) {
        console.log(e)
    }
}


//-----------------------------------------------------------------------------------------
async function setImageForPost(imagePostId, targetPostID) {
    try {
        const data = {
            "acf": {
                "profile_pic_url": imagePostId
            }
        }

        var config = {
            method: 'post',
            // url: mediaUrl,
            url: `http://localhost:8888/wikitongues/wp-json/wp/v2/team/${targetPostID}`,
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json',
            },
            data: data
        };
        let res = await axios(config)
        console.log(JSON.parse(JSON.stringify(res.data)));
    } catch (e) {
        console.log(e)
    }
}

//tbc