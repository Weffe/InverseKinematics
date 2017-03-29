import React, { Component } from 'react';
import { Rect } from 'react-konva';

class Base extends Component {
    render() {

        // we set our drawing reference point to the bottom center of the Stage
        return (
                <Rect
                    draggable={true}
                    x={0} y={0}
                    width={this.props.width} height={this.props.height}
                    fill="gray"
                />
        );
    }
}

export default Base;
