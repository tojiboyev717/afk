const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const botUsername = 'FORTUNE_04';
const botPassword = 'fort54321';
const admin = 'Umid';
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
        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
    });

    bot.on("whisper", (username, message) => {
        if (username === admin && message === "quit") {
            bot.chat("Bot to‘xtatildi. 1 daqiqadan so‘ng qayta ulanadi.");
            bot.quit();
            setTimeout(() => {
                init();
            }, 60 * 1000);
        }
    });

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);

        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        setTimeout(() => {
            bot.chat('/is warp buy');
        }, 1000);

        setTimeout(() => {
            buyCoal(bot);
        }, 5000);
    });

    async function buyCoal(bot) {
        bot.chat("/is shop Ores");

        setTimeout(async () => {
            if (!bot.currentWindow) return;
            if (!bot.currentWindow.title.includes('Island Shop | Ores')) return;

            let freeSlots = bot.inventory.emptySlotCount();
            let coalStackSize = 64;
            let maxCoals = freeSlots * coalStackSize;

            if (maxCoals === 0) {
                if (bot.currentWindow) await bot.closeWindow(bot.currentWindow);
                setTimeout(() => depositCoal(bot), 3000);
                return;
            }

            const inventoryFullListener = async (username, message) => {
                if (message.includes("Your inventory is full!")) {
                    bot.removeListener("chat", inventoryFullListener);
                    if (bot.currentWindow) {
                        try {
                            await bot.closeWindow(bot.currentWindow);
                        } catch (e) {}
                    }
                    setTimeout(() => depositCoal(bot), 3000);
                }
            };
            bot.on("chat", inventoryFullListener);

            for (let i = 0; i < maxCoals; i++) {
                setTimeout(() => {
                    try {
                        if (bot.currentWindow) {
                            bot.simpleClick.leftMouse(11, 0, 0); // ❗ Slotni moslab qo‘ydim: slot 21 odatda coal
                        }
                    } catch (err) {}
                }, i * 100);
            }

            setTimeout(async () => {
                try {
                    if (bot.currentWindow) {
                        await bot.closeWindow(bot.currentWindow);
                    }
                } catch (err) {}
                setTimeout(() => depositCoal(bot), 3000);
            }, maxCoals * 100 + 1000);
        }, 3000);
    }

    async function depositCoal(bot) {
        const p1 = new Vec3(6185, 86, -591);  // Chesting joylashuvi
        let coals = bot.inventory.items().filter(item => item.name === 'coal');
        if (coals.length === 0) return;

        const chestBlock = await bot.blockAt(p1);
        if (!chestBlock || chestBlock.name !== 'chest') return;

        let chest;
        let attempts = 0;
        while (!chest && attempts < 3) {
            try {
                chest = await bot.openChest(chestBlock);
            } catch (error) {
                attempts++;
                await bot.waitForTicks(20);
            }
        }

        if (!chest) return;

        for (let i = 0; i < coals.length; i++) {
            const coal = coals[i];
            try {
                await chest.deposit(coal.type, null, coal.count);
            } catch (error) {}
        }

        await chest.close();

        setTimeout(() => {
            setTimeout(() => buyCoal(bot), 5000);
        }, 2000);
    }

    bot.on('end', () => {
        setTimeout(init, 5000);
    });
}
