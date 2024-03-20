class DevicePixelRatio {
    //获取系统类型
    _getSystem() {
      return true;
      // const agent = navigator.userAgent.toLowerCase();
      //现只针对windows处理，其它系统暂无该情况，如有，继续在此添加
      // if (agent.indexOf('windows') >= 0) {
      //   return true;
      // }
    }
    //监听方法兼容写法
    _addHandler(element, type, handler) {
      if (element.addEventListener) {
        element.addEventListener(type, handler, false);
      } else if (element.attachEvent) {
        element.attachEvent('on' + type, handler);
      } else {
        element['on' + type] = handler;
      }
    }
    //校正浏览器缩放比例
    _correct() {
      //页面devicePixelRatio（设备像素比例）变化后，计算页面body标签zoom修改其大小，来抵消devicePixelRatio带来的变化。
      const size = 1 / window.devicePixelRatio;
      const size2 = 100 / size + '%';
      (document.getElementById('wlg') as any).style.transform = 'scale(' + size + ')';
      (document.getElementById('wlg') as any).style.transformOrigin = '0 0';
      (document.getElementById('wlg') as any).style.width = size2;
      (document.getElementById('wlg') as any).style.height = size2;
    }
    //监听页面缩放
    _watch() {
      this._addHandler(window, 'resize', () => {
        //注意这个方法是解决全局有两个window.resize
        //重新校正
        this._correct();
      });
    }
    //初始化页面比例
    init() {
      if (this._getSystem()) {
        //判断设备，目前只在windows系统下校正浏览器缩放比例
        //初始化页面校正浏览器缩放比例
        this._correct();
        //开启监听页面缩放
        this._watch();
      }
    }
  }
  export default DevicePixelRatio;
  