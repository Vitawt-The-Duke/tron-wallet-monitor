# This code is a custom alerter for receiving information about USDT transfers on a specific accounts.

To receive information via a Telegram bot, you need to obtain your personal chat ID with the bot on Telegram.

At first you need to create your own bot in telegram. Just type @BotFather in search in Telegram
At second add your bot token to this code and launch "node index.js"



# How to get Telegram Bot Chat ID

**Content :**
1. [Create a Telegram Bot and get a Bot Token](#create-a-telegram-bot-and-get-a-bot-token)
1. [Get Chat ID for a Private Chat](#get-chat-id-for-a-private-chat)
1. [Get Chat ID for a Channel](#get-chat-id-for-a-channel)
1. [Get Chat ID for a Group Chat](#get-chat-id-for-a-group-chat)
1. [Get Chat ID for a Topic in a Group Chat](#get-chat-id-for-a-topic-in-a-group-chat)

## Create a Telegram Bot and get a Bot Token

1. Open Telegram application then search for `@BotFather`
1. Click Start
1. Click Menu -> /newbot or type `/newbot` and hit Send
1. Follow the instruction until we get message like so
    ```
    Done! Congratulations on your new bot. You will find it at t.me/new_bot.
    You can now add a description.....

    Use this token to access the HTTP API:
    63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c
    Keep your token secure and store it safely, it can be used by anyone to control your bot.

    For a description of the Bot API, see this page: https://core.telegram.org/bots/api
    ```
1. So here is our bot token `63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c` (make sure we don't share it to anyone).

[Back to top &uarr;](#how-to-get-telegram-bot-chat-id)

## Get Chat ID for a Private Chat

1. Search and open our new Telegram bot
1. Click Start or send a message
1. Open this URL in a browser `https://api.telegram.org/bot{our_bot_token}/getUpdates`   
    - See we need to prefix our token with a word `bot`
    - Eg: `https://api.telegram.org/bot63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c/getUpdates`
1. We will see a json like so
    ```
    {
      "ok": true,
      "result": [
        {
          "update_id": 83xxxxx35,
          "message": {
            "message_id": 2643,
            "from": {...},
            "chat": {
              "id": 21xxxxx38,
              "first_name": "...",
              "last_name": "...",
              "username": "@username",
              "type": "private"
            },
            "date": 1703062972,
            "text": "/start"
          }
        }
      ]
    }
    ```
1. Check the value of `result.0.message.chat.id`, and here is our Chat ID: `21xxxxx38`
3. Let's try to send a message: `https://api.telegram.org/bot63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c/sendMessage?chat_id=21xxxxx38&text=test123`
4. When we set the bot token and chat id correctly, the message `test123` should be arrived on our Telegram bot chat.

[Back to top &uarr;](#how-to-get-telegram-bot-chat-id)

## Get Chat ID for a Channel

1. Add our Telegram bot into a channel
1. Send a message to the channel
1. Open this URL `https://api.telegram.org/bot{our_bot_token}/getUpdates`
1. We will see a json like so
    ```
    {
      "ok": true,
      "result": [
        {
          "update_id": 838xxxx36,
          "channel_post": {...},
            "chat": {
              "id": -1001xxxxxx062,
              "title": "....",
              "type": "channel"
            },
            "date": 1703065989,
            "text": "test"
          }
        }
      ]
    }
    ```
1. Check the value of `result.0.channel_post.chat.id`, and here is our Chat ID: `-1001xxxxxx062`
1. Let's try to send a message: `https://api.telegram.org/bot63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c/sendMessage?chat_id=-1001xxxxxx062&text=test123`
1. When we set the bot token and chat id correctly, the message `test123` should be arrived on our Telegram channel.

[Back to top &uarr;](#how-to-get-telegram-bot-chat-id)

## Get Chat ID for a Group Chat

The easiest way to get a group chat ID is through a Telegram desktop application.

1. Open Telegram in a desktop app
1. Add our Telegram bot into a chat group
1. Send a message to the chat group
1. Right click on the message and click `Copy Message Link`
    - We will get a link like so: `https://t.me/c/194xxxx987/11/13`
    - The pattern: `https://t.me/c/{group_chat_id}/{group_topic_id}/{message_id}`
    - So here is our Chat ID: `194xxxx987`
1. To use the group chat ID in the API, we need to prefix it with the number `-100`, like so: `-100194xxxx987`
1. Now let's try to send a message: `https://api.telegram.org/bot63xxxxxx71:AAFoxxxxn0hwA-2TVSxxxNf4c/sendMessage?chat_id=-100194xxxx987&text=test123`
1. When we set the bot token and chat id correctly, the message `test123` should be arrived on our group chat.

[Back to top &uarr;](#how-to-get-telegram-bot-chat-id)

## Get Chat ID for a Topic in a Group Chat

In order to send a message to a specific topic on Telegram group, we need to get the topic ID.

1. Similar to steps above, after we click the `Copy Message Link`, we will get a link like: `https://t.me/c/194xxxx987/11/13`, so the group Topic ID is `11`.
1. Now we can use it like so (see `message_thread_id`): `https://api.telegram.org/bot7xxxxx779:AAEuRxxxxxxxxxxhJf2-NmvHN3OPc/sendMessage?chat_id=-100194xxxx987&message_thread_id=11&text=test123`
1. When we set the bot token and chat id correctly, the message `test123` should be arrived inside our group chat topic.
    
[Back to top &uarr;](#how-to-get-telegram-bot-chat-id)