import React, { Component } from 'react';
import { Row, Col, Slider, InputNumber } from 'antd';

class Control extends Component {
    componentWillReceiveProps(nextProps) {
        // console.log(nextProps);
    }

    render() {
        let h4_style = {
            paddingLeft: '15px',
            fontStyle: 'italic'
        };
        return (
            <div>
                <Row>
                    <h3>Bone {this.props.index} Degree Values</h3>
                </Row>
                <Row gutter={8}>
                    <h4 style={h4_style}>Local Angle</h4>
                    <Col span={22}>
                        <Slider min={-360} max={360} step={0.01} value={this.props.localAngle} />
                    </Col>
                    <Col span={2}>
                        <InputNumber min={-360} max={360} step={0.01} value={this.props.localAngle}/>
                    </Col>
                </Row>
                <Row gutter={8}>
                    <h4 style={h4_style}>Global Angle</h4>
                    <Col span={22}>
                        <Slider min={-360} max={360} step={0.01} value={this.props.globalAngle} />
                    </Col>
                    <Col span={2}>
                        <InputNumber min={-360} max={360} step={0.01} value={this.props.globalAngle}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default Control;