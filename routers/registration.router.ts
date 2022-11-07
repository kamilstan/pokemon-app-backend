import {Router} from "express";
import {UserRecord} from "../records/user.record";
import {ValidationError} from "../utils/handleErrors";
import {v4 as uuid} from "uuid";
import {hashPassword} from "../utils/bcrypt-functions";

export const registrationRouter = Router()

    .post('/user/registration', async (req, res) => {


        if (req.body.password !== req.body.confirmPassword) {
            throw new ValidationError('Niepoprawne dane!');
        }

        if (req.body.password.length < 6) {
            throw new ValidationError('Hasło powinno zawierać minimum 6 znaków.');
        }

        if (!req.body.email) {
            throw new ValidationError('Email jest wymagany!');
        }
        if (await UserRecord.getOneByEmail(req.body.email)) {
            throw new ValidationError('Użytkownik o takim emailu juz istnieje!');
        }
        if (!req.body.userName) {
            throw new ValidationError('Username jest wymagany!');
        };

        const hash = hashPassword(req.body.password);

        const user = {
            username: req.body.username,
            email: req.body.email,
            password: hash,
            role: 'customer',
        };
        const addUser = new UserRecord(user);

        try{
            const tokenRegister = await addUser.insert();
        } catch(err) {
            console.error(err)
        }
        res.json(`Dodano ${user.username} do bazy danycj}`)
        console.log('addUser', addUser);

    });