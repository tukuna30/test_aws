import React from 'react';
import PropTypes from 'prop-types';
import { canMoveKnight } from "../helpers/rules";
import monitor from '../helpers/monitor';

export default class Square extends React.Component {
    constructor(props) {
        super(props);
        this.state = { highLight: false };
        monitor.on('dragInProgress', () => {
            if (canMoveKnight(this.props.knightPosition, this.props.x, this.props.y) && !this.props.conquered) {
                this.setState({ highLight: true });
            }
        });
        monitor.on('dropFinish', (data) => {
            this.setState({ highLight: false });
        });
    }

    onDrop(evt) {
        console.log('dropped');
        monitor.emit('dropFinish', evt);
        console.log(evt);
        if (canMoveKnight(this.props.knightPosition, this.props.x, this.props.y) && !this.props.conquered) {
            this.setState({ conquered: true });
            this.props.dropHandler(this.props.x, this.props.y);
        }
    }
    onDragOver(e) {
        console.log('drag over');

        e.preventDefault();
        console.log('drag over');
    }
    onDragEnd(e) {
        console.log('drag end')

        e.preventDefault();
        console.log('drag end')
        this.setState({ highLight: false });
    }
    onDragEnter(e) {
        console.log('drag enter');

        e.preventDefault();
        console.log('drag enter');
        console.log(!this.props.conquered);
    }
    onDragLeave(e) {
        console.log('drag leave');

        e.preventDefault();
        console.log('drag leave');
        if (canMoveKnight(this.props.knightPosition, this.props.x, this.props.y)) {
            this.setState({ highLight: false });
        }
    }
    render() {
        const { black } = this.props;
        const fill = black ? 'black' : 'white';
        const stroke = black ? 'white' : 'black';

        return (
            <div style={{
                backgroundColor: this.state.highLight ? 'yellow' : fill,
                color: stroke,
                width: '100%',
                height: '100%',
            }}
                onDragOver={(e) => this.onDragOver(e)}
                onDrop={(e) => this.onDrop(e)}
                onDragEnd={(e) => this.onDragEnd(e)}
                onDragLeave={(e) => this.onDragLeave(e)}>

                {this.props.conquered && <span style={{ position: 'absolute', fontSize: '15px' }}>&#127796;</span>}
                {this.props.children}
            </div>
        );
    }
}

Square.propTypes = {
    black: PropTypes.bool
};