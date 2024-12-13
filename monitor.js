// Import required modules
const fetch = globalThis.fetch || ((...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)));
const TelegramBot = require('node-telegram-bot-api');

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your bot token
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // Your chat ID
const TRON_WALLET_ADDRESSES = process.env.TRON_WALLET_ADDRESSES.split(','); // Comma-separated list of wallet addresses
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || 100000; // Interval in milliseconds (100 seconds)

// Telegram bot setup
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/myid/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Your chat ID is: ${chatId}`);
    console.log(`Received /myid command from chat ID: ${chatId}`);
});

// Helper function to add a delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Store the processed transaction IDs in a Set
const processedTransactions = new Set();

async function sendTelegramMessage(message) {
    try {
        console.log('Sending message to Telegram:', message);
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message
            })
        });

        const result = await response.json();
        console.log('Message sending result:', result);

        if (!result.ok && result.error_code === 429) {
            const retryAfter = result.parameters.retry_after || 1;
            console.warn(`Rate limit hit, retrying after ${retryAfter} seconds...`);
            await sleep(retryAfter * 1000); // Sleep for the retry_after duration in milliseconds
        }

    } catch (error) {
        console.error('Error sending message to Telegram:', error);
    }
}

async function checkTransfers() {
    let totalProcessed = 0; // Track total processed transactions
    let newTransactionsCount = 0; // Track new transactions found

    try {
        console.log('Starting to check transfers for multiple addresses...');

        // Get the start of the current day in UNIX timestamp (milliseconds)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set to the start of the day
        const startOfDayTimestamp = startOfDay.getTime();

        console.log(`Filtering transactions from the start of the day: ${startOfDayTimestamp} (Unix Timestamp)`);

        for (const TRON_WALLET_ADDRESS of TRON_WALLET_ADDRESSES) {
            console.log(`Checking transfers for address: ${TRON_WALLET_ADDRESS}`);

            // Fetch USDT (TRC-20) Transactions
            const trc20Url = `https://api.trongrid.io/v1/accounts/${TRON_WALLET_ADDRESS}/transactions/trc20?only_to=true&only_confirmed=true&limit=10&sort=-timestamp`;
            console.log(`Fetching USDT data from URL: ${trc20Url}`);

            const trc20Response = await fetch(trc20Url);
            const trc20Data = await trc20Response.json();

            if (!trc20Data.success) {
                console.error(`Error checking USDT transfers for ${TRON_WALLET_ADDRESS}:`, trc20Data.error);
            } else {
                const usdtTransfers = trc20Data.data.filter(transfer => transfer.block_timestamp >= startOfDayTimestamp);
                console.log(`Found USDT transfers for ${TRON_WALLET_ADDRESS}:`, usdtTransfers);

                const newUsdtMessages = usdtTransfers
                    .filter(transfer => !processedTransactions.has(transfer.transaction_id))
                    .map(transfer => {
                        // Mark transaction as processed
                        processedTransactions.add(transfer.transaction_id);
                        totalProcessed++;

                        const amount = transfer.token_info.decimals ? transfer.value / Math.pow(10, transfer.token_info.decimals) : transfer.value;
                        const fromAddress = transfer.from;
                        const toAddress = transfer.to;
                        const txID = transfer.transaction_id;
                        const txUrl = `https://tronscan.org/#/transaction/${txID}`;

                        let message = `New USDT transfer for address ${TRON_WALLET_ADDRESS}:\nAmount: ${amount} USDT\n`;

                        if (fromAddress === TRON_WALLET_ADDRESS) {
                            message += `Sent to: ${toAddress}`;
                        } else if (toAddress === TRON_WALLET_ADDRESS) {
                            message += `Received from: ${fromAddress}`;
                        }

                        message += `\nTransaction URL: ${txUrl}`;
                        return message;
                    });

                newTransactionsCount += newUsdtMessages.length;
                for (const msg of newUsdtMessages) {
                    await sendTelegramMessage(msg);
                    await sleep(1000); // Avoid rate limits
                }
            }

            // Fetch TRX Transactions
            const trxUrl = `https://api.trongrid.io/v1/accounts/${TRON_WALLET_ADDRESS}/transactions?only_to=true&only_confirmed=true&limit=10&sort=-timestamp`;
            console.log(`Fetching TRX data from URL: ${trxUrl}`);

            const trxResponse = await fetch(trxUrl);
            const trxData = await trxResponse.json();

            if (!trxData.success) {
                console.error(`Error checking TRX transfers for ${TRON_WALLET_ADDRESS}:`, trxData.error);
            } else {
                const trxTransfers = trxData.data.filter(transfer => transfer.block_timestamp >= startOfDayTimestamp);
                console.log(`Found TRX transfers for ${TRON_WALLET_ADDRESS}:`, trxTransfers);

                const newTrxMessages = trxTransfers
                    .filter(transfer => !processedTransactions.has(transfer.txID))
                    .map(transfer => {
                        // Mark transaction as processed
                        processedTransactions.add(transfer.txID);
                        totalProcessed++;

                        const amount = transfer.raw_data.contract[0].parameter.value.amount / Math.pow(10, 6); // TRX is 6 decimals
                        const fromAddress = transfer.raw_data.contract[0].parameter.value.owner_address
                            ? transfer.raw_data.contract[0].parameter.value.owner_address
                            : null;
                        const toAddress = transfer.raw_data.contract[0].parameter.value.to_address
                            ? transfer.raw_data.contract[0].parameter.value.to_address
                            : null;
                        const txID = transfer.txID;
                        const txUrl = `https://tronscan.org/#/transaction/${txID}`;

                        let message = `New TRX transfer for address ${TRON_WALLET_ADDRESS}:\nAmount: ${amount} TRX\n`;

                        if (fromAddress === TRON_WALLET_ADDRESS) {
                            message += `Sent to: ${toAddress}`;
                        } else if (toAddress === TRON_WALLET_ADDRESS) {
                            message += `Received from: ${fromAddress}`;
                        }

                        message += `\nTransaction URL: ${txUrl}`;
                        return message;
                    });

                newTransactionsCount += newTrxMessages.length;
                for (const msg of newTrxMessages) {
                    await sendTelegramMessage(msg);
                    await sleep(1000); // Avoid rate limits
                }
            }
        }

        // Log the summary
        if (newTransactionsCount > 0) {
            console.log(`Processed ${newTransactionsCount} new transactions. Total processed transactions in this check: ${totalProcessed}`);
        } else {
            console.log(`No new transactions. ${totalProcessed} transactions processed so far.`);
        }
    } catch (error) {
        console.error('Error checking transfers:', error);
    } finally {
        console.log(`Waiting for ${CHECK_INTERVAL} milliseconds before the next check...`);
        setTimeout(checkTransfers, CHECK_INTERVAL);
    }
}

// Run the checkTransfers function immediately on startup
console.log('Starting initial transfer check...');
checkTransfers();
