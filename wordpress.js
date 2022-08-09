const axios = require('axios');
// const FormData = require('form-data');
const fs = require('fs');
// const stream = fs.createReadStream('images/1517872914483.jpeg');



var idData = [];

function getPost(postType) {
    const getID = async() => {
        try {
            const config = {
                headers: {
                    'Authorization': 'Basic d3RfYWRtaW46RiooT2d3byhGKU9SYm5SR1g5MUZ6QG1G',
                    // 'Accept': 'application/json'
                }
            };
            const n = 1
            while (n <= 15) {
                const res = await axios.get(`http://localhost:8888/wikitongues/wp-json/wp/v2/${postType}?per_page=100&page=${n}`, config);
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
getPost('videos')

// const form = new FormData();
// form.append('image', stream);
// var data = JSON.stringify({
//     "acf": {
//         "linkedin": "apo000 boys"
//     }
// });

var config = {
    method: 'post',
    url: 'http://localhost:8888/wikitongues/wp-json/wp/v2/media',
    headers: {
        'Authorization': 'Basic d3RfYWRtaW46RiooT2d3byhGKU9SYm5SR1g5MUZ6QG1G',
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