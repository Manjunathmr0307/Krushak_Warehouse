const express = require("express")
const path = require("path")
const app = express()
    // const host = '127.0.0.1';
    // const port = process.env.PORT || 3000;
const hbs = require("hbs")
const { User, Jobcollection, Contact, About } = require("./mongodb")


const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')



const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const session = require('express-session');;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const flash = require('express-flash');

const port = 3000;

app.use(session({
    secret: 'ullas82344538y938u7899945928',
    resave: false,
    saveUninitialized: true,

}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success');
    res.locals.error_messages = req.flash('error');
    next();
});
app.use("/images", express.static(path.join(__dirname, "/public/images")));
app.use(express.json())
app.use(express.static('public/images'));
app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.urlencoded({ extended: false }));

// Route to display static src images
app.get("/static", (req, res) => {
    res.render("static");
});

// Route to display dynamic src images
app.get("/dynamic", (req, res) => {
    imageList = [];
    imageList.push({ src: "icons/flask.png", name: "flask" });
    imageList.push({ src: "icons/javascript.png", name: "javascript" });
    imageList.push({ src: "icons/react.png", name: "react" });
    res.render("dynamic", { imageList: imageList });
});
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.User) {
        return next();
    } else {
        res.redirect('/login');


    }
};


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error exit');
        }
        res.redirect('/login');
    });
});





app.get('/', (req, res) => {
    res.render('index1')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/logout', (req, res) => {
    res.render('logout')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/about', (req, res) => {
    res.render('about')
})
app.get('/contact', (req, res) => {
    res.render('contact')
})
app.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword')
})

app.get('/privacy', (req, res) => {
    res.render('privacy')
})


app.get('/home', isAuthenticated, (req, res) => {
    res.render('home')
})

app.get('/jobreg', (req, res) => {
    res.render('jobreg')
})
app.get('/futurenotify', isAuthenticated, (req, res) => {
    res.render('futurenotify')
})
app.get('/presentnotify', isAuthenticated, (req, res) => {
    res.render('presentnotify')
})
app.get('/oi', isAuthenticated, (req, res) => {
    res.render('oi')
})
app.get('/order', isAuthenticated, (req, res) => {
    res.render('order')
})
app.get('/index1', (req, res) => {
    res.render('index1')
})
app.get('/buy', isAuthenticated, (req, res) => {
    res.render('buy')
})
app.get('/sell', isAuthenticated, (req, res) => {
    res.render('sell')
})


// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ullas78999@gmail.com',
        pass: 'zbgy abzc iapt ydqj'
    }
});



// Routes
app.post('/signup', async(req, res) => {
    try {
        const { fname, lname, email, phone, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (fname === '' || lname === '' || email === '' || phone === '' || password === '') {
            req.flash('error', 'Data Field is empty');
            return res.redirect('/signup'); // Replace with the appropriate form page
        }

        if (existingUser) {

            return res.send('<script>alert("User already registered."); window.location.href="/login";</script>');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fname,
            lname,
            email,
            phone,
            password: hashedPassword,
            isVerified: false,
        });

        await user.save();

        // Send verification email
        const verificationToken = uuid.v4();
        user.resetToken = verificationToken;
        user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        const mailOptions = {
            from: 'ullas78999@gmail.com',
            to: email,
            subject: 'Verify the Email',
            text: `click  the link to verify: http://localhost:3000/verify/${verificationToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);

                res.render("error");
            } else {
                console.log('Email sent: ' + info.response);
                res.send('<script>alert("User registered successfully. Wait for the Verification."); window.location.href="/login";</script>');
            }
        });
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});




app.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (email === '' || password === '') {
            req.flash('error', 'Data Field is empty');
            return res.redirect('/login'); // Replace with the appropriate form page
        }
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/login');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            req.flash('error', 'Invalid password');
            return res.redirect('/login');
        }

        if (!user.isVerified) {
            req.flash('error', 'Email not verified.contact your instructor .');
            return res.redirect('/login');

        }
        if (user) {
            req.session.User = user;
            res.render("home");
        }

    } catch (error) {
        console.error(error);
        res.render("error");
    }
});


// Handle forgot password
app.post('/forgotpassword', async(req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.send('<script>alert("User not found."); window.location.href="/login";</script>');

        }

        const resetToken = uuid.v4();
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        const mailOptions = {
            from: 'ullas78999@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: http://localhost:3000/resetpassword/${resetToken}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                res.render("error");
            } else {
                console.log('Email sent: ' + info.response);
                res.send('<script>alert("Reset Password link sent to your email .");window.location.href="/login";</script>');
            }
        });
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});


// Handle password reset
app.post('/resetpassword', async(req, res) => {
    try {
        const { newPassword, resetToken } = req.body;

        const user = await User.findOne({
            resetToken: resetToken, // Fix: Use resetToken instead of token
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            req.flash('error', 'Invalid or expired reset token.');
            return res.redirect('/login');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();
        res.render("login");
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});


// New route to handle the GET request for password reset
// Handle the GET request for password reset
app.get('/resetpassword/:token', async(req, res) => {
    try {
        const { token } = req.params;

        // TODO: Check if the token is valid and not expired in the database
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return res.send('<script>alert("User not found");window.location.href="/login";</script>');

        }

        // Token is valid, render the password reset page with the token
        res.render('resetpassword', { token });
        // Adjust the above code based on your templating engine and application structure
    } catch (error) {
        console.error(error);
        res.render("error");
    }
});

// Verify email
app.get('/verify/:token', async(req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }, // Check if the verification token is still valid
        });

        if (!user) {
            return res.send('<script>alert("User not found");window.location.href="/login";</script>');
        }

        user.isVerified = true;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();
        res.send('<script>alert("Email verification successful");window.location.href="/login";</script>');

    } catch (error) {
        console.error(error);
        res.render("error");
    }
});



app.post("/jobreg", async(req, res) => {
    const data2 = {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address,
        dl: req.body.dl,
        aadhaar: req.body.aadhaar,
        vnumber: req.body.vnumber
    }

    await Jobcollection.insertMany([data2]);
    res.render("task");
})
app.post("/about", async(req, res) => {
    const about = {
        name: req.body.name,
        email: req.body.email,
    }

    const user = req.body.email;


    await About.insertMany([about]);

    const mailOptions = {
        from: 'ullas78999@gmail.com',
        to: user,
        subject: 'More details about krushak',
        text: `thank you for showing intrest,we will contact you soon..`,
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            console.error(error);
            res.render("error");
        } else {

            res.send('<script>alert("Thank you for showing interest");window.location.href="/login";</script>');
        }
    });

    res.render("index1");





})











app.listen(port, () => {
    console.log(`port connected ${port}`);
});