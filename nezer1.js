const mineflayer = require('mineflayer');
const Vec3 = require('vec3');

const botUsername = 'FORTUNE_01';
const botPassword = 'fort54321';

const p1 = [6184, 96, -603];
const p2 = [6190, 95, -595];

function range(p1, p2) {
    p1 = parseInt(p1);
    p2 = parseInt(p2);
    let res = [];
    if (p1 > p2) {
        for (let j = p1; j >= p2; j--) res.push(j);
    } else {
        for (let j = p1; j <= p2; j++) res.push(j);
    }
    return res;
}

const xrange = range(p1[0], p2[0]);
const yrange = range(p1[1], p2[1]);
const zrange = range(p1[2], p2[2]);

function createBot() {
    const bot = mineflayer.createBot({
    host: 'hypixel.uz',
    port: 25565,
    username: botUsername,
    password: botPassword,
    version: '1.17.1',
});


    let status = "starting";

    bot.once('spawn', async () => {

        status = "waiting_for_login";

        // Serverdan kelgan xabarlarni tinglash
        bot.on("messagestr", (message) => {
        console.log(message);

        if (message.includes("register")) {
            bot.chat(`/register ${botPassword} ${botPassword}`);
        }
        if (message.includes("login")) {
            bot.chat(`/login ${botPassword}`);
        }
    });

        // 1. Warp
        setTimeout(() => {
            bot.chat('/is warp miner1');
        }, 1000);

        // 3. Qazishni boshlash
        setTimeout(() => {
            digZigZag();
        }, 3000);
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


    async function digZigZag() {
        if (!bot.heldItem || !bot.heldItem.name.includes('pickaxe')) {
            const pickaxe = bot.inventory.items().find(i => i.name.includes('pickaxe'));
            if (pickaxe) {
                await bot.equip(pickaxe, 'hand');
            } else {
                return bot.quit();
            }
        }

        async function digColumn(x, zList, yList) {
            let qazildi = false;
            for (let z of zList) {
                for (let y of yList) {
                    const pos = new Vec3(x, y, z);
                    const block = bot.blockAt(pos);
                    if (block && block.name !== 'air' && bot.canDigBlock(block)) {
                        try {
                            await bot.dig(block, true);
                            qazildi = true;
                        } catch (err) {
                        }
                    }
                }
            }
            return qazildi;
        }

        async function startLoop() {
            while (true) {
                let qazilgan = false;

                for (let i = 0; i < xrange.length; i++) {
                    const ok = await digColumn(xrange[i], zrange, yrange);
                    qazilgan = qazilgan || ok;
                }

                for (let i = xrange.length - 1; i >= 0; i--) {
                    const ok = await digColumn(xrange[i], zrange.slice().reverse(), yrange.slice().reverse());
                    qazilgan = qazilgan || ok;
                }

                // Agar hech narsa qazilmagan bo‘lsa 1s kutamiz va qayta urinib ko‘ramiz
                if (!qazilgan) {
                    await bot.waitForTicks(20); // 1 sekund
                }
            }
        }

        startLoop();
    }

    bot.on('end', () => {
        setTimeout(createBot, 5000);
    });
}

createBot();
