const db = require('./sequelize/models/index'); // cliでinitした時に作成されるmodels配下のindex.js

// findAll
(async () => {
   const users = await db.User.findAll();
  for(user of users) {
    console.log(users);
  }
})();
