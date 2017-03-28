import React, { Component } from 'react';
import './App.css';
import { Layout, Icon } from 'antd';
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
                <Footer>Made with <Icon type="heart-o" /> - Rogelio Negrete</Footer>
            </Layout>
        );
    }
}

export default App;