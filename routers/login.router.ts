import {LoginRecord} from "../records/login.record";
import {UserRecord} from "../records/user.record";
import {isPasswordCorrect} from "../utils/bcrypt-functions";
import {Router} from "express";
import {ValidationError} from "../utils/handleErrors";


export const loginRouter = Router()
    .post('/', async (req, res) => {
        const { email, password } = req.body;
        const user = await UserRecord.getOneByEmail(email);
        console.log(user);
        if (user === null) {
            throw new ValidationError('Użytkownik nie istnieje w bazie danych!');
        }
        if (req.cookies.refreshToken !== undefined && (await LoginRecord.getOneByToken(req.cookies.refreshToken))) {
            throw new ValidationError('Użytkownik jest już zalogowany!');
        }

        const isCorrect = isPasswordCorrect(password, user.password);
        if (!isCorrect) {
            throw new ValidationError('Niepoprawne dane logowania!');
        }

        try {
            const response = await LoginRecord.createTokens(user.id);
            console.log('response', response);
            const loginRecord = new LoginRecord({
                userId: user.id,
                refreshToken: response.refreshToken,
            });
            await loginRecord.insert();
            res
                .cookie('refreshToken', response.refreshToken, {
                    // httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000,
                })
                .json({
                    id: user.id,
                    accessToken: response.token,
                    role: user.role,
                    username: user.username
                });
        } catch (err) {
            throw new ValidationError('Wystąpił błąd podczas logowania użytkownika! Spróbuj ponownie pózniej.');
        }
    })

    .delete('/', async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ValidationError('Użytkownik nie może być wylogowany!');
        }
        try {
            await LoginRecord.getOneByToken(refreshToken);
            await LoginRecord.deleteOneByToken(refreshToken);
            res.clearCookie('refreshToken').json('Użytkownik został pomyślnie wylogowany!');
        } catch (err) {
            throw new ValidationError('Wystąpił błąd podczas wylogowania z aplikacji!');
        }
    });