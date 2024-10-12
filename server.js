const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Handle requests to fetch the main news page or any paginated page
app.get('/news', async (req, res) => {
    try {
        console.log(req.query)
        const nextPage = req.query.p || 'news';
        console.log(nextPage)
        const hackerNewsUrl = `https://news.ycombinator.com?p=${nextPage}`;

        console.log(`Fetching page: ${hackerNewsUrl}`);
        const response = await axios.get(hackerNewsUrl);
        res.send(response.data);
    } catch (error) {
        res.status(500).send('Error fetching Hacker News');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

