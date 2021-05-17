'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    return await queryInterface.bulkInsert("Users",[
      { name: "name1", email: "email1", birth: now, createdAt: now, updatedAt: now},
      { name: "name2", email: "email2", birth: now, createdAt: now, updatedAt: now},
      { name: "name3", email: "email3", birth: now, createdAt: now, updatedAt: now},
      { name: "name4", email: "email4", birth: now, createdAt: now, updatedAt: now},
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.bulkDelete("Users", null, {} );
  }
};
