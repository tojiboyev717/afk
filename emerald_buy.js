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
            buyEmerald(bot);
        }, 5000);
    });
    
    // WHISPER LISTENER (admin uchun)
    bot.on('whisper', (username, message) => {
        if (username !== admin) return;

        // ❗ Komanda: "3 minut"
        const match = message.toLowerCase().match(/^(\d+)\s*minut$/);
        if (match) {
            const minutes = parseInt(match[1]);
            const ms = minutes * 60 * 1000;

            bot.chat(`/msg ${admin} ${minutes} daqiqaga chiqyapman...`);
            isManualQuit = true;
            bot.quit();

            setTimeout(() => {
                isManualQuit = false;
                init();
            }, ms);
            return;
        }

        // ❗ Komanda: "! buyruq"
        if (message.startsWith("! ")) {
            const command = message.slice(2);
            bot.chat(command);
        }
    });
    
    async function buyEmerald(bot) {
        bot.chat("/is shop Ores");

        setTimeout(async () => {
            if (!bot.currentWindow) {
                return;
            }

            if (!bot.currentWindow.title.includes('Island Shop | Ores')) {
                return;
            }

            let freeSlots = bot.inventory.emptySlotCount();
            let emeraldStackSize = 64;
            let maxEmeralds = freeSlots * emeraldStackSize;

            // 🛑 Agar inventory to‘la bo‘lsa
            if (maxEmeralds === 0) {
                if (bot.currentWindow) {
                    await bot.closeWindow(bot.currentWindow);
                }
                setTimeout(() => depositEmerald(bot), 3000);
                return;
            }

            // ✅ Faqat bitta marta ishlaydigan chat listener
            const inventoryFullListener = async (username, message) => {
                if (message.includes("Your inventory is full!")) {
                    bot.removeListener("chat", inventoryFullListener); // listenerni olib tashlaymiz
                    if (bot.currentWindow) {
                        try {
                            await bot.closeWindow(bot.currentWindow);
                        } catch (e) {
                        }
                    }
                    setTimeout(() => depositEmerald(bot), 3000);
                }
            };
            bot.on("chat", inventoryFullListener);

            // 🟩 Emerald sotib olish
            for (let i = 0; i < maxEmeralds; i++) {
                setTimeout(() => {
                    try {
                        if (bot.currentWindow) {
                            bot.simpleClick.leftMouse(22, 0, 0);
                        }
                    } catch (err) {
                    }
                }, i * 100);
            }

            // ✅ Oxirida avtomatik ravishda window yopiladi va chestga joylaydi
            setTimeout(async () => {
                try {
                    if (bot.currentWindow) {
                        await bot.closeWindow(bot.currentWindow);
                    }
                } catch (err) {
                }
                setTimeout(() => depositEmerald(bot), 3000);
            }, maxEmeralds * 100 + 1000);
        }, 3000);
    }

async function depositEmerald(bot) {
    const p1 = new Vec3(6192, 86, -1359);  // Coordinates of the chest

    let emeralds = bot.inventory.items().filter(item => item.name === 'emerald');

    if (emeralds.length === 0) {
        return;
    }

    // Get chest block at given position
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

    // Attempt to deposit emeralds
    for (let i = 0; i < emeralds.length; i++) {
        const emerald = emeralds[i];
        try {
            await chest.deposit(emerald.type, null, emerald.count);
        } catch (error) {
        }
    }

    await chest.close();

    // After depositing emeralds, attempt to buy more
    setTimeout(() => {
        setTimeout(() => buyEmerald(bot), 5000);
    }, 2000);
}


    bot.on('end', () => {
        setTimeout(init, 5000);
    });
}
