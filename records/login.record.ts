import {LoginCreatedEntity, LoginEntity} from "../types";
import {ValidationError} from "../utils/handleErrors";
import {pool} from "../utils/db";
import {FieldPacket} from "mysql2";
import jwt from 'jsonwebtoken';
import {v4 as uuid} from "uuid";

type LoginResults = [LoginEntity[], FieldPacket[]];

export class LoginRecord implements LoginEntity {
    id?: string;
    userId: string;
    refreshToken: string;

    constructor(obj:LoginEntity) {
        if (!obj.userId) {
            throw new ValidationError('Pole "user_id" nie może być puste!');
        }
        if (typeof obj.userId !== 'string') {
            throw new ValidationError('Pole "user_id" musi być tekstem!');
        }
        if (!obj.refreshToken) {
            throw new ValidationError('Pole "refreshToken" nie może być puste!');
        }
        if (typeof obj.refreshToken !== 'string') {
            throw new ValidationError('Pole "refreshToken" musi być tekstem!');
        }

        this.id = obj.id ?? null;
        this.userId = obj.userId;
        this.refreshToken = obj.refreshToken;
    }

    async insert() {
        if(!this.id) {
            this.id = uuid()
        };
        await pool.execute('INSERT INTO `login`(`id`, `userId`, `refreshToken`)VALUES(:id,:userId,:refreshToken)', this);
    }

    static async getOneByToken(refreshToken: string): Promise<LoginEntity> {
        const [results] = (await pool.execute('SELECT * FROM `login` WHERE `refreshToken` = :refreshToken', {
            refreshToken,
        })) as LoginResults;
        return results.length === 0 ? null : results[0];
    }

    static async deleteOneByToken(refreshToken: string): Promise<void> {
        await pool.execute('DELETE FROM `login` WHERE `refreshToken` = :refreshToken', {
            refreshToken: refreshToken,
        });
    }

    static createTokens(payload: string): LoginCreatedEntity {
        const token = jwt.sign({ id: payload }, process.env.ACCESS_TOKEN_KEY, {
            expiresIn: '10min',
        });
        console.log('process env', process.env.ACCESS_TOKEN_KEY);
        const refreshToken = jwt.sign({ id: payload }, process.env.ACCESS_REFRESH_TOKEN_KEY, { expiresIn: '24h' });
        return {
            id: payload,
            token,
            refreshToken,
        };
    }
}