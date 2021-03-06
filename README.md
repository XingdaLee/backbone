# backbone
demo练习使用
## webpack-dev-server需要全局安装
1、el就是指向html的对，$el是Jquery的方式

2、改变model后backbone不会主动渲染，每次数据改变的时候要手动的render

3、Backbone.View.extend都是内存中渲染，需要render后在改变节点

## Model和View的事件机制

基础代码：

```
var obj = {
  "title":"task1",
  "description":"description1"
};
// 类
var ToDoItem = Backbone.Model.extend({

});
// 实例化,设置obj
var todoItem = new ToDoItem(obj);
var todoItem2 = new ToDoItem(obj);
```

扩展:

```
todoItem.on('change',function() {
  console.log(this.changed);
  if (this.hasChanged('title')) {
    console.log('title changed!');
  }else {
    console.log('description changed!');
  }
});
```
1、this指向todoItem ,hasChanged来判断当前的值是否改变。

2、this.changed会输出所有改变的值

3、每次set新的值时，会进行值比较（内部属性比较器）。如果值没变，不会重复调用change方法，事件都不会回调

4、model进行set时，有很多参数可选。如：

(1)普通设置一个属性todoItem.set('title','测试2')..

(2)设置多个属性todoItem.set({'title':'测试2','description':'测试lalalala'})..

(3)silent表示在set时候不要触发任何的事件todoItem.set('title','测试5',{silent:true})

(4)todoItem.trigger('change')属性会自动触发上面的change事件。trigger可以触发自定义事件abc，只需要在on中自定义事件todoItem.on('abc',function() {doing...});

(5)针对性的监听某个属性的变化使用下面的代码,change:title只监听title的变化才会触发

```
todoItem.on('change:title',function() {
  console.log(this.changed);
  if (this.hasChanged('title')) {
    console.log('title changed!');
  }else {
    console.log('description changed!');
  }
});
```
(6)  todoItem.off();会取消所有的监听事件。如果传参进去会结束掉指定的监听todoItem.off('change:title')

(7)下面的代码once表示事件只监听一次后，会销毁。
```
todoItem.once('change:title',function() {
  console.log(this.changed);
  if (this.hasChanged('title')) {
    console.log('title changed!');
  }else {
    console.log('description changed!');
  }
});
```
(8)todoItem2监听todoItem的change方法.listenToOnce表示监听一次
```
todoItem2.listenTo(todoItem,'change',function(){
  // this指向todoItem2
  console.log(this);
})
```
（9）View的监听机制，view可以监听model的变化，方法也是listenTo

### View和Model的事件关联(initialize增加自定义初始化)

一些公共的方法写到initialize里，以后类似todoItemView这样实例化后，都会调用

```
// view监听model的变化
var ToDoItemView = Backbone.View.extend({
  initialize:function() {
    this.listenTo(todoItem,'change',this.render);
  },
  render:function() {
    console.log('model is changed for initialize');
  }
});
// 引用model和todoItem做关联
var todoItemView = new ToDoItemView({
  model:todoItem
});
```
实践代码:
```
var obj = {
  "title": "task1",
  "description": "description1"
};
// 类
var ToDoItem = Backbone.Model.extend({

});
// 实例化,设置obj
var todoItem = new ToDoItem(obj);
var todoItem2 = new ToDoItem({
  "title": "task2",
  "description": "description2"
});
// mode;监听model的变化
// this.changed,this指向todoItem。changed是哪个值改变了救会显示哪个值
todoItem.on('change', function() {
  console.log(this.changed);
  if (this.hasChanged('title')) {
    console.log('title changed!');
  } else {
    console.log('description changed!');
  }
});
// todoItem2监听todoItem的change方法
todoItem2.listenTo(todoItem, 'change', function() {
  // this指向todoItem2
  console.log(this);
})
// view监听model的变化
var ToDoItemView = Backbone.View.extend({
  tagName: "div",
  className: "todo-item",
  events: {
    'click button': 'deleteFunc',
  },
  initialize: function() {
    this.listenTo(todoItem, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },
  render: function() {
    var json = this.model.toJSON();
    // console.log('model is changed for initialize');
    this.$el.html('<h3>' + json.title + '</h3><p>' + json.description + '</p><button>delete</button>');
    return this;
  },
  deleteFunc: function() {
    // 第一种方法直接调用remove
    // this.remove();
    // 第二种是从数据角度
    this.model.destroy();
  }
});
// 引用model和todoItem做关联
var todoItemView = new ToDoItemView({
  model: todoItem,
  // el:'#p1'
});
var todoItemView2 = new ToDoItemView({
  model: todoItem2,
  // el:'#p2'
});
todoItemView.render().$el.appendTo($('body'));
todoItemView2.render().$el.appendTo('body');
```
实践代码说明:
(1)view事件注册使用对象events，click可以使用选择器形式,如click button

(2)当前的数据对象模型是 this.model

(3)删除节点的两种方法，第一种直接使用this.remove(); 第二种（最佳）调用this.model.destroy()直接删除数据，然后在使用this.listenTo(this.model, 'destroy', this.remove);监听到以后，在调用this.remove

## Backbone事件原理(单独使用Events)

```
var Cat = function() {

};
// 将Backbone.Events对象绑定到Cat.prototype
_.extend(Cat.prototype,Backbone.Events);
var tom = new Cat();
var jerry = new Cat();
jerry.listenTo(tom,'run',function(){
  // 只看run输出后的tom
  console.log('run');
  console.log(tom);
});
tom.trigger('run');
```

## 和服务器交互(model和restful的通信)

示例代码:

```
// 如果请求后服务器中返回了id和code的属性，backbone会做一个同步，将id和code封装到task中
var Task = Backbone.Model.extend({
  idAttribute:"id",
  defaults:{
    'identify':'p_lixd'
  },
  urlRoot:"http://repit.sinaapp.com/api/task"
});
var task = new Task({
  'title':'coursl',
});
// 第一次是post
task.save();
console.log(task);
// 如果在save，因为task里已经有id，backbone会认为服务器中已经存在该条数据，只会执行更新操作
task.set('title','cours2')
// 第二次put更新，内建机制，前提是有id属性
task.save();
// 更改Method.
task.save({title:'cours3'},{patch:true});
// 删除,task会自动传id到后台Method是delete，进行删除
task.destroy();
// 根据id拉取数据
task.fetch();

```
idAttribute:设置默认的标识，如果不设置默认是id

save方法包含:POST、PUT、PATCH

destroy包含:DELETE、'destroy'事件（根据id删除数据）

fetch:GET（根据id获取数据）

defaults:设置默认属性,task里也可以重新定义属性的值，可以直接覆盖defaults里的属性

urlRoot的规则

sync事件：上面的所有和服务器交互的事件都会触发sync。例如监听sync事件:

```
task.on("sync", function() {
  debugger
});
```
## Backbone集合

集合基本用法：

集合事件

集合与服务器交互
