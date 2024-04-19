const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb://localhost:27017/farm', { useNewUrlParser: true, useUnifiedTopology: true });
// Check database connected or not
connect.then(() => {
        console.log("Database Connected Successfully");
    })
    .catch(() => {
        console.log("Database Not Connected");
    })

const userSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    email: String,
    phone: String,
    password: { type: String, required: true },
    resetToken: String,
    resetTokenExpiry: Date,
    isVerified: Boolean,
});
const User = mongoose.model('User', userSchema);
const aboutschema = new mongoose.Schema({
    name: String,
    email: String,
})
const About = mongoose.model('About', aboutschema);





const JobSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,

    },
    dl: {
        type: String,
        required: true,
    },
    aadhaar: {
        type: String,
        required: true,

    },
    vnumber: {
        type: String,
        required: true,

    },
});

const Jobcollection = mongoose.model('Jobcollection', JobSchema);
const contactSchema = new mongoose.Schema({
    cname: String,
    email: String,
    message: String

})
const Contact = mongoose.model('Contact', contactSchema);
module.exports = {
    User,
    Jobcollection,
    Contact,
    About,
};