import { motion } from "motion/react";

type Props = {
  file: FileWithPath;
  setDroppedFiles: React.Dispatch<React.SetStateAction<FileWithPath[]>>;
};

type CopyResult = {
  status: "success" | "fail" | "wait" | "working";
  id: string;
};

function FileCard({ file, setDroppedFiles }: Props) {
  async function setOutputFolder(): Promise<void> {
    if (window.electron) {
      const outputFolder = await window.electron.selectDestination();
      setDroppedFiles((prev) =>
        prev.map((f) => {
          return f.id === file.id ? { ...f, outputFolder: outputFolder } : f;
        })
      );
    }
  }

  async function startCopy(): Promise<void> {
    if (window.electron) {
      setDroppedFiles((prev) =>
        prev.map((f) => {
          return f.id === file.id ? { ...f, status: "working" } : f;
        })
      );
      const result: CopyResult = await window.electron.copyFile(file);
      console.log(result);

      setDroppedFiles((prev) =>
        prev.map((f) => {
          return f.id === result.id ? { ...f, status: result.status } : f;
        })
      );
    }
  }

  function deleteFile(): void {
    setDroppedFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  function stopCopy(): void {
     if (window.electron) {
      window.electron.cancelCopy(file)
     }
  }

  return (
    <div className="file-card p-2 mb-4  rounded-xl border-zinc-500 bg-indigo-200 shadow-md hover:shadow-lg shadow-indigo-400/50 transition-shadow duration-300 ease-in-out">
      <div className="flex flex-row flex-wrap">
        <div className="flex flex-row">
          <div className="text-5xl">📄</div>
          <div className="flex flex-col text-base">
            <div style={{ width: "200px" }}>{file.localName}</div>
            <div>{file.localSize}</div>
          </div>
        </div>
        <div className="output-folder join ml-4 mt-1 mr-2">
          <button
            className="btn join-item rounded-l-full"
            onClick={setOutputFolder}
          >
            🗂️输出目录
          </button>
          <input
            className="input join-item"
            placeholder="请选择输出目录"
            disabled
            value={file.outputFolder}
          />
        </div>
        {file.outputFolder && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4 }}
          >
            <input
              type="number"
              placeholder="🔢复制数量"
              className="input input-primary mt-1"
              style={{ width: "120px" }}
              value={file.copyCount}
              onChange={(e) => {
                if (Number(e.target.value) <= 500) {
                  setDroppedFiles((prev) =>
                    prev.map((f) => {
                      return f.id === file.id
                        ? { ...f, copyCount: Number(e.target.value) }
                        : f;
                    })
                  );
                }
              }}
              min={0}
              max={200}
            ></input>
          </motion.div>
        )}
        {file.outputFolder && file.copyCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4 }}
          >
            {(file.status === "wait" ||
              file.status === "fail" ) && (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="text-4xl mt-1"
                onClick={startCopy}
              >
                ▶️
              </motion.div>
            )}
            {file.status === "working" && (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="text-4xl mt-1"
                onClick={stopCopy}
              >
                ⏸️
              </motion.div>
            )}
            {file.status === "success" && (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="text-4xl mt-1"
                onClick={startCopy}
              >
                ✅
              </motion.div>
            )}
          </motion.div>
        )}
        <div className="close-btn" onClick={deleteFile}><button className="btn btn-xs btn-circle">❌</button></div>
      </div>
    </div>
  );
}

export default FileCard;
