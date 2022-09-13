const Article = require('../models/article');
const NotFoundError = require('../utils/notfounderror');
const AuthorizationError = require('../utils/autherror');

const getArticles = (req, res, next) => {
  Article.find({})
    .select('+owner')
    .then((articles) => {
      const filteredArticles = articles.filter(
        (item) => item.owner.toHexString() === req.user._id,
      );
      res.send(filteredArticles);
    })
    .catch(() => {
      throw new NotFoundError('Article list is empty.');
    })
    .catch(next);
};

const createArticle = (req, res, next) => {
  Article.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((article) => res.send(article))
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findOne({ _id: req.params.articleId })
    .select('+owner')
    .then((article) => {
      console.log(article);
      if (!article) {
        next(new NotFoundError('The requested article was not found'));
      }
      if (article.owner.toString() !== req.user._id) {
        next(
          new AuthorizationError(
            'You cannot delete articles that does not belong to you.',
          ),
        );
      }
      return Article.findOneAndDelete({ _id: req.params.articleId })
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
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

module.exports = { getArticles, createArticle, deleteArticle };
