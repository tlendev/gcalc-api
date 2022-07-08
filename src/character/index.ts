import { Router } from 'express';
import puppeteer from 'puppeteer';
import { browser } from '../index';
import { Character, CharacterDetails } from './types/Character';

const charactersRouter = Router();

charactersRouter.get('/', async (req, res) => {
    const page = await browser.newPage();
    await page.goto('https://genshin.honeyhunterworld.com/db/char/characters/');

    const characters = await page.$$eval('.char_sea_cont', (els) => {
        return els.map((el) => {
            const name: string = el.querySelector('a:nth-child(3)').innerText;
            const card_url: string = el.querySelector('a > img').src;

            return { name, card_url } as Character;
        });
    });

    res.json(characters);
});

charactersRouter.get('/:char', async (req, res) => {
    const { char } = req.params;

    const page = await browser.newPage();
    await page.goto(`https://genshin.honeyhunterworld.com/db/char/${char}/`);

    // 404 guard
    if (await page.$('#content-main > div > div > h2')) {
        res.status(404).json({ message: `Character '${char}' not found` });
        return;
    }

    const name = await page.$eval(
        '.post > div > div > div > div.custom_title',
        (el) => {
            return el.innerText;
        }
    );
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
                    return el.src;
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
                    return el.src;
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
                    return el.src;
                }
            ),
        },
    };

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
                return el.src;
            }
        );
        await page.goBack();
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
                return el.src;
            }
        );
        await page.goBack();
        return { name, img_url };
    };

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
    const background_urls = {
        card: await page.$eval(
            '#live_data > table:nth-child(1) > tbody > tr:nth-child(1) > td > div > img',
            (el) => {
                return el.src;
            }
        ),
        gatcha: await page.$eval(
            '.post > div > div > div > div:nth-child(18) > div > div:nth-child(4) > a > img',
            (el) => {
                const pre: string = el.src;
                return pre.replace('_70', '');
            }
        ),
    };

    const details = {
        name,
        element,
        rarity,
        constellation,
        weapon_type,
        talents,
        materials,
        background_urls,
    } as CharacterDetails;

    res.json(details);
});

export { charactersRouter };
