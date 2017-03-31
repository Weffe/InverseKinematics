import React, { Component } from 'react';
import { Switch, Row, Col, InputNumber, Button, message, Tabs, Tooltip, Icon } from 'antd';
import { Stage, FastLayer, Layer, Group, Rect, Circle, Text, Line } from 'react-konva';
import Konva from 'konva';
import { Fabrik } from './Fabrik';
import AngleDisplayer from './AngleDisplayer';
const TabPane = Tabs.TabPane;

class DemoPage extends Component {
    constructor(props) {
        super(props);

        this.fabrik = new Fabrik();
        const fabrik = this.fabrik;
        this.initialPoints = {};
        this.initialBones = {};

        // For Demo purposes
        this.numberOfBones = 7;
        for(let i = 0; i < this.numberOfBones ; i++) {
            fabrik.addBone( {boneLength: 100}, 45);
        }


        for(let i = 0, length = fabrik.state.points.length; i < length; i++) {
            // dynamically set all the States' points with the New Points
            this.initialPoints["p" + i] = {
                x: fabrik.state.points[i].getComponent(0),
                y: fabrik.state.points[i].getComponent(1) * -1, // this is to convert from cartesianal to gui coordiantes
            };

            // make sure we don't go out of bounds for the bones & accidentally create a new bone(N+1) object
            if (i < length - 1) {
                this.initialBones["bone" + (i + 1)] = fabrik.state.bones[i];
                this.initialBones["bone" + (i + 1)].stroke = "#a1a1a1"
            }
        }

        // init default values
        this.state = Object.assign({}, this.initialBones, this.initialPoints,
            {
                target: {
                    x: fabrik.state.points[fabrik.state.points.length - 1].x,
                    y: fabrik.state.points[fabrik.state.points.length - 1].y * -1
                },
                bonesAmount: this.numberOfBones,
                showGrids: true,
                solveOnDragMove: true,
                showBoneAngles: true
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

        this.cacheNodes = [];
        this.bonesLength = 100;
    }

    /**
     * This function updates the chain in React's state
     * @param {Object} result - new state of the result
     */
    updateChain = (result) => {
        const newState = this.state;
        for(let i = 1, length = result.points.length; i < length; i++) {
            const point = result.points[i];

            // updating the respective bone's angle
            // we subtract i-1 because the bones [] starts at 0
            newState["bone" + i] = result.bones[(i - 1)];

            // we use just i because we don't care about the first point which is (0,0,0)
            // dynamically updating all the States' points with the New Points
            if (newState["p" + i]) {
                newState["p" + i].x = point.getComponent(0);
                newState["p" + i].y = point.getComponent(1) * -1; // this is to convert from cartesianal to gui coordiantes
            }
            else {
                newState["p" + i] = {
                    x: point.getComponent(0),
                    y: point.getComponent(1) * -1
                }
            }
        }

        this.setState(newState);
    };

    handleTargetDrag = (event) => {
        let target = {x: event.target.attrs.x, y: event.target.attrs.y};

        // flipping mouse.y coordinates to "cartesian"
        target.y *= -1;

        // result will be an Object of "points" {Array of Vector3} & "bones" {Array of Objects}
        let fixedBase = false;
        let result = this.fabrik.solveIK(target.x, target.y, fixedBase);

        this.updateChain(result);

        // just to update the circle target's new (x, y). Don't worry about this.
        this.setState({target: {
            x: target.x,
            y: target.y *-1
        }});
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

    updateBoneLengths = (boneLength) => {
        let result = this.fabrik.updateBonesLength(boneLength);
        this.bonesLength =  boneLength;
        this.updateChain(result);

    };

    componentDidMount() {
        // caching nodes to help with performance
        for(let node of this.cacheNodes) {
            node.cache();
        }

        this.refs.target.cache();
    }

    handleTabChange = (tabkey) => {
        if (tabkey != 0) {
            this.state[`bone${tabkey}`].stroke = "#47ff0a";
            if (this.oldBoneIndex) {
                this.state[`bone${this.oldBoneIndex}`].stroke = "#a1a1a1";
            }
            this.oldBoneIndex = tabkey;
        }
        else {
            if (this.oldBoneIndex) {
                this.state[`bone${this.oldBoneIndex}`].stroke = "#a1a1a1";
            }
        }
    };

    handleBoneChainChange = (value) => {
        if (value < this.state.bonesAmount) {
            let result = this.fabrik.removeBone();
            this.updateChain(result);
        }
        else {
            this.randomColors.push(Konva.Util.getRandomColor());
            let result = this.fabrik.addBone({boneLength: this.bonesLength});
            this.updateChain(result);
        }

        this.setState({bonesAmount: value});
    };


    render() {
        this.renderPoints = [];
        this.renderBones = [];
        let renderGrids = [];
        let angleDisplayers = [], angleDisplayersTabs;
        for(let i=0; i < this.state.bonesAmount + 1; i++) {
            this.renderPoints.push(
                <Circle x={this.state["p" + i].x} y={this.state["p" + i].y}
                        width={15} fill={this.randomColors[i]} key={i}
                        ref={(node) => { this.cacheNodes.push(node); }}
                />
            );

            // make sure we don't go out of bounds
            if (i < this.state.bonesAmount) {
                this.renderBones.push(
                    <Line stroke={this.state[`bone${i+1}`].stroke || "#a1a1a1"} strokeWidth={5} key={i}
                          points={[
                              this.state["p" + i].x, this.state["p" + i].y,
                              this.state["p" + (i + 1)].x, this.state["p" + (i + 1)].y
                          ]}
                    />
                );
            }

            renderGrids.push(
                // y-grids
                <Rect x={this.state["p" + i].x} y={-this.layer.y * 0.5}
                      width={2} height={this.stage.height}
                      fill={this.randomColors[i]}
                      ref={(node) => { this.cacheNodes.push(node); }}
                />,
                //x-grids
                <Rect x={-this.stage.width/2} y={this.state["p" + i].y}
                      width={this.stage.width} height={2}
                      fill={this.randomColors[i]}
                      ref={(node) => { this.cacheNodes.push(node); }}
                />
            );

            // For demo purposes
            // ignore the first point (base point) since its just (0,0)
            if (i !== 0) {
                angleDisplayers.push(
                        <AngleDisplayer key={i * 10} index={i} showBoneAngles={this.state.showBoneAngles}
                                globalAngle={this.state["bone" + i].globalAngle}
                                localAngle={this.state["bone" + i].localAngle}

                        />
                );
            }
        }

        angleDisplayersTabs = angleDisplayers.map( (AngleDisplayer, i) => {
            return (
                <TabPane tab={`Bone ${i+1}`} key={i+1}>
                    {AngleDisplayer}
                </TabPane>
            );
        });

        return (
            <div>
                <h2>Fixed Basepoint - Unconstrained {this.state.bonesAmount} Bones</h2>
                <Stage width={this.stage.width} height={this.stage.height} ref="stage" >
                    {/* This is just to draw a border around our drawing canvas Stage */}
                    <FastLayer>
                        <Rect width={this.stage.width} height={this.stage.height} fill="white"
                              stroke="black" strokeWidth={3} dash={[10, 7]}
                              ref={(node) => { this.cacheNodes.push(node); }}
                        />
                    </FastLayer>

                    {/* Actual drawn elements */}
                    <Layer x={this.layer.x} y={this.layer.y * 0.5}>

                        {/*Base where the arm is attached to*/}
                        <Rect
                            x={0} y={0}
                            width={this.base.width} height={this.base.height}
                            fill="gray"
                            ref={(node) => { this.cacheNodes.push(node); }}
                        />

                        <Group offsetX={-this.base.width / 2}>
                            {(this.state.showGrids) ? renderGrids : null}

                            {this.renderBones}

                            {this.renderPoints}


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
                    <Row>
                        <h2>Controls</h2>
                    </Row>
                    <Row type="flex" align="middle">
                        <Col span={2}>
                            <Switch checkedChildren="Grids On" unCheckedChildren="Grids Off" defaultChecked={true}
                                onChange={(switchValue) => {this.setState({showGrids: switchValue})}}/>
                        </Col>

                        <Col span={3}>
                            <Switch checkedChildren="Solve While Moving" unCheckedChildren="Solve On Drop" defaultChecked={true}
                                    onChange={(switchValue) => {this.setState({solveOnDragMove: switchValue})}}/>
                        </Col>

                        <Col span={3}>
                            <Switch checkedChildren="Show Bone Angles" unCheckedChildren="Hide Bone Angles" defaultChecked={true}
                                    onChange={(switchValue) => {this.setState({showBoneAngles: switchValue})}}/>
                        </Col>

                        <Col span={3}>
                            <Row type="flex" align="middle">
                                <Col span={12} >
                                    <h4>Bone Length</h4>
                                </Col>
                                <Col span={12} pull={3}>
                                    <InputNumber defaultValue={100} min={20} onChange={this.updateBoneLengths}/>
                                </Col>
                            </Row>
                        </Col>

                        <Col span={3}>
                            <Row type="flex" align="middle">
                                <Col span={12} >
                                    <h4>Number of Bones</h4>
                                </Col>
                                <Col span={12} >
                                    <InputNumber formatter={value => `${value.replace(' bones', '')} bones`} defaultValue={this.numberOfBones}
                                             onChange={this.handleBoneChainChange} min={1}/>
                                </Col>
                            </Row>
                        </Col>

                        <Col span={2} offset={1}>
                            <Button onClick={this.resetTarget}>Reset Target</Button>
                        </Col>

                        <Col span={1}>
                            <Tooltip title="I recommend turning off the grids and bone angles for extra performance">
                                <a href="#" style={{borderRadius: '5px', padding: '7px 6px 5px 7px', border: '1px solid lightgray'}}>
                                    <Icon type="info-circle-o" style={{color: '#108EE9', fontSize: 14}}/>
                                </a>
                            </Tooltip>
                        </Col>

                    </Row>

                    <Row style={(this.state.showBoneAngles) ? {display: "block"} : {display: "none"}}>
                        <Tabs defaultActiveKey="0" onChange={this.handleTabChange}>
                            <TabPane tab="All Angles" key="0">{(this.state.showBoneAngles) ? angleDisplayers : null}</TabPane>
                            {(this.state.showBoneAngles) ? angleDisplayersTabs : null}
                        </Tabs>
                    </Row>
                </Row>
            </div>
        );
    }
}

export default DemoPage;