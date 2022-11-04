export interface LoginEntity {
    id?: string;
    userId: string;
    refreshToken: string;
}

export interface LoginCreatedEntity {
    id: string;
    token: string;
    refreshToken: string;
}