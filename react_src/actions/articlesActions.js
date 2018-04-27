import * as types from './actionTypes';

import ArticlesApi from '../api/articles';

export function loadArticles() {  
  return function(dispatch) {
    return ArticlesApi.getAllArticles().then(articles => {
      dispatch(loadArticlesSuccess(articles));
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadArticlesSuccess(articles) {  
    return {type: types.LOAD_ARTICLES_SUCCESS, articles};
}

export function editArticle (article) {
    return {type: types.EDIT_ARTICLE_SUCCESS, article};
}