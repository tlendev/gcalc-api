import puppeteer, { Browser, Page } from 'puppeteer';
import { writeFile, readFile, access } from 'fs/promises';
import { CharacterDetails } from 'src/character/types/Character';
import { PathLike } from 'fs';
import { v4 as uuid } from 'uuid';

interface Meta {
    count: number;
    names: Array<string>;
}

const parseJson = async (path: string): Promise<Meta> => {
    const buf = await readFile(path);
    return JSON.parse(buf.toString());
};

const exists = async (path: PathLike) => {
    try {
        await access(path);
        return true;
    } catch {
        return false;
    }
};

const scrapeCharacter = async (name: string, url: string, browser: Browser) => {
    const imgs: Set<string> = new Set();
    console.log('🔃 Begin scrapping: ', name);
    if (
        await exists(
            `./collection/${name.replaceAll(' ', '-').toLowerCase()}.json`
        )
    ) {
        console.log(`✅ Character ${name} exists, skipping...`);
        return false;
    }
    const page = await browser.newPage();
    await page.goto(url);

    console.log('🔃 Getting basic info, this may take a while...');
    const element = await page.$eval(
        '#live_data > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2) > img',
        (el) => {
            const gs = [
                'anemo',
                'pyro',
                'cryo',
                'hydro',
                'geo',
                'dendro',
                'electro',
            ];
            let current = '';
            gs.forEach((g) => {
                if (el.src.search(g) !== -1) {
                    current = g;
                    return;
                }
            });
            return current;
        }
    );

    const rarity = await page.$eval(
        '#live_data > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(2)',
        (el) => {
            return el.children.length;
        }
    );
    const constellation = await page.$eval(
        '#live_data > table:nth-child(1) > tbody > tr:nth-child(8) > td:nth-child(2)',
        (el) => {
            return el.innerText;
        }
    );
    const weapon_type = await page.$eval(
        '#live_data > table:nth-child(1) > tbody > tr:nth-child(5) > td:nth-child(2) > a',
        (el) => {
            return el.innerText;
        }
    );

    console.log('🔃 Getting talents, this may take a while...');
    const talents = {
        normal: {
            name: await page.$eval(
                '#live_data > table:nth-child(7) > tbody > tr:nth-child(1) > td:nth-child(2) > a',
                (el) => {
                    return el.innerText;
                }
            ),
            img_url: await page.$eval(
                '#live_data > table:nth-child(7) > tbody > tr:nth-child(1) > td:nth-child(1) > div > img',
                (el) => {
                    const url = el.src
                        .replace('https://genshin.honeyhunterworld.com/', '')
                        .replaceAll('/', '-');
                    return url;
                }
            ),
        },
        skill: {
            name: await page.$eval(
                '#live_data > table:nth-child(9) > tbody > tr:nth-child(1) > td:nth-child(2) > a',
                (el) => {
                    return el.innerText;
                }
            ),
            img_url: await page.$eval(
                '#live_data > table:nth-child(9) > tbody > tr:nth-child(1) > td:nth-child(1) > div > img',
                (el) => {
                    const url = el.src
                        .replace('https://genshin.honeyhunterworld.com/', '')
                        .replaceAll('/', '-');
                    return url;
                }
            ),
        },
        burst: {
            name: await page.$eval(
                '#live_data > table:nth-child(11) > tbody > tr:nth-child(1) > td:nth-child(2) > a',
                (el) => {
                    return el.innerText;
                }
            ),
            img_url: await page.$eval(
                '#live_data > table:nth-child(11) > tbody > tr:nth-child(1) > td:nth-child(1) > div > img',
                (el) => {
                    const url = el.src
                        .replace('https://genshin.honeyhunterworld.com/', '')
                        .replaceAll('/', '-');
                    return url;
                }
            ),
        },
    };

    imgs.add(talents.normal.img_url);
    imgs.add(talents.skill.img_url);
    imgs.add(talents.burst.img_url);

    const getItem = async (path: string) => {
        let base = '';
        const len = await page.$eval(
            '#live_data > div:nth-child(5) > table > tbody > tr:nth-child(13)',
            (el) => el.children.length
        );
        if (len === 8) {
            base =
                '#live_data > div:nth-child(5) > table > tbody > tr:nth-child(13) > td:nth-child(8)';
        } else if (len === 9) {
            base =
                '#live_data > div:nth-child(5) > table > tbody > tr:nth-child(13) > td:nth-child(9)';
        } else {
            throw new Error('More than 9 elements in base');
        }
        const url = await page.$eval(`${base} > ${path}`, (el) => el.href);
        await page.goto(url);
        const name: string = await page.$eval(
            '.post > div > div > div > div.custom_title',
            (el) => {
                return el.innerText;
            }
        );
        const img_url: string = await page.$eval(
            '.post > div > div > div > table.item_main_table > tbody > tr:nth-child(1) > td:nth-child(1) > div > img',
            (el) => {
                const url = el.src
                    .replace('https://genshin.honeyhunterworld.com/', '')
                    .replaceAll('/', '-');
                return url;
            }
        );
        imgs.add(img_url);
        await page.goBack();
        console.log(`✅ Item ${name} success`);
        return { name, img_url };
    };

    const getSkillItem = async (path: string) => {
        const url = await page.$eval(path, (el) => el.href);
        await page.goto(url);
        const name: string = await page.$eval(
            '.post > div > div > div > div.custom_title',
            (el) => {
                return el.innerText;
            }
        );
        const img_url: string = await page.$eval(
            '.post > div > div > div > table.item_main_table > tbody > tr:nth-child(1) > td:nth-child(1) > div > img',
            (el) => {
                const url = el.src
                    .replace('https://genshin.honeyhunterworld.com/', '')
                    .replaceAll('/', '-');
                return url;
            }
        );
        imgs.add(img_url);
        await page.goBack();
        console.log(`✅ Item ${name} success`);
        return { name, img_url };
    };

    console.log('🔃 Getting materials and skills, this will take a while...');
    const materials = {
        gem: {
            green: await getItem('div:nth-child(2) > a'),
            blue: await getItem('div:nth-child(3) > a'),
            pink: await getItem('div:nth-child(4) > a'),
            gold: await getItem('div:nth-child(5) > a'),
        },
        natural: await getItem('div:nth-child(1) > a'),
        boss: await getItem('div:nth-child(9) > a'),
        mob: {
            gray: await getItem('div:nth-child(6) > a'),
            green: await getItem('div:nth-child(7) > a'),
            blue: await getItem('div:nth-child(8) > a'),
        },
        weekly: await getSkillItem(
            '#live_data > div:nth-child(14) > table > tbody > tr:nth-child(7) > td:nth-child(2) > div:nth-child(3) > a'
        ),
        book: {
            green: await getSkillItem(
                '#live_data > div:nth-child(14) > table > tbody > tr:nth-child(2) > td:nth-child(2) > div:nth-child(1) > a'
            ),
            blue: await getSkillItem(
                '#live_data > div:nth-child(14) > table > tbody > tr:nth-child(3) > td:nth-child(2) > div:nth-child(1) > a'
            ),
            pink: await getSkillItem(
                '#live_data > div:nth-child(14) > table > tbody > tr:nth-child(7) > td:nth-child(2) > div:nth-child(1) > a'
            ),
        },
    };

    console.log('🔃 Getting backgrounds, this may take a while...');
    const background_urls = {
        card: await page.$eval(
            '#live_data > table:nth-child(1) > tbody > tr:nth-child(1) > td > div > img',
            (el) => {
                const url = el.src
                    .replace('https://genshin.honeyhunterworld.com/', '')
                    .replaceAll('/', '-');
                return url;
            }
        ),
        gatcha: await page.$eval(
            '.post > div > div > div > div:nth-child(18) > div > div:nth-child(4) > a > img',
            (el) => {
                const url = el.src
                    .replace('https://genshin.honeyhunterworld.com/', '')
                    .replace('_70', '')
                    .replaceAll('/', '-');
                return url;
            }
        ),
    };
    imgs.add(background_urls.card);
    imgs.add(background_urls.gatcha);

    const details = {
        id: uuid(),
        name,
        element,
        rarity,
        constellation,
        weapon_type,
        talents,
        materials,
        background_urls,
    } as CharacterDetails;

    await writeFile(
        `./collection/${name.replaceAll(' ', '-').toLowerCase()}.json`,
        JSON.stringify(details)
    );

    const saveImg = async (path: string, page: Page) => {
        const url =
            'https://genshin.honeyhunterworld.com/' + path.replaceAll('-', '/');
        if (
            await exists(
                `./collection/media/${path
                    .replaceAll('/', '-')
                    .replace('.png', '')}.webp`
            )
        ) {
            console.log(
                `✅ Img ${path.replaceAll(
                    '/',
                    '-'
                )} already exists, skipping...`
            );
            return;
        }
        const view = await page.goto(url);
        if (!view) {
            throw new Error(`URL for ${url} is invalid or was moved`);
        }
        await writeFile(
            `./collection/media/${path
                .replaceAll('/', '-')
                .replace('.png', '')}.webp`,
            await view.buffer(),
            'base64'
        );
        console.log(`✅ Img ${path.replaceAll('/', '-')} saved`);
    };

    console.log('🔃 Saving images, this may take a while...');

    const urls = [...imgs];
    for (let i = 0; i < urls.length; i++) {
        console.log(`🔃 Saving ${i + 1} / ${urls.length}`);
        await saveImg(urls[i], page);
    }
    console.log(`✅ ${name} added to collection`);
    return true;
};

