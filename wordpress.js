const axios = require('axios');
const fs = require('fs');
const { image } = require('image-downloader');
require('dotenv').config();


const mediaUrl = process.env.MEDIAURL;
const auth = process.env.AUTH;
const wikiLink = process.env.WIKI_ENDPOINT

let idData = [];

function getPost(postType) {
    const getID = async() => {
        try {
            const config = {
                headers: {
                    'Authorization': auth,
                    // 'Accept': 'application/json'
                }
            };
            const n = 1
            while (n <= 15) {
                const res = await axios.get(`${wikiLink}${postType}?per_page=100&page=${n}`, config);
                const result = JSON.parse(JSON.stringify(res.data));


                for (list of result) {
                    idData.push(list.id)
                        // console.log(list.id)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    getID()
}
getPost('team')



axios(config)
    .then(function(response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function(error) {
        console.log(error);
    });
//-----------------------------------------------------------------------------------------
function handleAirtableRow(fields) {
    const imageurl = '' //toDo look up from fields
    const postTitle = '' // from fields
    const filePath = downloadImage(imageurl);
    const imagePostId = uploadImage(filePath);
    const targetPostID = lookUpTargetPost(postTitle)
    setImageForPost(imagePostId, targetPostID)
}


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
        })
        .catch((err) => console.error(err))

    return filePath
}


//-----------------------------------------------------------------------------------------
function uploadImage(filePath) {

    const config = {
        method: 'post',
        url: mediaUrl,
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json',
        },
        data: fs.readFileSync(filePath)
    };
    axios(config)
        .then(function(response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function(error) {
            console.log(error);
        });


    return imagePostId
}


//-----------------------------------------------------------------------------------------
function lookUpTargetPost(postTitle) {

    return targetPostID
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
        url: `http://localhost:8888/wikitongues/wp-json/wp/v2/team/${targetPostId}`,
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