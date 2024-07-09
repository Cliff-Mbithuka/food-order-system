import express from 'express';

const app = express();

app.use('/', (req, res) => {
    return res.json('Hello from order');
})

app.listen(2485, () => {
    console.log('App listening to the port 2485');
    
})