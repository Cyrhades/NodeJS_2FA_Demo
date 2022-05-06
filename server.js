const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config()

// Démo 2FA
const QRCode = require('qrcode');
const { authenticator } = require('otplib');

//--------------------------------------------------------------------
//      Mise en place du moteur de template
//--------------------------------------------------------------------
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');

//--------------------------------------------------------------------
//      Parse les données soumise en post
//--------------------------------------------------------------------
app.use(express.urlencoded({ extended: true })); 

//--------------------------------------------------------------------
//      Routes
//--------------------------------------------------------------------
app.get('/', (req, res) => { res.render('index'); });

app.get('/2fa-qrcode', (req, res) => {
    QRCode.toDataURL(authenticator.keyuri('toto@yopmail.com', 'Démo 2FA', process.env.SECRET_2FA), (err, url) => {
        if (err) res.redirect('/');
        res.render('2fa-qrcode', { qr: url })
    }); 
});

app.get('/2fa-valid', (req, res) => { res.render('form'); });
app.post('/2fa-valid', (req, res) => {
    try {
        const isValid = authenticator.check(req.body.number_2fa, process.env.SECRET_2FA);
        res.render('form', {statut: isValid ? 'success' : 'error'});
        // si c'est valide, on peut connecter l'utilisateur
        // si non valide, recharger la page du formulaire 2FA
    } catch (err) {
        console.error(err);
        // recharger la page du formulaire 2FA
    }
});

//--------------------------------------------------------------------
//     Ecoute du serveur HTTP
//--------------------------------------------------------------------
app.listen(process.env.PORT, () => {
    console.log(`Le serveur est démarré : http://localhost:${process.env.PORT}`);
});
