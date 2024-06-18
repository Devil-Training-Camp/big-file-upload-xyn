import SparkMD5 from 'spark-md5'

self.onmessage = function(event: MessageEvent) {
  const file: Blob = event.data;
  const reader = new FileReader();
  
  reader.onload = (e) => {
    if (e.target) {
      const arrayBuffer = e.target.result as ArrayBuffer;
      const spark = new SparkMD5.ArrayBuffer();
      spark.append(arrayBuffer);
      const hash = spark.end();
      self.postMessage({ hash });
    } else {
      self.postMessage({ error: '文件为空' });
    }
  };
  
  reader.onerror = () => {
    self.postMessage({ error: '读取文件出错' });
  };
  
  reader.readAsArrayBuffer(file);
};