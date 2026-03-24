import React from "react";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/common/ProductCard";
import Pagination from "../../components/common/Pagination";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import { Loader2 } from "lucide-react";
import useHome from "../../hooks/customer/useHome";

const Home = () => {
  const {
    products,
    categories,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchTerm,
    selectedCategory,
    navigate,
    handleAddToCart,
  } = useHome();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 p-8 border border-[#d0d7de] rounded-lg bg-[#f6f8fa]">
          <h1 className="text-2xl font-bold text-[#1f2328] mb-2">
            Welcome to our online store
          </h1>
          <p className="text-[#6e7781] text-sm leading-relaxed">
            Browse and discover high-quality products curated for your needs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-8">
          <Breadcrumbs className="!mb-0">
            <Breadcrumbs.Item to="/">Home</Breadcrumbs.Item>
            <Breadcrumbs.Divider />
            {searchTerm ? (
              <Breadcrumbs.Item active>
                Search results for "{searchTerm}"
              </Breadcrumbs.Item>
            ) : selectedCategory ? (
              <Breadcrumbs.Item active>
                {categories.find(
                  (c) => c.category_id.toString() === selectedCategory,
                )?.name || "Category"}
              </Breadcrumbs.Item>
            ) : (
              <Breadcrumbs.Item active>All Products</Breadcrumbs.Item>
            )}
          </Breadcrumbs>

          <select
            className="bg-[#f6f8fa] border border-[#d0d7de] rounded-md px-3 py-1.5 text-sm font-semibold outline-none cursor-pointer hover:bg-[#eff1f3] min-w-[200px]"
            value={selectedCategory}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                navigate(`/?category_id=${val}`);
              } else {
                navigate("/");
              }
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0969da]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#d0d7de] rounded-lg text-[#6e7781]">
            No products match your criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
