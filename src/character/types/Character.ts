export interface Character {
    name: string;
    card_url: string;
}

export interface CharacterDetails {
    name: string;
    element: 'anemo' | 'pyro' | 'cryo' | 'hydro' | 'geo' | 'dendro' | 'electro';
    rarity: number;
    constellation: string;
    weapon_type: 'Sword' | 'Claymore' | 'Bow' | 'Catalyst' | 'Polearm';
    talents: {
        normal: {
            name: string;
            img_url: string;
        };
        skill: {
            name: string;
            img_url: string;
        };
        burst: {
            name: string;
            img_url: string;
        };
    };
    materials: {
        gem: {
            green: {
                name: string;
                img_url: string;
            };
            blue: {
                name: string;
                img_url: string;
            };
            pink: {
                name: string;
                img_url: string;
            };
            gold: {
                name: string;
                img_url: string;
            };
        };
        natural: {
            name: string;
            img_url: string;
        };
        boss: {
            name: string;
            img_url: string;
        };
        mob: {
            gray: {
                name: string;
                img_url: string;
            };
            green: {
                name: string;
                img_url: string;
            };
            blue: {
                name: string;
                img_url: string;
            };
        };
        weekly: {
            name: string;
            img_url: string;
        };
        book: {
            green: {
                name: string;
                img_url: string;
            };
            blue: {
                name: string;
                img_url: string;
            };
            pink: {
                name: string;
                img_url: string;
            };
        };
    };
    background_urls: {
        card: string;
        gatcha: string;
    };
}
