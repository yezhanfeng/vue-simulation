// new Yvue( { data:{...} } )
class Yvue {
  constructor(options) {
    // 保存选项
    this.$options = options;
    // 数据的响应化
    this.$data = options.data;
    this.obverse(this.$data);
    // 模拟watcher创建过程
    // new Watcher();
    //  // 通过访问test属性出发get函数，添加依赖
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;
    new Compile(options.el, this)
    if (options.created) {
      options.created.call(this);
    }
  }
  obverse (value) {
    if (!value || typeof value !== 'object') {
      return;
    }
    // 遍历该对象
    Object.keys(value).forEach(key => {
      this.defineReactive(value, key, value[key]);
      // 代理data中的属性到vue实例上
      this.proxyData(key);
    })
  }
  // 数据响应化
  defineReactive (obj, key, val) {
    this.obverse(val) // 递归解决数据嵌套
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      get () {
        Dep.target && dep.addDep(Dep.target);
        return val;
      },
      set (Newval) {
        if (Newval === val) {
          return;
        }
        val = Newval;
        // console.log(`${key}属性更新了：${val}`);
        dep.notify();
      }
    })
  }
  proxyData (key) {
    Object.defineProperty(this, key, {
      get () {
        return this.$data[key];
      },
      set (Newval) {
        this.$data[key] = Newval;
      }
    })
  }
}

// Dep:用来管理Watcher
class Dep {
  constructor() {
    //这里存放各种依赖（watcher）
    this.deps = [];
  }
  addDep (dep) {
    this.deps.push(dep);
  }
  notify () {
    this.deps.forEach(dep => dep.update());
  }
}

//Watcher
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    //将当前watcher实例指定到Dep静态属性target
    Dep.target = this;
    this.vm[this.key]; //触发getter，添加依赖
    Dep.target = null;
  }
  update () {
    // console.log('属性更新了');
    this.cb.call(this.vm, this.vm[this.key])
  }
}