const express = require('express');
const app = express();
const path = require('path');

// Démo 2FA
const QRCode = require('qrcode');
const { authenticator } = require('otplib');
// génération d'une cle secréte dédié à un utilisateur 
// (elle devra être stocké en BDD sur l'utilisateur)
const secret = authenticator.generateSecret(); 
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
    
    QRCode.toDataURL(authenticator.keyuri('toto@yopmail.com', 'Démo 2FA', secret), (err, url) => {
        if (err) res.redirect('/');
        res.render('2fa-qrcode', { 
            qr: url, 
            account: `Démo 2FA`,
            key: secret
        })
    }); 
});

app.get('/2fa-valid', (req, res) => { res.render('form'); });
app.post('/2fa-valid', (req, res) => {
    try {
        const isValid = authenticator.check(req.body.number_2fa, secret);
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
app.listen(8000, () => {
    console.log(`Le serveur est démarré : http://localhost:8000`);
});
