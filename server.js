const express = require('express');
const http = require('http');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 4000;
const db = require('./src/dbConnection.js');
const bp = require('body-parser');
const cors = require('cors');

//models instantiated
const User = require('./src/services/User/model.js')(db);
const FamilyUnit = require('./src/services/FamilyUnit/model.js')(db);
const Chore = require('./src/services/DefaultChore/model').modelFactory(db);
const ChoreSuggestion = require('./src/services/DefaultChore/model').suggestionModelFactory(db);
const Reward = require('./src/services/DefaultReward/model').modelFactory(db);
const Alert = require('./src/services/FamilyUnit/Alert/model').modelFactory(db);

const sendPushNotification = require('./src/services/SendPushNotification.js');

//middlewares and health check
app.use(cors());
app.use(bp.json());
app.use(function(req, res, next){
    console.log(`${req.method} ${req.originalUrl} - Authorization: ${!!req.get('Authorization')}`);
    console.log('Query', req.query);
    console.log('Body', req.body);
    next();
});
app.get('/healthcheck', (req, res) => {
    console.log('received health check');
    res.end("health check succeeded");
});
app.use(require('./src/jwtMiddleware.js'));

//routes
app.get('/logout', (req, res) => {
   res.sendFile(__dirname+ '/src/files/logout.html');
});
app.get('/pushnotification/:userid', async (req, res) => {
    const targetUser = User.findOne({_id: req.params.userid});
    if (!targetUser)
        return res.status(404).json({err: 'User not found'});
    if (!targetUser.pushNotificationInformation || !targetUser.pushNotificationInformation.expo || !targetUser.pushNotificationInformation.expo.map)
        return res.status(404).json({err: 'User does not have any push token associated'});

    const receipts = await sendPushNotification(
        targetUser.pushNotificationInformation.expo.map(subscription => subscription.token),
        "Test of the push notification system. Thug life."
    );
    res.json({receipts});
});

require('./src/services/User')(app, User, FamilyUnit);
require('./src/services/FamilyUnit')(app, User, FamilyUnit, Chore, Reward);
require('./src/services/DefaultChore').routeFactory(app, User, ChoreSuggestion);
require('./src/services/DefaultReward').routeFactory(app, User, Reward);
require('./src/services/FamilyUnit/Alert').routeFactory(app, User, FamilyUnit, Alert);


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

