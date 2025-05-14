import { useCallback, useState } from "react";
import "./App.css";
import FileCard from "./component/FileCard";

function App() {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<FileWithPath[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 处理拖拽进入
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setError(null);
  }, []);

  // 处理拖拽离开
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragOver(false);
  }, []);

  // 处理拖拽悬停
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  // 处理文件放置
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setIsDragOver(false);

    if (window.electron) {
      const files = Array.from(e.dataTransfer.files) as FileWithPath[];

      const formatFiles = await Promise.all(
        files.map(async (file) => {
          const filePath = await window.electron?.getFilePath(file);
          file.path = filePath as string;
          file.id = crypto.randomUUID();
          file.localName = file.name;
          file.localSize = file.size;
          file.localType = file.type;
          file.status = 'wait';
          return file;
        })
      );
      setError(null);
      setDroppedFiles((prev) => [...prev, ...formatFiles]);
    }
  }, []);

  const generateFileCard = () => {
    return droppedFiles.map((file, index) => {
      return (
        <FileCard key={index} file={file} setDroppedFiles={setDroppedFiles} />
      );
    });
  };

  console.log(droppedFiles);

  return (
    <div className="h-screen p-8">
      <div
        className="h-full border-3 border-indigo-400 border-dashed rounded-xl cursor-pointer p-2 drop-area overflow-y-auto"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {generateFileCard()}
        {droppedFiles.length ===0 && <div className="text-3xl text-indigo-600 point-text">
          拖拽文件到此处🫳
        </div>}
      </div>
      {isDragOver && <div className="overlay"></div>}
    </div>
  );
}

export default App;
