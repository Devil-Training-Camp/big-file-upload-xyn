import type { IFileChunk } from '../types/interface';

export function uploadChunk(
    chunk: IFileChunk,
    hash?: string
): Promise<boolean> {
    const formData = new FormData();
    formData.append('chunk', chunk.file);
    formData.append('index', chunk.chunkIndex.toString());
    if (hash) {
        formData.append('hash', hash);
    }

    return fetch('http://localhost:3000/uploadChunk', {
        method: 'POST',
        body: formData
    }).then(response => response.ok);
}

export function isExisted(
    hash: string
): Promise<boolean> {
    return fetch(`http://localhost:3000/checkHash?hash=${hash}`, {
        method: 'GET'
    }).then(response => response.ok);
}

export function chunkMerge(
    hash: string,
    fileName: string
): Promise<boolean> {
    const formData = new FormData();
    formData.append('hash', hash);
    formData.append('fileName', fileName);
    if (hash) {
        formData.append('hash', hash);
    }
    return fetch(`http://localhost:3000/chunkMerge`, {
        method: 'POST',
        body: formData
    }).then(response => response.ok);
}
