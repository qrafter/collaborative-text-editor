const TableRowsSkeleton = () => {
  const skeletonRows = Array.from({ length: 5 }, (_, index) => (
    <tr key={index}>
      <td className="flex flex-row items-center gap-1">
        <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse ml-2"></div>
      </td>
      <td>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
      </td>
      <th>
        <div className="w-full h-8 bg-gray-300 rounded animate-pulse"></div>
      </th>
    </tr>
  ));

  return <>{skeletonRows}</>;
};

export default TableRowsSkeleton;