/**
 * Gets the list of all characters, updates meta.json to include missing names if any are found
 */
const regenerateCollection = async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { height: 99999, width: 1080 },
        timeout: 3_000_000, // 300 seconds - 5 min
    });
    const page = await browser.newPage();
    await page.goto('https://genshin.honeyhunterworld.com/db/char/characters/');

    const testChara = await page.$$eval('.char_sea_cont', (els) => {
        return els.map((el) => {
            const name: string = el.querySelector('a:nth-child(3)').innerText;
            const url: string = el.querySelector('a:nth-child(3)').href;
            return { name, url };
        });
    });
    const { count, names } = await parseJson('./collection/meta.json');
    let skip = true;
    testChara.forEach((char) => {
        if (!names.includes(char.name)) {
            skip = false;
        }
    });
    if (skip) {
        console.log('✅ Collection up to date, nothing changed');
        process.exit();
    }
    console.log('🔃 Collection out of date, rebuilding...');

    for (let i = 0, len = testChara.length; i < len; i++) {
        const write = await scrapeCharacter(
            testChara[i].name,
            testChara[i].url,
            browser
        );
        if (write) {
            await writeFile(
                './collection/meta.json',
                JSON.stringify({
                    count: count + 1,
                    names: [...names, testChara[i].name],
                })
            );
        }
    }
    console.log(`✅ Collection updated, ${count} -> ${testChara.length}`);
};

(async () => await regenerateCollection())();
