const express=require('express')
const db = require('./src/db/db');
const http =require('http')
const cors = require("cors");
const hotelRoutes = require('./src/routes/hotelRoutes');
const socketCon = require('./socket');
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/hotel', hotelRoutes);
const port = process.env.PORT || 4000;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://192.168.29.169:${port}`);
});
const io = require('socket.io')(server, {
    cors: {
        origin: '*', // or your frontend URL
        // origin: 'https://apnapandating.netlify.app',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
        pingTimeout:600000,
        pingInerval:25000
        // pingTimeout: 120000, // Reduced to 2 minutes
        // pingInterval: 10000, // Reduced to 10 seconds
    }
});
app.locals.io = io;
socketCon.init(io);
// Basic socket connection
io.on('connection', (socket) => {
    console.log('A new user connected with socket ID:', socket.id );
     
    // // Emit a connected message to the client
    // socket.emit('connected', `Socket connected: ${socket.id}`);
    // Handle disconnection
    socket.on('addCustomerDetails',(message)=>{
        io.emit('getCustomerDetails',message)
    })
    socket.on('deleteCustomerDetails',(message)=>{
        io.emit('getCustomerDetails',message)
    })
    socket.on('updateCustomerDetails',(message)=>{
        io.emit('getCustomerDetails',message)
    })
    socket.on('addCustomerDetailsAdvance',(message)=>{
        io.emit('getCustomerDetailsAdvance',message)
    })
    socket.on('deleteCustomerDetailsAdvance',(message)=>{
        io.emit('getCustomerDetailsAdvance',message)
    })

    socket.on('updateCustomerDetailsAdvance',(message)=>{
        io.emit('getCustomerDetailsAdvance',message)
    })
    socket.on('addStaffOwnerObj',(message)=>{
        io.emit('getStaffOwnerObj',message)
    })
    socket.on('deleteStaffOwnerObj',(message)=>{
        io.emit('getStaffOwnerObj',message)
    })
    socket.on('updateStaffOwnerObj',(message)=>{
        io.emit('getStaffOwnerObj',message)
    })
    socket.on('addOwnerObj',(message)=>{
        io.emit('getStaffOwnerObj',message)
    })
});

module.exports = { io };
