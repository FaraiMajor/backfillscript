const axios = require('axios');
var Airtable = require('airtable');
const fs = require('fs');
const { image } = require('image-downloader');
require('dotenv').config();


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
        maxRecords: 5,
        view: "Website Export"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.

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
            // const filePath = downloadImage(imageurl);
            // const imagePostId = uploadImage(filePath);
            // const targetPostID = lookUpTargetPost(postTitle)
            // setImageForPost(imagePostId, targetPostID)
        });
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }
    });
}

handleAirtableRow();


//-----------------------------------------------------------------------------------------
function downloadImage(imageurl) {
    fs.mkdir(path.join(__dirname, 'images/'), { recursive: true }, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
    });

    const newFolder = {
        url: imageurl,
        dest: '../../images',
    };
    download.image(newFolder)
        .then(({ filename }) => {
            console.log('Saved to', filename);
            const filePath = filename
            return filePath
        })
        .catch((err) => console.error(err))
}


//-----------------------------------------------------------------------------------------
function uploadImage(filePath) {

    var config = {
        method: 'post',
        url: mediaUrl,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
            "Content-Disposition": 'form-data; filename="example.jpeg"',
            "Content-Type": "image/jpeg",
        },
        data: fs.readFileSync(filePath)
    };

    axios(config)
        .then(function(response) {
            const imagePostId = JSON.stringify(response.data.id);
            return imagePostId
        })
        .catch(function(error) {
            console.log(error);
        });
}


//-----------------------------------------------------------------------------------------
function lookUpTargetPost(postTitle) {
    const config = {
        url: `http://localhost:8888/wikitongues/wp-json/wp/v2/team?slug=${postTitle}`,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json;charset=UTF-8',
        }
    };
    axios(config)
        .then(function(response) {
            const targetPostID = (JSON.stringify(response.data[0].id));
            console.log(targetPostID)
            return targetPostID;
        })
        .catch(function(error) {
            console.log(error);
        });
}


//-----------------------------------------------------------------------------------------
function setImageForPost(imagePostId, targetPostID) {
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
    axios(config)
        .then(function(response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function(error) {
            console.log(error);
        });
}