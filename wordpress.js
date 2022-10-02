const axios = require('axios');
const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');
const download = require('image-downloader');
const os = require('os');
const URL = require('url').URL;
const yargs = require('yargs/yargs');

require('dotenv').config();

hideBin = argv => argv.slice(2);
const argv = yargs(hideBin(process.argv)).argv;

// From args:
const wtWebsiteHost = argv.host || 'http://localhost:8888/wikitongues';
const table = argv.table || 'CRM';
const view = argv.view || 'Website Export';
const maxRecords = argv.maxRecords || 1;
const allRecords = argv.all;
const postType = argv.postType || 'team';
const imageFieldAirtable = argv.airtableField || 'profile_picture';
const imageFieldWP = argv.wpField || 'profile_pic_url';
const wpUser = argv.wpUser || process.env.WP_USER || 'wt-admin';
const wpPassword = argv.wpPassword || process.env.WP_PASSWORD || console.error(
    'Wordpress Admin password required. Please provide --wp-password or set WP_PASSWORD'
);
const apiKey = argv.apiKey || process.env.APIKEY || console.error(
    'Airtable API key required. Please provide --api-key or set APIKEY'
);
const baseId = argv.baseId || process.env.BASE || console.error(
    'Airtable Base ID required. Please provide --base-id or set BASE'
);
const dryRun = argv.dryRun;

if (!apiKey || !baseId || !wpPassword) {
    process.exit(1);
}

if (dryRun) {
    console.info('Dry run: will not download images from Airtable');
}

if (!allRecords) {
    console.info(`Processing ${maxRecords} posts(s). To process all posts, add the --all flag.`);
}

// Constants:
const POST_TITLE_FIELD = 'post_title';

let count = 0;

//-----------------------------------------------------------------------------------------
async function handleAirtableRow(record) {
    const title = record.get(POST_TITLE_FIELD);
    const postTitle = title.replace(/\s+/g, '-');
    const imgData = record.get(imageFieldAirtable);
    let imageurl;
    if (imgData !== undefined) {
        imageurl = imgData.substring(imgData.indexOf('(h') + 1, imgData.length - 1);
    } else {
        return;
    }
    console.log(`Processing ${postTitle}...`);

    try {
        new URL(imageurl);
    } catch (e) {
        console.warn(`Invalid image url ${imageurl}`);
        return;
    }

    try {
        const targetPostID = await lookUpTargetPost(postTitle);
        if (targetPostID === undefined) {
            console.warn(`No post exists for ${postTitle}`);
            return;
        }

        if (dryRun) {
            return;
        }

        const filePath = await downloadImage(imageurl, os.tmpdir());
        const imagePostId = await uploadImage(filePath);

        await setImageForPost(imagePostId, targetPostID);

        count++;
    } catch (e) {
        console.error(`Image not uploaded for ${postTitle} - an error occured.`);
        console.error(e);
        return;
    }
}

async function handlePage(records) {
    try {
        for (const record of records) {
            await handleAirtableRow(record);
        }
    } catch (e) {
        console.error('error inside eachPage => ', e);
        process.exit(1);
    }
}

//-----------------------------------------------------------------------------------------
async function downloadImage(url, dest) {
    const options = { url, dest };
    return (await download.image(options)).filename;
}


//-----------------------------------------------------------------------------------------
async function uploadImage(filePath) {
    var config = {
        method: 'post',
        url: `${wtWebsiteHost}/wp-json/wp/v2/media`,
        headers: {
            'Content-Type': 'application/json',
            "Content-Disposition": 'form-data; filename="image.jpeg"',
            "Content-Type": "image/jpeg",
        },
        auth: {
            username: wpUser,
            password: wpPassword
        },
        data: fs.readFileSync(filePath)
    };

    const res = await axios(config);

    const imagePostId = JSON.stringify(res.data.id);
    return imagePostId;
}


//-----------------------------------------------------------------------------------------
async function lookUpTargetPost(postTitle) {
    const config = {
        url: `${wtWebsiteHost}/wp-json/wp/v2/${postType}?slug=${postTitle}`,
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
        },
        auth: {
            username: wpUser,
            password: wpPassword
        }
    };
    let res = await axios(config)

    if (!res.data || res.data.length === 0) {
        return undefined;
    }

    const targetPostID = JSON.stringify(res.data[0].id);
    return targetPostID;
}


//-----------------------------------------------------------------------------------------
async function setImageForPost(imagePostId, targetPostId) {
    const data = {
        'acf': {
            [imageFieldWP]: imagePostId
        }
    }

    var config = {
        method: 'post',
        url: `${wtWebsiteHost}/wp-json/wp/v2/${postType}/${targetPostId}`,
        headers: {
            'Content-Type': 'application/json',
        },
        auth: {
            username: wpUser,
            password: wpPassword
        },
        data
    };
    await axios(config)
}

const base = new Airtable({ apiKey }).base(baseId);

const selectParams = allRecords ? { view } : { view, maxRecords };

base(table).select(selectParams).eachPage(function page(records, fetchNextPage) {
    handlePage(records).then(fetchNextPage);
}).then(error => {
    if (error) {
        console.error(error);
        process.exit(1);
    }
    console.log(`Done! Processed ${count} posts.`);
});