const express = require('express');
const axios = require('axios');

const router = express.Router();

// Replace with your MarketStack API key
const MARKETSTACK_API_KEY = 'adf7e0e9fd2d4d7f24b41f6b6a063068';
const BASE_URL = 'http://api.marketstack.com/v1';

// Store recent searches in the database
async function saveRecentSearch(userId, symbol) {
    try {
        // Remove the old entry if the user has already searched for the same symbol
        await db.execute('DELETE FROM recent_searches WHERE user_id = ? AND symbol = ?', [userId, symbol]);

        // Insert the new search
        await db.execute('INSERT INTO recent_searches (user_id, symbol) VALUES (?, ?)', [userId, symbol]);
    } catch (err) {
        console.error('Error saving recent search:', err);
    }
}

router.get('/stock', async (req, res) => {
    const { symbol } = req.query;
    const userId = req.session.userId;  // Assume userId is stored in session
  
    if (!symbol) {
        return res.json({ error: 'Stock symbol is required.' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'User not logged in.' });
    }
  
    try {
        const response = await axios.get(`${BASE_URL}/eod`, {
            params: {
                access_key: MARKETSTACK_API_KEY,
                symbols: symbol,
                limit: 1,
            },
        });

        const data = response.data;

        // Save the recent search to the database
        await saveRecentSearch(userId, symbol);

        if (data.data && data.data.length > 0) {
            const stock = data.data[0];
            res.json({
                symbol: stock.symbol,
                name: stock.name || 'N/A',
                price: stock.close,
                date: stock.date,
            });
        } else {
            res.json({ error: 'Stock data not found.' });
        }
    } catch (error) {
        console.error(error);
        res.json({ error: 'Please enter a valid stock symbol.' });
    }
});

module.exports = router;
