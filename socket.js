const socketCon = {
    io: null,

    init: (ioInstance) => {
        this.io = ioInstance;
    },
    //   init: function(ioInstance) {
    //     this.io = ioInstance;  // Use "this" correctly in function scope
    // },


    getIO: function () {
        if (!this.io) {
            throw new Error('Socket.io not initialized!');
        }
        return this.io;
    }
};

module.exports = socketCon;
