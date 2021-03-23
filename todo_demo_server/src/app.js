const express = require('express');
const app = express(); // express 实例
const bodyParser = require('body-parser') // 接收post接口中的body参数的中间件
const modules = require('../db/models') // 导入模型
// 因为可能会跨域，因此增加跨域处理
var cors = require('cors');
app.use(cors({origin: true, credentials: true}));

// body中间件转换
app.use(express.json()); // 专门处理json的中间件
app.use(express.urlencoded()) //  对url参数进行lencoded
app.use(bodyParser.urlencoded({extended: true})) //  对过滤参数做lencoded

//1、查询任务列表   参数: 根据状态和页码进行查询
app.get('/list/:status/:page', async (req,res, next) => { // 1. 分页的处理，2.状态 -> 1代办 2完成 3删除 -1代表查询全部
  try {
    console.log(req.params)
    let { status, page } = req.params;
    let limit = 10; // 每页个数
    let where = { } // 根据状态，进行分页查询
    if(status != '-1') { // -1的时候，就不需要去传递了
        where.status = status
    }
    let offset = (page - 1 ) * limit; // 开始读取数据的,偏移量，默认从0开始。 应该是根据页码来计算的，第1页,那就从0开始，第2页，从10开始
    let list = await modules.Todo.findAndCountAll({ // findAndCountAll 对某一个数据进行查询汇总
        where, 
        offset,
        limit
    });
    res.json({
      list: list,
      message: '查询成功'
    })
  } catch(err) {
    next(err)
  }
  
})
// 2、 新增任务接口
app.post('/create', async (req,res, next)=> {
  try{  // 防止有异常发生，因此要进行try catch
     // 必须需要中间件，来转换，否则拿不到，安装express的-> body-parser 中间件即可
     console.log(req.body)
    let { name, endTime, content } = req.body; // post请求的 参数都是放在body中的
    let todo = await modules.Todo.create({ // 去数据库模型中新增数据, modules方法返回promise，因此用到await
      name,
      endTime,
      content
    })
    res.json({
      todo: {},
      name,
      endTime,
      content
    })
  } catch(error) { // 有异常进来，就通过next把异常传递下去，会被全局的异常处理捕获到，然后全局的异常处理会去处理
    next(error)
  } 
})
// 3、 修改任务接口 必须要有id接口, 演示而已，后期可以和新增公用，判断id即可
app.post('/update', async (req,res, next)=> {
  try{
    let { name, endTime, content, id } = req.body; // post请求的 参数都是放在body中的
    let todo = await modules.Todo.findOne({ // 首先根据id，在数据库模型中，找到对应的数据，然后进行修改操作，只有一个!
      where: {
        id
      }
    })
    if(todo){ // 存在，代表找到，找到才去更新
      todo = await todo.update({ // todo 本身就是modules对象了，可以直接操作， 注意所有方法都是异步的，因此要处理异步。
        name,
        endTime,
        content
      })
    }
    res.json({
      todo: todo
    })
  } catch(err) {
    next(err); // 下一步，交给异常处理去捕获操作。
  }
  
})

// 4、 修改状态按钮和删除共用一个接口即可
app.post('/update_status', async (req,res, next)=> { // status 1代办 2完成 3删除
  try{
    let { id, status } = req.body; 
    let todo = await modules.Todo.findOne({ // 先找到对应id
      where: {
        id
      }
    })
    if(todo && status != todo.status ) { // todo存在并且状态一定改变的时候，才去进行修改状态逻辑. 不要用全等，因为解析可能不同
         todo = todo.update({ // todo 本身就是modules对象了，可以直接操作。
          status
        })
    }
    res.json({
      todo: todo // 把修改后的去进行更新
     
    })
  } catch(error) {
    next(error)
  }

})




// 所有的错误，让我们的http的status=== 500, 方便进行异常处理统一抛出去
app.use((err, req, res ,next) => {
    if(err) {
        res.status(500).json({
          message: err.message // 异常抛出
        })
    }
})

app.listen(3333, ()=> {
  console.log('服务启动成功')
})