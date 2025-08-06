export const TopicsCardSkeletonLoader = () => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="w-full h-40 bg-gray-300 rounded-xl animate-pulse"></div>
      <div className="w-full h-40 bg-gray-300 rounded-xl animate-pulse"></div>
      <div className="w-full h-40 bg-gray-300 rounded-xl animate-pulse"></div>
    </div>
  );
};

export const QuizSkeletonLoader = () => {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl h-full mx-auto mt-6 flex flex-col gap-4">
        <div className="w-full h-[80px] bg-gray-300 rounded animate-pulse"></div>
        <div className="w-full h-[350px] bg-gray-300 rounded animate-pulse"></div>
        <div className="w-full h-[50px] bg-gray-300 rounded animate-pulse"></div>
      </div>
    </div>
  );
};
