import { PlusIcon } from "lucide-react";
import useCreateBlankDocument from "../hooks/useCreateBlankDocument";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateBlankDocumentButton = () => {
  const { createBlankDocument, loading, document } = useCreateBlankDocument();
  const navigate = useNavigate();

  const handleCreateDocument = () => {
    createBlankDocument();
  };

  useEffect(() => {
    if (document && document.id) {
      navigate(`/documents/${document.id}`);
    }
  }, [document, navigate]);

  return (
    <button className="btn btn-sm" onClick={handleCreateDocument}>
      Create Document
      {loading && <span className="loading"></span>}
      {!loading && <PlusIcon size={20} />}
    </button>
  );
};

export default CreateBlankDocumentButton;
