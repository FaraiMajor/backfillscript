const axios = require('axios');
const fs = require('fs');
require('dotenv').config();


const mediaUrl = process.env.MEDIAURL;
const auth = process.env.AUTH;
const wikiLink = process.env.WIKI_ENDPOINT

var idData = [];

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
                    console.log(list.id)
                }
            }
        } catch (e) {
            console.log(e)
        }
    }
    getID()
}
getPost('videos')
    //post images to wordpress
var config = {
    method: 'post',
    url: mediaUrl,
    headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
        "Content-Disposition": 'form-data; filename="example.jpeg"',
        "Content-Type": "image/jpeg",
    },
    data: fs.readFileSync('./images/1517872914483.jpeg')
};

axios(config)
    .then(function(response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function(error) {
        console.log(error);
    });