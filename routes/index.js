var express = require('express');
var router = express.Router();
const models = require('../models');
const { ValidationError } = require('sequelize');
const { rawListeners } = require('../app');

/* GET home page. */
router.get('/', async function (req, res, next) {
  req.session.view_counter = (req.session.view_counter || 0) + 1;
  const flashMessage = req.session.flashMessage; //--- [2]
  delete req.session.flashMessage; //--- [3]
  const now = new Date();
  const contacts = await models.Contact.findAll({ include: 'category' });
  const categories = await models.Category.findAll();

  res.render('index', { title: '連絡帳', now, contacts, categories, view_counter: req.session.view_counter, flashMessage });
});

//連絡先詳細ルーティング
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});

//連絡先追加画面ルーティング
router.get('/contact_form', async function (req, res, next) {
  const categories = await models.Category.findAll();
  res.render('contact_form', { title: '連絡先の作成', contact: {}, categories });
});

//連絡先更新画面ルーティング
router.get('/contacts/:id/edit', async function (req, res, next) {
  const contact = await models.Contact.findByPk(req.params.id);
  const categories = await models.Category.findAll();
  res.render('contact_form', { title: '連絡先の更新', contact: contact, categories });
});

//連絡先追加・更新ルーティング
router.post('/contacts', async function (req, res, next) {
  const fields = ['name', 'email', 'categoryId']; //---[1]
  try {
    console.log('posted', req.body);

    if (req.body.id) {
      const contact = await models.Contact.findByPk(req.body.id); //---[1]
      contact.set(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `「${contact.name}」さんを更新しました`; //--- [4]
    } else {
      const contact = models.Contact.build(req.body);
      await contact.save({ fields });
      req.session.flashMessage = `新しい連絡先として「${contact.name}」さんを保存しました`;
    }
    res.redirect('/');
  } catch (err) {
    if (err instanceof ValidationError) {
      const title = req.body.id ? '連絡先の更新' : '連絡先の作成';
      res.render('contact_form', { title, contact: req.body, err: err });
    } else {
      throw err;
    }
  }
});

//連絡先削除ルーティング
router.post('/contacts/:id/delete', async function (req, res, next) { //--- [1]
  console.log(req.params); //--- [2]
  const contact = await models.Contact.findByPk(req.params.id); //---[3]
  await contact.destroy(); //--- [4]
  req.session.flashMessage = `「${contact.name}」さんを削除しました`;
  res.redirect('/');
});

//カテゴリ追加画面ルーティング
router.get('/category_form', async function (req, res, next) {
  res.render('category_form', { title: 'カテゴリの作成', category: {} });
});

//カテゴリ追加・更新ルーティング
router.post('/categories', async function (req, res, next) {
  const fields = ['name'];
  console.log('posted', req.body);
  try {
    if (req.body.id) {
      const category = await models.Category.findByPk(req.body.id); //---[1]
      category.set(req.body);
      await category.save({ fields });
      req.session.flashMessage = `「${category.name}」さんを更新しました`; //--- [4]
    } else {
      const category = models.Category.build(req.body);
      await category.save({ fields });
    }
    res.redirect('/');
  } catch (err) {
    if (err instanceof ValidationError) {
      res.render('category_form', { title, category: req.body, err: err });
    } else {
      throw err;
    }
  }
});

//カテゴリの詳細ルーティング
router.get('/categories/:id', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  const contacts = await category.getContacts({ include: 'category' });
  res.render('category', { title: `カテゴリ ${category.name}`, category, contacts });
});

//カテゴリの削除ルーティング
router.post('/categories/:id/delete', async function (req, res, next) { //--- [1]
  console.log(req.params); //--- [2]
  const category = await models.Category.findByPk(req.params.id);
  const contacts = await category.getContacts({ include: 'category' });
  for (const item of contacts) {
    await item.destroy(); //--- [4]
  }
  await category.destroy(); //--- [4]
  req.session.flashMessage = `「${category.name}」さんを削除しました`;
  res.redirect('/');
});

router.get('/categories/:id/edit', async function (req, res, next) {
  const category = await models.Category.findByPk(req.params.id);
  res.render('category_form', { title: 'カテゴリの更新', category: category });
});

module.exports = router;
