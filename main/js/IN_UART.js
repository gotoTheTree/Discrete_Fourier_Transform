let port;
let reader;
let pause_s=false;
let indata = String('');
let t_text = String('');
async function connectToSerial() {
  try {
    // 1. 请求用户选择端口并授权
    port = await navigator.serial.requestPort();
    // 2. 打开端口（需配置波特率，常见为 9600 或 115200）
    await port.open({ baudRate: 115200 });
    console.log('串口已连接');
    document.getElementById('connectBtn').disabled = true;
    document.getElementById('disconnectBtn').disabled = false;
    
    // 连接成功后开始读取数据
    readFromSerial();
  } catch (error) {
    console.error('连接失败或用户取消:', error);
  }
}
document.getElementById('connectBtn').addEventListener('click', connectToSerial);

async function readFromSerial() {
  // 外层循环处理设备断开后重连的情况
  pause_s = false;
  while (!pause_s&&port) {
    reader = port.readable.getReader();
    try {
      // 内层循环持续读取数据流
      while (!pause_s&&port) {
        const { value, done } = await reader.read();
        if (done) {
          // 数据流结束（通常是设备被拔掉）
          reader.releaseLock();
          break;
        }
        // value 是 Uint8Array，需解码为字符串
        const text = new TextDecoder().decode(value);
        t_text += text;
        //console.clear();
        if(2==(t_text.split('*').length-1)){
          indata = t_text.replace(/\*/g, '');
          t_text = ' ';
          console.log(indata);
        }
        
        // 在这里处理你的数据，例如显示在页面上
      }
      console.log('流读取结束_____');
    } catch (error) {
      console.error('读取错误:', error);
    } finally {
      reader.releaseLock();
    }
  }
  console.log('串口结束读取_____');
}

async function sendToSerial(data) {
  if (!port || !port.writable) {
    console.warn('串口未连接');
    return;
  }
  
  const writer = port.writable.getWriter();
  // 将字符串编码为 Uint8Array 进行传输
  const encodedData = new TextEncoder().encode(data);
  
  await writer.write(encodedData);
  writer.releaseLock(); // 写入完毕后必须释放锁
  console.log('数据已发送:', data);
}

async function disconnectSerial() {
  console.log('串口断开中...');
  pause_s=true;
  await new Promise(resolve => setTimeout(resolve, 200));
  if (reader) {
    try {
      //await reader.cancel();  // ② 取消 reader
     
      console.log('reader.cancel...');
    } catch (e) {
      // 忽略 cancel 的异常
    }
    reader = null;
  }
  
  if (port) {
        console.log('2. 正在关闭端口...');
        try {
          await port.close();
          console.log('3. 端口已关闭');
        } catch (e) {
          console.error('关闭端口失败:', e);
        }
        port = null;
        console.log('4. port 已设为 null');
      }
  
  console.log('串口已断开');
  document.getElementById('connectBtn').disabled = false;
  document.getElementById('disconnectBtn').disabled = true;
}

document.getElementById('disconnectBtn').addEventListener('click', disconnectSerial);

window.addEventListener('beforeunload', () => {
  if (reader) {
    reader.cancel().catch(() => {});
    reader.releaseLock().catch(() => {});
  }
  if (port) {
    port.close().catch(() => {});
  }
});