import React from 'react';
import '../css/home.css';


export default class Home extends React.Component {
    render() {
        return (
            <div className="header">
                    <h1>导航</h1>
                    <a href='#/list'>任务列表页面</a>
            </div>
        )
    }
}