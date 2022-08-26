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


// function getPost(postType) {
//     const getID = async() => {
//         try {
//             const config = {
//                 headers: {
//                     'Authorization': auth,
//                     // 'Accept': 'application/json'
//                 }
//             };
//             const n = 1
//             while (n <= 15) {
//                 const res = await axios.get(`${wikiLink}${postType}?per_page=100&page=${n}`, config);
//                 const result = JSON.parse(JSON.stringify(res.data));

//                 for (list of result) {
//                     idData.push(list.id)
//                         // console.log(list.id)
//                 }
//             }
//         } catch (e) {
//             console.log(e)
//         }
//     }
//     getID()
// }
// getPost('team')



// axios(config)
//     .then(function(response) {
//         console.log(JSON.stringify(response.data));
//     })
//     .catch(function(error) {
//         console.log(error);
//     });


//-----------------------------------------------------------------------------------------
function handleAirtableRow() {
    var base = new Airtable({ apiKey: api_key }).base('appov2gguC5qBWGDq');

    base('CRM').select({
        maxRecords: 1,
        view: "Website Export"
    }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.
            try {
                records.forEach(function(record) {
                    const title = ('Retrieved', record.get('post_title'));
                    const postTitle = title.replace(/\s+/g, '-');
                    const imgData = ('Retrieved', record.get('profile_picture'));
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

handleAirtableRow();


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
                return filePath
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

        const targetPostID = await JSON.stringify(res.data[0].id);
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
        console.log(JSON.stringify(res.data));
    } catch (e) {
        console.log(e)
    }
}