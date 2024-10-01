import React from "react";
import { Document } from "../../../types/Document";
import { EditIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TableRowsProps {
  documents: Document[];
}

const TableRows: React.FC<TableRowsProps> = ({ documents }) => {
  const navigate = useNavigate();
  return (
    <>
      {documents.map((doc) => (
        <tr key={doc.id}>
          <td>{doc.name}</td>
          <td>{doc.owner.email}</td>
          <td>
            <button
              className="btn btn-sm w-full"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              Edit <EditIcon size={20} />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default TableRows;
