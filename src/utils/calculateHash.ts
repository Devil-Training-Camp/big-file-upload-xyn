import Worker from "../utils/hashWorker.ts?worker";

export function calculateHash(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = new Worker();
      worker.postMessage(file);
      worker.onmessage = (e: MessageEvent) => {
        const { hash, error } = e.data;
        if (hash) {
          resolve(hash);
          worker.terminate();
        } else if (error) {
          reject(new Error(error));
          worker.terminate();
        }
      };
      worker.onerror = (event: ErrorEvent) => {
        worker.terminate();
        reject(event.error);
      };
    });
  }