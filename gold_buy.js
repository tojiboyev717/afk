const mineflayer = require('mineflayer');
const { Vec3 } = require('vec3');

const botUsername = 'FORTUNE_Miner';
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

    bot.on("spawn", () => {
        mcData = require("minecraft-data")(bot.version);

        setInterval(() => {
            bot.setControlState("jump", true);
            setTimeout(() => bot.setControlState("jump", false), 500);
        }, 3 * 60 * 1000);

        setTimeout(() => {
            bot.chat('/is warp gold');
        }, 1000);

        setTimeout(() => {
            buyGold(bot);
        }, 5000);
    });

    bot.on("whisper", (usernameSender, message) => {
        if (usernameSender === admin && message.startsWith("! ")) {
            const command = message.replace("! ", "");
            bot.chat(command);
        }
    });

    async function buyGold(bot) {
        bot.chat("/is shop Ores");

        setTimeout(async () => {
            if (!bot.currentWindow) {
                return;
            }

            if (!bot.currentWindow.title.includes('Island Shop | Ores')) {
                return;
            }

            let freeSlots = bot.inventory.emptySlotCount();
            let goldStackSize = 64;
            let maxGold = freeSlots * goldStackSize;

            if (maxGold === 0) {
                if (bot.currentWindow) {
                    await bot.closeWindow(bot.currentWindow);
                }
                setTimeout(() => depositGold(bot), 3000);
                return;
            }

            const inventoryFullListener = async (username, message) => {
                if (message.includes("Your inventory is full!")) {
                    bot.removeListener("chat", inventoryFullListener);
                    if (bot.currentWindow) {
                        try {
                            await bot.closeWindow(bot.currentWindow);
                        } catch (e) {
                        }
                    }
                    setTimeout(() => depositGold(bot), 3000);
                }
            };
            bot.on("chat", inventoryFullListener);

            for (let i = 0; i < maxGold; i++) {
                setTimeout(() => {
                    try {
                        if (bot.currentWindow) {
                            bot.simpleClick.leftMouse(15, 0, 0);
                        }
                    } catch (err) {
                    }
                }, i * 100);
            }

            setTimeout(async () => {
                try {
                    if (bot.currentWindow) {
                        await bot.closeWindow(bot.currentWindow);
                    }
                } catch (err) {
                }
                setTimeout(() => depositGold(bot), 3000);
            }, maxGold * 100 + 1000);
        }, 3000);
    }

    async function depositGold(bot) {
        const p1 = new Vec3(6239, 61, -591);

        let golds = bot.inventory.items().filter(item => item.name === 'gold_ingot');

        if (golds.length === 0) {
            return;
        }

        const chestBlock = await bot.blockAt(p1);

        if (!chestBlock || chestBlock.name !== 'chest') {
            return;
        }

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

        if (!chest) {
            return;
        }

        for (let i = 0; i < golds.length; i++) {
            const gold = golds[i];
            try {
                await chest.deposit(gold.type, null, gold.count);
            } catch (error) {
            }
        }

        await chest.close();

        setTimeout(() => {
            setTimeout(() => buyGold(bot), 5000);
        }, 2000);
    }

    bot.on('end', () => {
        setTimeout(init, 5000);
    });
}
