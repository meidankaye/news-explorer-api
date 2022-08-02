const Article = require('../models/article');
const NotFoundError = require('../utils/notfounderror');
const AuthorizationError = require('../utils/autherror');

const getArticles = (req, res, next) => {
  Article.find({})
    .orFail(() => {
      throw new NotFoundError('Article list is empty.');
    })
    .then((articles) => res.send(articles))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  Article.create({
    keyword, title, text, date, source, link, image, owner: req.user._id,
  })
    .then((article) => res.send(article))
    .catch(next);
};

const deleteArticle = (req, res, next) => {
  Article.findByIdAndRemove(req.params.articleId)
    .orFail(() => {
      throw new AuthorizationError('The requested article was not found');
    })
    .then((article) => {
      if (article.owner.equals(req.user._id)) res.send(article);
      else {
        throw new AuthorizationError('You cannot delete articles that does not belong to you.');
      }
    })
    .catch(next);
};

module.exports = { getArticles, createArticle, deleteArticle };
