'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Contacts',
      'email',
      {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      }
    );
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn(
      'Contacts',
      'email',
    );
  }
};
