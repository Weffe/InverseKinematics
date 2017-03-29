import React, { Component } from 'react';
import Base from './Base';
import { Switch, Row, Col, InputNumber, Button, message } from 'antd';
import { Stage, Layer, Group, Rect, Circle, Text, Line } from 'react-konva';
import Konva from 'konva';
import { Fabrik } from './Fabrik';
import Control from './Control';

class DemoPage extends Component {
    constructor(props) {
        super(props);

        this.fabrik = new Fabrik();
        const fabrik = this.fabrik;
        
        // For Demo purposes
        let numberOfBones = 3;
        for(let i = 0; i < numberOfBones; i++) {
            fabrik.addBone( {boneLength: 100}, 45);
        }


        let initialPoints = {}, initialBones = {};
        for(let i = 0, length = fabrik.state.points.length; i < length; i++) {
            // dynamically set all the States' points with the New Points
            initialPoints["p" + i] = {
                x: fabrik.state.points[i].getComponent(0),
                y: fabrik.state.points[i].getComponent(1) * -1, // this is to convert from cartesianal to gui coordiantes
            };

            // make sure we don't go out of bounds for the bones & accidentally create a new bone(N+1) object
            if (i < length - 1) {
                initialBones["bone" + (i + 1)] = fabrik.state.bones[i];
            }
        }

        // init default values
        this.state = Object.assign({},
            initialPoints,
            initialBones,
            {
                target: {
                    x: fabrik.state.points[fabrik.state.points.length - 1].x,
                    y: fabrik.state.points[fabrik.state.points.length - 1].y * -1
                },
                numberOfBones: numberOfBones,
                solveOnDragMove: true,
            }
        );

        this.stage = {
            width: window.outerWidth * 0.9,
            height: 700,
        };
        
        this.base = {
            width: 150,
            height: 35
        };
        
        // bottom centering
        // this x & y are the base coordinates of "imaginary" cartesianal plane
        this.layer = {
            x: (this.stage.width/2 - this.base.width/2),
            y: (this.stage.height - this.base.height),
        };
    }

    handleTargetDrag = (event) => {
        let target = {x: event.target.attrs.x, y: event.target.attrs.y};

        // flipping mouse.y coordinates to "cartesian"
        target.y *= -1;

        // result will be an Object of "points" {Array of Vector3} & "bones" {Array of Objects}
        let fixedBase = false;
        let result = this.fabrik.solveIK(target.x, target.y, fixedBase);

        const newState = this.state;
        for(let i = 1, length = result.points.length; i < length; i++) {
            const point = result.points[i];

            // updating the respective bone's angle
            // we subtract i-1 because the bones [] starts at 0
            newState["bone" + i] = result.bones[(i - 1)];

            // we use just i because we don't care about the first point which is (0,0,0)
            // dynamically updating all the States' points with the New Points
            newState["p" + i].x = point.getComponent(0);
            newState["p" + i].y = point.getComponent(1) * -1; // this is to convert from cartesianal to gui coordiantes
        }

        // just to update the circle target's new (x, y). Don't worry about this.
        newState.target.x = target.x;
        newState.target.y = target.y * -1;

        this.setState(newState);
    };

    componentWillMount() {
        // Save randomly generated colors for the renderPoints
        this.randomColors = [];

        for(let i=0, length=this.fabrik.state.points.length; i < length; i++) {
            this.randomColors.push(Konva.Util.getRandomColor());
        }
    }

    resetTarget = () => {
        this.refs.target.to({
            x: 0, y: 0,
            duration: 0.4
        });
        message.info('Target is now at position (0, 0)');
        this.setState({target: {x: 0, y:0}});
    };

