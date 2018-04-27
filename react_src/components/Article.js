import React from 'react';  
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor';

class Article extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {editor: undefined};
        this.setState = this.setState.bind(this);
    }

    setEditor (editor) {
        this.setState({editor});
    }
    componentDidMount () {
        let self = this;
        let articleClass = ".article" + this.props.article.id;
        DecoupledEditor.create(document.querySelector(articleClass + ' .document-editor .document-editor__editable' ), {})
            .then(editor => {
                editor.setData(this.props.article.description);
                editor.isReadOnly = true;
                self.setEditor(editor);
            }).catch(err => {
                console.error( err );
            });
    }
    componentDidUpdate() {
       this.state.editor.setData(this.props.article.description);
    }

    render () {
        return (
            <div className={"article article" + this.props.article.id}>
                <span style={{fontSize: '16px', fontWeight: 'bold'}}>{this.props.article.name}</span>
                <button className='edit button' onClick={() => this.props.handleEdit(this.props.article)}>Edit</button>
                <div className={"document-editor"}>
                    <div className="document-editor__editable-container">
                        <div className="document-editor__editable" style={{paddingBottom: '30px'}}>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Article;