export { };

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ElectronAPI {
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  selectDestination: () => string;
  getFilePath: (file: FileWithPath) => string;
  copyFile: (file: FileWithPath) => CopyResult;
  cancelCopy: (file: FileWithPath) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
  interface FileWithPath extends File {
    id: string;
    path: string;
    outputFolder: string;
    copyCount: number;
    localName: string;
    localSize: number;
    localType: string;
    status: 'success'|'fail'|'wait'|'working'
  }
}

