export interface CardEntity {
    id: string;
    name: string;
    types: string;
    rarity?: string;
    evolveTo?: string;
    weaknesses?: string;
    image: string[];
}