import React, { Component } from 'react';
import './App.css';
import { Layout, Icon, Row, Col } from 'antd';
import DemoPage from './DemoPage'
const { Header, Content, Footer } = Layout;

class App extends Component {
    render() {
        return (
            <Layout theme="light">
                <Header><h1 style={{color: 'white'}}>Inverse Kinematics - Fabrik Algorithm Demo</h1></Header>
                <Content style={{padding: '25px 50px', background: 'white'}}>
                    <DemoPage />
                </Content>
                <Footer>
                    <Row style={{fontSize: 14}}>
                        <Col span={22}>Made with <Icon type="heart-o" /> - Michael Negrete </Col>
                        <Col span={2}>
                            <a target="_blank" href="http://github.com/Weffe/InverseKinematics/tree/master/demo-fabrik">
                                <Icon type="github"/> Github Project
                            </a>
                        </Col>
                    </Row>
                </Footer>
            </Layout>
        );
    }
}

export default App;