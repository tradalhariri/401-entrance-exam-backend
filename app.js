'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGO_LINK}`, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
});

const chocolateSchema = new mongoose.Schema({
    name: String,
    img: String,
    email: String,
});

const ChocolateModel = mongoose.model('chocolate', chocolateSchema);
const PORT = process.env.PORT;
const app = new express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('hello')
})

app.get('/allChocolates', (req, res) => {

    axios.get(`${process.env.THIRD_PARTY_API}`).then(results => {
        const allChocolates = results.data.map(chocolate => {
            return new Chocolate(chocolate);
        })
        console.log(allChocolates);
        res.send(allChocolates);
    })
})

app.post('/favChocolates', async (req, res) => {
    const chocolate = req.body;

    const newChocolate = new ChocolateModel({ name: chocolate.name, img: chocolate.img, email: chocolate.email });
    try {
        await newChocolate.save();
        res.sen('sucess added')
    }
    catch (e) {
        res.send(e)
    }
})

app.get('/favChocolates', async (req, res) => {
    const email = req.query.email;

    await ChocolateModel.find({ email: email }, (err, results) => {
        if (err) {
            res.send(err);
        }
        else {
            res.send(results)
        }
    })
})


app.delete('/favChocolates/:id/:email', async (req, res) => {
    const email = req.params.email;
    const id = req.params.id;

    await ChocolateModel.deleteOne({_id:id, email: email }, (err, results) => {
        if (err) {
            res.send(err);
        }
        else {
             ChocolateModel.find({ email: email }, (err, results) => {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(results)
                }
            })
        }
    })
})

app.put('/favChocolates', async (req, res) => {
   const newChocolate = req.body;

    await ChocolateModel.findByIdAndUpdate({_id:newChocolate.id, email: newChocolate.email },{name:newChocolate.name,img:newChocolate.img}, (err, results) => {
        if (err) {
            res.send(err);
        }
        else {
             ChocolateModel.find({ email: newChocolate.email }, (err, results) => {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(results)
                }
            })
        }
    })
})

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


class Chocolate {
    constructor(chocolate) {
        this.img = chocolate.imageUrl;
        this.name = chocolate.title;
    }
}

