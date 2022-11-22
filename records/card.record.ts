import {CardEntity} from "../types";
import {ValidationError} from "../utils/handleErrors";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";

type CardRecordResults = [CardEntity[], FieldPacket[]];

export class CardRecord implements CardEntity {
    id: string;
    name: string;
    types: string;
    rarity?: string;
    evolveTo?: string;
    weaknesses?: string;
    image: string[];

    constructor(obj: CardEntity) {
        if (!obj.id) {
            throw new ValidationError('Pole"id" nie może być puste! ');
        }
        if (typeof obj.id !== 'string') {
            throw new ValidationError('Format danych pola "id" jest nieprawdiłowy!');
        }
        if (!obj.name) {
            throw new ValidationError('Pole "name" nie może być puste!');
        }
        if (typeof obj.name !== 'string') {
            throw new ValidationError('Format danych pola "name" jest nieprawdiłowy!');
        }
        if (!obj.types) {
            throw new ValidationError('Pole "types" nie może być puste!');
        }
        if (!obj.image ) {
            throw new ValidationError('Pole "image" nie może być puste!');
        }

        this.id = obj.id;
        this.name = obj.name;
        this.types = obj.types;
        this.rarity = obj.rarity ?? null;
        this.evolveTo  = obj.evolveTo ?? null;
        this.weaknesses = obj.weaknesses ?? null;
        this.image = obj.image;
    }

    async insert(): Promise<string> {
        await pool.execute(
            'INSERT INTO `card` (`id`, `name`, `types`, `rarity`,`evolveTo`,`weaknesses`, `image`) VALUES(:id,:name, :types, :rarity, :evolveTo, :weaknesses, :image)', this)
        return this.id;
    }

    static async getOneById(id: string): Promise<CardEntity> {
        const [results] = (await pool.execute('SELECT * FROM `card` WHERE `id` = :id', {
            id,
        })) as CardRecordResults;
        return results.length === 0 ? null : new CardRecord(results[0]);
    }

}