    render() {
        let renderPoints = [], renderBones = [], renderGrids = [];
        let demoControls = []; // for demo purposes
        for(let i=0, length=this.fabrik.state.points.length; i < length; i++) {
            renderPoints.push(
                <Circle ref={"p" + i}
                        x={this.state["p" + i].x} y={this.state["p" + i].y}
                        width={15} fill={this.randomColors[i]} key={i}
                />
            );

            // make sure we don't go out of bounds
            if (i < length - 1) {
                renderBones.push(
                    <Line stroke="rgb(170,170,170)" strokeWidth={5} key={i}
                          points={[
                              this.state["p" + i].x, this.state["p" + i].y,
                              this.state["p" + (i + 1)].x, this.state["p" + (i + 1)].y
                          ]}
                    />
                );
            }

            // y-grids
            renderGrids.push(
                <Rect x={this.state["p" + i].x} y={-this.layer.y * 0.5}
                      width={2} height={this.stage.height}
                      fill={this.randomColors[i]}
                      visible={this.state.grids}
                />
            );

            //x-grids
            renderGrids.push(
                <Rect x={-this.stage.width/2} y={this.state["p" + i].y}
                      width={this.stage.width} height={2}
                      fill={this.randomColors[i]}
                      visible={this.state.grids}
                />
            );

            // For demo purposes
            // ignore the first point (base point) since its just (0,0)
            if (i !== 0) {
                demoControls.push(
                    <Control key={i} index={i} globalAngle={this.state["bone" + i].globalAngle}
                             localAngle={this.state["bone" + i].localAngle}/>
                );
            }
        }

        return (
            <div>
                <h2>Fixed Basepoint - Unconstrained {this.fabrik.state.bones.length} Bones</h2>
                <Stage width={this.stage.width} height={this.stage.height}>
                    {/* This is just to draw a border around our drawing canvas Stage */}
                    <Layer>
                        <Rect width={this.stage.width} height={this.stage.height} fill="white"
                              stroke="black" strokeWidth={3} dash={[10, 5]} />
                    </Layer>

                    {/* Actual drawn elements */}
                    <Layer x={this.layer.x} y={this.layer.y * 0.5}>

                        {/*Base where the arm is attached to*/}
                        <Rect
                            x={0} y={0}
                            width={this.base.width} height={this.base.height}
                            fill="gray"
                        />

                        <Group offsetX={-this.base.width / 2}>
                            {renderGrids}

                            {renderBones}

                            {renderPoints}


                            {/*Our End Target*/}
                            <Group draggable={true} ref="target"
                                   onDragMove={ (this.state.solveOnDragMove) ? this.handleTargetDrag : () => {}}
                                   onDragEnd={this.handleTargetDrag}
                                   onMouseOver={() => {document.body.style.cursor = "move"}}
                                   onMouseOut={() => {document.body.style.cursor = "default"}}
                                   x={this.state.target.x} y={this.state.target.y}
                            >
                                <Circle width={30} fill="rgba(255,0,0,0.5)"/>
                                <Rect x={15} width={70} height={3} fill="rgba(255,0,0,0.5)"/>
                                <Text x={20} y={-15} text="Drag Me" fill="red" fontSize={16}/>
                            </Group>

                        </Group>
                    </Layer>
                </Stage>

                <Row id="controls">
                    <h2>Controls</h2>
                    <Row gutter={6}>
                        <Col span={4}>
                            <Switch checkedChildren="Grids On" unCheckedChildren="Grids Off" defaultChecked={true}
                                onChange={(switchValue) => {this.setState({grids: switchValue})}}/>
                        </Col>

                        <Col span={4}>
                            <Switch checkedChildren="Solve While Moving" unCheckedChildren="Solve On Drop" defaultChecked={true}
                                    onChange={(switchValue) => {this.setState({solveOnDragMove: switchValue})}}/>
                        </Col>

                        <Col span={8}>
                            <Row>
                                <InputNumber formatter={value => `${value.replace(' bones', '')} bones`} defaultValue={3} min={1} />
                                <Button onClick={() => {}}>Update IK Chain</Button>
                            </Row>
                        </Col>

                        <Col span={4}>
                            <Button onClick={this.resetTarget}>Reset Target</Button>
                        </Col>
                    </Row>

                    {demoControls}
                </Row>
            </div>
        );
    }
}

export default DemoPage;