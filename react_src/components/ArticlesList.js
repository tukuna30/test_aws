import React from 'react';
import PropTypes from 'prop-types';
import Article from './Article';

const ArticlesList = ({articles, handleEdit}) => {
  return (
      <ul style={{maxHeight: '500px', overflowY: 'auto'}}>
        {articles.map(article => 
        <li style={{borderBottom: '1px dashed lightgray', marginBottom: '10px'}}>
          <Article key={article.id} article={article} handleEdit={handleEdit}/>
        </li>
        )}
      </ul>
  );
};

ArticlesList.propTypes = {
  articles: PropTypes.array.isRequired,
  handleEdit: PropTypes.func.isRequired
};

export default ArticlesList;