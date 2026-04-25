import { useLayoutEffect } from "react";

const useDocumentTitle = (title) => {
  useLayoutEffect(() => {
    const previousTitle = document.title;

    document.title = title ? `DK-Store | ${title}` : "DK-Store";

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};

export default useDocumentTitle;