const express=require('express')
const db = require('./src/db/db');
const http =require('http')
const cors = require("cors");
const hotelRoutes = require('./src/routes/hotelRoutes');
const app=express()
const server = http.createServer(app);
const corsOptions = {
    // origin: 'http://192.168.29.169:8081',
    origin: '*',
    // origin: 'https://apnapandating.netlify.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use('/hotel', hotelRoutes);
const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://192.168.29.169:${port}`);
});
