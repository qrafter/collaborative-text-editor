import React, { useState } from "react";
import TableRows from "./components/TableRows";
import useGetDocuments from "../../hooks/useGetDocuments";
import CreateBlankDocumentButton from "../../components/CreateBlankDocumentButton";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

const Dashboard: React.FC = () => {
  const { documents, pageInfo, loading, loadNext, loadPrevious } =
    useGetDocuments();
  const [isPaginating, setIsPaginating] = useState(false);

  const handleLoadNext = async () => {
    setIsPaginating(true);
    await loadNext();
    setIsPaginating(false);
  };

  const handleLoadPrevious = async () => {
    setIsPaginating(true);
    await loadPrevious();
    setIsPaginating(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Documents Dashboard</h2>
      <div className="mb-4">
        <CreateBlankDocumentButton />
      </div>
      <div className="overflow-x-auto h-[607px]">
        <table className="table w-full ">
          <thead>
            <tr>
              <th className="w-3/12">Title</th>
              <th className="w-3/12">Owner</th>
              <th className="w-2/12"></th>
            </tr>
          </thead>
          <tbody>
            {/* {loading && !isPaginating && <TableRowsSkeleton />} */}
            <TableRows documents={documents} />
            {/* {(!loading || isPaginating) && <TableRows documents={documents} />} */}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <button
          className="btn btn-sm"
          onClick={handleLoadPrevious}
          disabled={!pageInfo?.hasPreviousPage || loading || isPaginating}
        >
          {isPaginating ? (
            <Loader className="animate-spin mr-2" size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
          Previous
        </button>
        <button
          className="btn btn-sm"
          onClick={handleLoadNext}
          disabled={!pageInfo?.hasNextPage || loading || isPaginating}
        >
          Next
          {isPaginating ? (
            <Loader className="animate-spin ml-2" size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
