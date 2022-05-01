const models = require('../models');
async function createCategory() {
  const category = models.Category.build({ name: 'test3' });
  await category.save();
}
createCategory();
