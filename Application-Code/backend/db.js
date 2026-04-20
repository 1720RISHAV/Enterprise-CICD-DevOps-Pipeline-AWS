const mongoose = require("mongoose");

module.exports = async () => {
    try {
        await mongoose.connect("mongodb://mongodb:27017/taskdb", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to database.");
    } catch (error) {
        console.log("Could not connect to database.", error);
    }
};
