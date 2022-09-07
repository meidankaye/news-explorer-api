const Article = require('../models/article');
const NotFoundError = require('../utils/notfounderror');
const AuthorizationError = require('../utils/autherror');

const getArticles = (req, res, next) => {
  Article.find({})
    .orFail(() => {
      throw new NotFoundError('Article list is empty.');
    })
    .select('+owner')
    .then((articles) => {
      res.send(articles.filter((article) => article.owner === req.user._id));
    })
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const owner = req.user._id;

  Article.create({
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
    owner,
  })
    .then((article) => res.send(article))
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findOne({ _id: req.params.articleId })
    .select('+owner')
    .then((article) => {
      if (!article) {
        throw new NotFoundError('The requested article was not found');
      }
      if (article.owner.toString() !== req.user._id) {
        throw new AuthorizationError(
          'You cannot delete articles that does not belong to you.',
        );
      }
      return Article.findOneAndDelete(req.params.articleId)
        .then((deletedArticle) => {
          const {
            keyword, date, text, title, source, link, image,
          } = deletedArticle;
          res.send({
            keyword,
            date,
            text,
            title,
            source,
            link,
            image,
          });
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = { getArticles, createArticle, deleteArticle };
