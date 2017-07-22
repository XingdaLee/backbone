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
