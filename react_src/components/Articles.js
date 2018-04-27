import React from 'react';
import { connect } from 'react-redux';
import ArticlesList from './ArticlesList';
import Modal from 'react-modal';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor';
import { editArticle } from '../actions/articlesActions';

class Articles extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = { modalIsOpen: false, article: {}, articleChanged: false };
        this.handleEdit = this.handleEdit.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.articleChanged = this.articleChanged.bind(this);
        this.saveArticle = this.saveArticle.bind(this);
    }

    handleEdit(article) {
        this.setState({ modalIsOpen: true, article });
    }

    closeModal() {
        this.setState({ modalIsOpen: false });
        if (window.editor) {
            editor.destroy();
        }
    }
    articleChanged() {
        this.setState({ articleChanged: true });
    }
    saveArticle(articleId) {
        let editor = window.editor;
        if (editor) {
            this.props.saveArticle({ id: articleId, description: editor.getData() });
            this.closeModal();
        }
    }

    afterOpenModal() {
        if (!this.state.modalIsOpen) {
            return;
        }
        let self = this;
        DecoupledEditor.create(document.querySelector('.modal-document-container .document-editor .document-editor__editable'), {})
            .then(editor => {
                const toolbarContainer = document.querySelector('.modal-document-container .document-editor .document-editor__toolbar');
                toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                window.editor = editor;
                editor.setData(self.state.article.description);
                editor.model.document.on('change', function () {
                    if (!editor.model.document.differ.isEmpty) {
                        self.articleChanged();
                    }
                });
            }).catch(err => {
                console.error(err);
            });
    }

    render() {
        const articles = this.props.articles;
        return (
            <div className='articles-container'>
                <ArticlesList articles={articles} handleEdit={this.handleEdit} />
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    contentLabel="Example Modal"
                >
                    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                        <button onClick={this.closeModal} style={{fontSize: '16px', marginLeft: '10px'}} className="button">Close</button>
                        {this.state.articleChanged && <button style={{fontSize: '16px'}} onClick={() => this.saveArticle(this.state.article.id)} className="button">Save</button>}
                    </div>
                    <div class='modal-document-container'>
                        <div className={"document-editor"}>
                            <div className="document-editor__toolbar"></div>
                            <div className="document-editor__editable-container">
                                <div className="document-editor__editable" style={{width: 'auto', paddingBottom: '30px'}}>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
function mapStateToProps(state, ownProps) {
    return {
        articles: state.articles
    };
}

const mapDispatchToProps = dispatch => ({
    saveArticle: article => dispatch(editArticle(article))
})

export default connect(mapStateToProps, mapDispatchToProps)(Articles);