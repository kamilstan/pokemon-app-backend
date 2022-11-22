import {ValidationError} from "../utils/handleErrors";
import {CardRecord} from "../records/card.record";
import {Router} from "express";


export const cardRouter = Router()

    .post('/', async (req, res) => {

        if (!req.body.id) {
            throw new ValidationError('Id jest wymagane!');
        }
        if (await CardRecord.getOneById(req.body.id)) {
            throw new ValidationError('Karta o takim ID została już dodana!');
        }
        if (!req.body.name) {
            throw new ValidationError('Name jest wymagany!');
        }
        if (!req.body.image) {
            throw new ValidationError('Image jest wymagany!');
        }
        if (!req.body.types) {
            throw new ValidationError('Types jest wymagany!');
        }

        const card = {
            id: req.body.id,
            name: req.body.name,
            types: req.body.types,
            image: req.body.image,
            rarity: req.body.rarity,
            evolveTo: req.body.evolveTo,
            weaknesses: req.body.weaknesses,
        };
        const addCard = new CardRecord(card);

        try{
            await addCard.insert();
        } catch(err) {
            console.error(err)
        }
        res.json(`Dodano ${card.id} do bazy danych}`)
        console.log('addCard', addCard);
    });