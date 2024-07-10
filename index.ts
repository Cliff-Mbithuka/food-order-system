
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { MONGO_URI } from './config';
import path from 'path';


import { AdminRoute, VandorRoute } from './routes';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use('./images', express.static(path.join(__dirname, 'images')))

app.use('/admin', AdminRoute);
app.use('/vandor', VandorRoute);

mongoose.connect(MONGO_URI,{
    // useNewUrlParser: true;
    // useUnifiedTopology: true,
    // useCreateIndex: true
}).then( result => {
    console.log('MongoDB connected')
}).catch(err => {
    console.log('error' + err);
})

app.listen(2485, () => {
    console.clear()
    console.log('App listening to the port 2485');
    
})