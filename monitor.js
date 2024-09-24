// If you are using Node.js 18+, you can use the native fetch.
// Otherwise, dynamically import node-fetch for older versions.
require('dotenv').config();
const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));
const TelegramBot = require('node-telegram-bot-api');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your chat ID
const TRON_WALLET_ADDRESSES = process.env.TRON_WALLET_ADDRESSES.split(','); // Comma-separated list of wallet addresses
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 10000; // Interval in milliseconds

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/myid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Your chat ID is: ${chatId}`);
});

async function checkTransfers() {
    try {
        console.log('Checking transfers for multiple addresses...');

        for (const TRON_WALLET_ADDRESS of TRON_WALLET_ADDRESSES) {
            const response = await fetch(`https://api.trongrid.io/v1/accounts/${TRON_WALLET_ADDRESS}/transactions/trc20?contractAddress=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&only_to=true&only_confirmed=true&limit=10&sort=-timestamp`);
            const data = await response.json();

            if (!data.success) {
                console.error(`Error checking transfers for ${TRON_WALLET_ADDRESS}:`, data.error);
                continue;
            }

            const transfers = data.data;
            console.log(`Found transfers for ${TRON_WALLET_ADDRESS}:`, transfers);

            if (transfers.length > 0) {
                const messages = transfers.map(transfer => {
                    const amount = transfer.token_info.decimals ? transfer.value / Math.pow(10, transfer.token_info.decimals) : transfer.value;
                    const fromAddress = transfer.from;
                    const toAddress = transfer.to;
                    const txID = transfer.transaction_id;

                    let message = `New USDT transfer for address ${TRON_WALLET_ADDRESS}:\nAmount: ${amount} USDT\n`;

                    if (fromAddress === TRON_WALLET_ADDRESS) {
                        message += `Sent to: ${toAddress}`;
                    } else if (toAddress === TRON_WALLET_ADDRESS) {
                        message += `Received from: ${fromAddress}`;
                    }

                    message += `\nTxID: ${txID}`;
                    return message;
                });

                console.log(`Sending messages for ${TRON_WALLET_ADDRESS}:`, messages);
                await Promise.all(messages.map(msg => sendTelegramMessage(msg)));
            } else {
                console.log(`No transfers found for ${TRON_WALLET_ADDRESS}.`);
            }
        }
    } catch (error) {
        console.error('Error checking transfers:', error);
    }
}

async function sendTelegramMessage(message) {
    try {
        console.log('Sending message to Telegram...');
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });
        const result = await response.json();
        console.log('Message sending result:', result);
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
}

// Start checking transfers at specified intervals
setInterval(checkTransfers, CHECK_INTERVAL);
