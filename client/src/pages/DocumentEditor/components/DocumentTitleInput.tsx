import React, { useState, useEffect, useCallback, useMemo } from "react";
import useUpdateDocumentTitle from "../../../hooks/useUpdateDocumentTitle";
import { debounce } from "lodash";

interface DocumentTitleInputProps {
  documentId: string;
  initialTitle: string;
}

const createDebouncedUpdate = (updateFn: (newTitle: string) => void, delay: number) =>
  debounce(updateFn, delay);

const DocumentTitleInput: React.FC<DocumentTitleInputProps> = React.memo(({ documentId, initialTitle }) => {
  const [title, setTitle] = useState(initialTitle);
  const { updateDocumentTitle, loading, error } = useUpdateDocumentTitle();

  const debouncedUpdateTitle = useMemo(
    () => createDebouncedUpdate((newTitle: string) => {
      updateDocumentTitle(documentId, newTitle);
    }, 500),
    [documentId, updateDocumentTitle]
  );

  useEffect(() => {
    if (title !== initialTitle) {
      debouncedUpdateTitle(title);
    }
    return () => {
      debouncedUpdateTitle.cancel();
    };
  }, [title, initialTitle, debouncedUpdateTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  return (
    <div className="w-full">
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="input input-bordered w-full rounded-none"
        placeholder="Enter document title"
      />
      {loading && <span className="text-sm text-gray-500">Saving...</span>}
      {error && <span className="text-sm text-red-500">Error saving title</span>}
    </div>
  );
});

export default DocumentTitleInput;