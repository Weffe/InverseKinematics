import React, { Component } from 'react';
import { Row, Col, Slider, InputNumber } from 'antd';

class AngleDisplayer extends Component {
    constructor(props) {
        super(props);

        this.marks = {};

        for(let i=-360; i <= 360; i++) {
            if (i % 90 === 0) {
                this.marks[i] = {
                    style: {
                        color: '#108EE9',
                    },
                    label: `${i}°`
                }
            }
        }

        this.h4_style = {
            marginBottom: '-5px',
            paddingLeft: '42px',
            fontStyle: 'italic'
        };

        this.state = {
            localAngle: this.props.localAngle,
            globalAngle: this.props.globalAngle
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.showBoneAngles && this.state.localAngle !== nextProps.localAngle
            && this.state.localAngle !== nextProps.globalAngle) {
            this.setState({
                localAngle: nextProps.localAngle,
                globalAngle: nextProps.globalAngle
            });
        }
    }

    formatValue = (value) => {
        return parseFloat(value).toFixed(2).toString();
    };

    render() {
        return (
            <Row>
                <Row>
                    <h3>Bone {this.props.index} Degree Values</h3>
                </Row>
                <Row>
                    <h4 style={this.h4_style}>Local Angle</h4>
                    <Col span={20} offset={1} >
                        <Slider min={-360} max={360} step={0.01} value={this.state.localAngle} marks={this.marks}/>
                    </Col>
                    <Col span={2} offset={1}>
                        <InputNumber min={-360} max={360} step={0.01} value={this.state.localAngle} formatter={this.formatValue}/>
                    </Col>
                </Row>
                <Row>
                    <h4 style={this.h4_style}>Global Angle</h4>
                    <Col span={20} offset={1}>
                        <Slider min={-360} max={360} step={0.01} value={this.state.globalAngle} marks={this.marks}/>
                    </Col>
                    <Col span={2} offset={1}>
                        <InputNumber min={-360} max={360} step={0.01} value={this.state.globalAngle} formatter={this.formatValue}/>
                    </Col>
                </Row>
            </Row>
        );
    }
}

export default AngleDisplayer;