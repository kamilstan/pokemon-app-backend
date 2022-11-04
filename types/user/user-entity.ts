export interface UserEntity {
    id?: string;
    username: string;
    email: string;
    password?: string;
    role: string;
    registerToken?: string;
    favoritesCardsIds?: string[];
}