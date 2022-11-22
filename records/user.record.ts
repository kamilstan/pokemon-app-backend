import {UserEntity} from "../types";
import {ValidationError} from "../utils/handleErrors";
import {pool} from "../utils/db";
import {v4 as uuid} from "uuid";
import {FieldPacket} from "mysql2";

type UserRecordResults = [UserEntity[], FieldPacket[]];

export class UserRecord implements UserEntity {
    id?: string;
    username: string;
    email: string;
    password?: string;
    role: string;
    registerToken?: string;
    favoritesCardsIds?: string;

    constructor(obj: UserEntity) {
        if (!obj.email || obj.email.length > 255) {
            throw new ValidationError('Pole"email" nie może być puste oraz zawierać więcej niż 255 znaków!');
        }
        if (typeof obj.email !== 'string') {
            throw new ValidationError('Format danych pola "email" jest nieprawdiłowy!');
        }
        if (!obj.username || obj.username.length > 100) {
            throw new ValidationError('Pole"username" nie może być puste oraz zawierać więcej niż 255 znaków!');
        }
        if (typeof obj.username !== 'string') {
            throw new ValidationError('Format danych pola "username" jest nieprawdiłowy!');
        }
        if (!obj.role) {
            throw new ValidationError('Pole "role" nie może być puste!');
        }
        if (obj.password !== null && obj.password !== undefined && obj.password.length > 255) {
            throw new ValidationError('Pole "password" nie może być puste oraz zawierać więcej niż 255 znaków!');
        }

        this.id = obj.id ?? null;
        this.username = obj.username;
        this.email = obj.email;
        this.password = obj.password ?? null;
        this.role = obj.role;
        this.registerToken = obj.registerToken ?? null;
        this.favoritesCardsIds = obj.favoritesCardsIds ?? null;
    }

    async insert(): Promise<string> {
        this.registerToken = this.registerToken ?? uuid();
        this.id = this.id ?? uuid();
        await pool.execute(
            'INSERT INTO `user` (`id`, `username`, `email`, `password`,`role`,`registerToken`, `favoritesCardsIds`) VALUES(:id,:username, :email, :password, :role, :registerToken, :favoritesCardsIds)',
            {
                ...this,
                registerToken: this.registerToken,
            }
        );
        return this.registerToken;
    }

    static async getOneByEmail(email: string): Promise<UserEntity> {
        const [results] = (await pool.execute('SELECT * FROM `user` WHERE `email` = :email', {
            email,
        })) as UserRecordResults;
        return results.length === 0 ? null : new UserRecord(results[0]);
    }

    static async getOneById(id: string): Promise<UserEntity> {
        const [results] = (await pool.execute('SELECT * FROM `user` WHERE `id` = :id', {
            id,
        })) as UserRecordResults;
        return results.length === 0 ? null : new UserRecord(results[0]);
    }

    async updateFavorites(): Promise<void> {
        await pool.execute('UPDATE `user` SET `favoritesCardsIds`= :favoritesCardsIds WHERE `id`=:id', {
            id: this.id,
            favoritesCardsIds: this.favoritesCardsIds,
        });
    }

}