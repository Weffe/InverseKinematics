import React, { Component } from 'react';
import './App.css';
import { Layout } from 'antd';
import DemoPage from './DemoPage'
const { Header, Content, Footer } = Layout;

class App extends Component {
    render() {
        return (
            <Layout>
                <Header>Inverse Kinematics - Fabrik Algorithm Demo</Header>
                <Content>
                    <DemoPage />
                </Content>
                <Footer>Made with love and tears - Rogelio Negrete</Footer>
            </Layout>
        );
    }
}

export default App;