import {Router} from "express";
import {UserRecord} from "../records/user.record";
import {ValidationError} from "../utils/handleErrors";


export const userRouter = Router()

    .get('/:id', async(req,res) => {
        if (req.params.id === null){
            throw new ValidationError('Użytkownik nie posiada ulubionych kart.')
        }
        const user = await UserRecord.getOneById(req.params.id);
        res.json(user);
    })

    .patch('/:userId/add/:cardId', async (req, res) => {
        const user = await UserRecord.getOneById(req.params.userId);

        if (user === null) {
            throw new ValidationError('Nie znaleziono użytkownika z podanym ID.');
        }

        if (user.favoritesCardsIds.includes(req.params.cardId) ) {
            throw new ValidationError('Nie można dodać karty, która już wcześniej została dodana');
        }

        if(!user.favoritesCardsIds) {
            const newFavorites =`${req.params.cardId}`;
            user.favoritesCardsIds = newFavorites;
            const newUser = new UserRecord(user);
            await newUser.updateFavorites();
            res.json(user)
        } else {
            const newFavorites =`${req.params.cardId},${user.favoritesCardsIds}`;
            user.favoritesCardsIds = newFavorites;
            const newUser = new UserRecord(user);
            await newUser.updateFavorites();
            res.json(user)
        }

    })

    .patch('/:userId/delete/:cardId', async (req, res) => {
        const user = await UserRecord.getOneById(req.params.userId);

        if (user === null) {
            throw new ValidationError('Nie znaleziono użytkownika z podanym ID.');
        }

        if (!user.favoritesCardsIds.includes(req.params.cardId) ) {
            throw new ValidationError('Nie można usunąć karty, która nie została wcześniej dodana');
        }

        console.log(user.favoritesCardsIds);
        if (user.favoritesCardsIds.includes(`${req.params.cardId},`)) {
            const newFavorites = user.favoritesCardsIds.replace(`${req.params.cardId},`, '');
            user.favoritesCardsIds = newFavorites;
            const newUser = new UserRecord(user);
            await newUser.updateFavorites();
            res.json(user)
        } else if (user.favoritesCardsIds.includes(`,${req.params.cardId}`)) {
            const newFavorites = user.favoritesCardsIds.replace(`,${req.params.cardId}`, '');
            user.favoritesCardsIds = newFavorites;
            const newUser = new UserRecord(user);
            await newUser.updateFavorites();
            res.json(user)
        } else {
            const newFavorites = user.favoritesCardsIds.replace(`${req.params.cardId}`, '');
            user.favoritesCardsIds = newFavorites;
            const newUser = new UserRecord(user);
            await newUser.updateFavorites();
            res.json(user)
        }
    })



