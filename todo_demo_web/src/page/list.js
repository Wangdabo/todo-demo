import React, {Component} from 'react';
import '../css/list.css';
import moment from 'moment';
import axios from 'axios'
import { Divider, Table, Button, Space, message, Form, Col, Row, Input,DatePicker, Drawer } from 'antd';
export default class Home extends Component {
  formRef = React.createRef()
   constructor(props) {
     super(props)
      this.queryData = this.queryData.bind(this)
      this.state = {
        columns : [
          {
            title: 'id',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '标题',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: '内容',
            dataIndex: 'content',
            key: 'content',
          },
          {
            title: '截止日期',
            dataIndex: 'endTime',
            key: 'endTime',
          },
          {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
          },
          {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
              <Space size="middle">
                 <Button onClick={ () => this.editHander(record)}>编辑</Button>
                 {
                   record.status !=='3'? 
                       <div>
                          <Button  type="primary" onClick={() => this.changeStatus(record)}>{record.status == '1'? '代办': '完成'}</Button> 
                          <Button className='delbox' type="primary" danger  onClick={() => this.delHandel(record)}>删除</Button>
                       </div>
                        : null
                 }
              </Space>
            ),
            filters: [
              {
                text: '全部',
                value: '-1',
              },
              {
                text: '代办',
                value: '1',
              },
              {
                text: '完成',
                value: '2',
              },
              {
                text: '删除',
                value: '3',
              },
            ],
            filterMultiple: false,
            onFilter: (value, record) => {
              console.log(value)
              //  this.queryData(value)
            },
          },
        ],
        visible: false,
        data:[],
        pageSize:10,
        total: 30,
        page: 1,
        type: 'add',
        items: {}
      }
   }
   

  componentDidMount() { // 组件已挂载, 可进行状态更新操作
    this.queryData('-1'); // 查询所有
  }
    // 重置表单
  onReset() {
      this.formRef.current.resetFields()
  }
  onClose = () => {
      this.setState({
        visible: false,
      });
  };
  // 新增表单
  addHandel = () => {
      this.setState({
        visible: true,
        type: 'add'
      }, ()=> {
        this.formRef.current.resetFields()
      });   
  };
    // 更改状态, 根据demo来
    changeStatus = (item)  => {
      console.log(item)
      if(item.status == '3') {
        item.status = '1' // 从删除变成代办
        axios.post('http://127.0.0.1:3333/update_status', item)
        .then(response =>  {
          this.queryData('-1');
          message.success('状态变更代办成功');
        })
      }  else if(item.status == '1') {
        item.status = '2' // 从代办变成完成
        axios.post('http://127.0.0.1:3333/update_status', item)
        .then(response =>  {
          this.queryData('-1');
          message.success('状态变更完成');
        })
      } 
    } 
  // 删除数据
  delHandel = (item) => {
    message.success('任务删除成功');
    item.status = '3' // 全部改成删除装填
    axios.post('http://127.0.0.1:3333/update_status', item)
    .then(response =>  {
      this.queryData('-1');
    })
   }
 // 修改数据
  editHander(item) {
    this.setState({
      visible: true,
      type: 'update',
      items: item
    });
    // 重新赋值
    setTimeout(() => {
      this.formRef.current.setFieldsValue({
        "name": item.name,
        "content": item.content,
        "endTime": moment(item.endTime)
      })
    })
 }
   // 提交表单
   onFinish(itemInfo){
    itemInfo.endTime  = moment(itemInfo.endTime).format('YYYY-MM-DD') //这么解决的
    if(this.state.type == 'add') {      // 调用新增接口
      itemInfo.status = '1'; // 默认是1
      axios.post('http://127.0.0.1:3333/create', itemInfo)
      .then(response => {
        message.success('任务新增完成');
        this.queryData('-1')
        this.setState({
          visible: false,
        });   
      })
  } else {   // 调用修改接口
      itemInfo.status = this.state.items.status 
      itemInfo.id = this.state.items.id 
       axios.post('http://127.0.0.1:3333/update', itemInfo)
       .then(response => {
         message.success('任务修改完成');
         this.queryData('-1')
         this.setState({
           visible: false,
         });   
       })
  }
  
  }

   // 查询所有列表
   queryData(item) {
     console.log(this.state)
    axios.get('http://127.0.0.1:3333/list/' + item + '/' + this.state.page)
        .then(response => {
          var items = response.data.list.rows;
          this.setState({  
            data: items.map(item => ({...item}))  
          }); 
          this.data = response.data.list.rows; 
          this.total = response.data.list.count;
        })
  }

  pageChange() {
    console.log('触发')
  }
 render() {

    const { columns} = this.state
    
    return (
      <div className="listbox">
        <div className="header">
           <h1>导航</h1>
           <a href='/home'>返回首页</a>
        </div>
        <div className="divide">
          <Divider>任务列表</Divider>
        </div>
        <div className="box">
          <Button type="primary" onClick={this.addHandel}>新增</Button>
          <div className="table">
          <Table columns={columns} dataSource={ this.state.data} border total={this.state.total}  pageSize={this.state.pageSize} onChange={()=> this.pageChange()} />
          </div>
        </div>
        <Drawer
            title="新增任务"
            width={500}
            placement="right"
            closable={false}
            onClose={this.onClose}
            visible={ this.state.visible }
            bodyStyle={{ paddingTop: 80 }}
            >
              <Form layout="vertical" ref={ this.formRef }  onFinish={(event)=>this.onFinish(event)}>
                  <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="name"
                          label="任务名称:"
                          rules={[{ required: true, message: '请必须输入任务名称' }]}
                        >
                          <Input/>
                        </Form.Item>
                      </Col>
                  </Row>
                  <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="endTime"
                          label="任务截止日期:"
                          rules={[{ required: true, message: '请必须输入任务名称' }]}
                        >
                             <DatePicker className="dateStyle"/>
                        </Form.Item>
                      </Col>
                  </Row>
                  <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="content"
                          label="任务内容:"
                          rules={[{ required: false}]}
                        >
                          <Input.TextArea />
                        </Form.Item>
                      </Col>
                  </Row>
                  <Row gutter={16}>
                  <Col span={8}> <Button type="primary" htmlType="submit">提交</Button> </Col>
                  <Col span={8}> <Button  onClick={ () => this.onReset() }>重置</Button> </Col>
                  <Col span={8}> <Button type="primary"  danger  onClick={this.onClose}>取消</Button> </Col>
                  </Row>

              </Form>
          </Drawer>
      </div>
    );
 }
}