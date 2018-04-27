import * as types from '../actions/actionTypes';  
import initialState from './initialState';

export default function articlesReducer(state = initialState.articles, action) {  
  switch(action.type) {
    case types.LOAD_ARTICLES_SUCCESS:
      return action.articles

    case types.EDIT_ARTICLE_SUCCESS: 
    return state.map(article =>
      article.id === action.article.id ?
        {id: action.article.id, description: action.article.description, name: article.name} :
        article
    )
    default: 
      return state;
  }
}