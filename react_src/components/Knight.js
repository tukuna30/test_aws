import React, { Component } from 'react';
import monitor from "../helpers/monitor";


export default class Knight extends Component {
    onDragStart(e) {
        e.dataTransfer.setData('id', 'knight'); // without this on Firefox drag and drop fails
        console.log('being dragged');
        monitor.emit('dragInProgress', e);
    }

    render() {
        return <div style={{ fontSize: '30px', color: 'golden', cursor: 'move' }}
            onDragStart={(e) => this.onDragStart(e)}
            draggable
        >♘</div>;
    }

}