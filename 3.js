const mineflayer = require('mineflayer');

const botUsername = 'FN_03';
const botPassword = 'fort54321';
const admin = 'Umid';
let shouldSendMoney = false;
var playerList = [];
var mcData;

const botOption = {
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.18.1',
};

init();

function init() {
    var bot = mineflayer.createBot(botOption);

    bot.on("messagestr", (message) => {
        if (message.startsWith("Skyblock »")) return;
        console.log(message);

        // Server restart bo'lsa chiqish
        if (message === "Server: Serverni kunlik restartiga 30 sekund qoldi") {
            bot.quit("20min");
        }

        // Ro‘yxatdan o‘tish yoki login qilish
        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }

        // 1. "claim" deb yozsangiz, bot /bal yozadi va flagni yoqadi
        if (message.toLowerCase().includes("pay")) {
            shouldSendMoney = true;
            bot.chat("/bal");
            return;
        }

        // 2. Agar "Balance: $" xabari kelsa va flag yoqilgan bo‘lsa
        if (shouldSendMoney && message.includes("Balance: $")) {
            let balanceStr = message.match(/Balance: \$([\d,]+)/);
            if (!balanceStr || balanceStr.length < 2) return;

            let balance = parseInt(balanceStr[1].replace(/,/g, ""));

            if (balance > 0) {
                bot.chat(`/pay ${admin} ${balance}`);
                shouldSendMoney = false; // Keyingi "claim"gacha kutadi
            }
        }
    });

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);

        // AFK oldini olish uchun har 3 daqiqada bir sakrash
        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        // Serverga kirganda /is warp sell yozish
        setTimeout(() => {
            bot.chat('/is warp afk');
        }, 1000);

    });


    // Admindan buyruqlarni bajarish
    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.replace("! ", "");
            bot.chat(command);
        }
    });

	
    bot.on('end', () => {
        setTimeout(init, 5000);
    });
}
