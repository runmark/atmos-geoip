
const axios = require('axios');
const cron = require('node-cron');

const geoInfoUrl = process.env.GEO_INFO_URL;
const postUrl = process.env.POST_URL;
const crontime = process.env.CRON_TIME;
// Authorization token
const authToken = process.env.TOKEN;
const nodeName = process.env.NODE_NAME;

cron.schedule(crontime, async () => {
    try {
        // 获取 GeoIP 信息
        const response = await axios.get(geoInfoUrl);

        if (response.data.loc && typeof response.data.loc === 'string') {
            const [latitude, longitude] = response.data.loc.split(',');

            const postData = {
                ...response.data,
                node_name: nodeName,
                latitude: latitude,
                longitude: longitude,
                readme: "atmos",
                update_time: new Date().toISOString() // 添加当前时间，格式为 ISO 8601
            }

            // 将获取到的数据 POST 到 pgsql db 中
            await axios.post(postUrl, postData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Prefer': 'resolution=merge-duplicates'
                }
            });

            console.log('GeoIP info successfully fetched and posted');
        }

    } catch (err) {
        console.error('Error in cron job: ', err.message);
    }
});




// const express = require('express');

// const app = express();
// const host = '0.0.0.0';
// const port = 8080;

// app.get('/api/geoip/self', async (req, res) => {
//     try {
//         const response = await axios.get(geoInfoUrl);
//         res.json(response.data);
//     } catch (err) {
//         console.error('Error fetching GeoIP info: ', err.message);
//         res.status(500).json({ error: 'Unable to fetch GeoIP info' });
//     }
// });

// app.listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`);
// });