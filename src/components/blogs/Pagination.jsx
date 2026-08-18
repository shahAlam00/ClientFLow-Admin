const Pagination = ({
  page,
  totalPages,
  setPage,
}) => {
  return (
    <div className="flex justify-center items-center gap-4 py-6">
      <button
        disabled={page === 1}
        onClick={() =>
          setPage(page - 1)
        }
        className="px-4 py-2 rounded-lg border disabled:opacity-50"
      >
        Prev
      </button>

      <div className="text-sm font-medium">
        Page {page} of {totalPages}
      </div>

      <button
        disabled={page === totalPages}
        onClick={() =>
          setPage(page + 1)
        }
        className="px-4 py-2 rounded-lg border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;