const Skeleton = () => (
  <div className="container mx-auto p-4">
    <div className="mb-4 flex justify-between items-center">
      <div className="h-[48px] flex items-center w-full">
        <div className="w-full h-6 bg-gray-300 rounded animate-pulse" />
      </div>
    </div>
    <div className="w-full h-[320px] bg-gray-300 rounded animate-pulse" />
  </div>
);

export default Skeleton;