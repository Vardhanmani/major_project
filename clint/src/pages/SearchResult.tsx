
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { Home } from "lucide-react";

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q")?.trim() || "";

  useEffect(() => {
    setLoading(true);
    const normalizedQuery = query.toLowerCase();
    const filtered = query
      ? dummyProducts.filter((product) => {
          const name = product.name.toLowerCase();
          const description = product.description.toLowerCase();
          return (
            name.includes(normalizedQuery) ||
            description.includes(normalizedQuery)
          );
        })
      : [];

    setProducts(filtered);
    setLoading(false);
  }, [query]);

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">Search</span>
        </nav>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-app-green">Search results</h1>
              <p className="text-sm text-app-text-light">
                {query
                  ? `Showing results for "${query}".`
                  : "Enter a search term in the navbar to find products."}
              </p>
            </div>

            {query && (
              <div className="text-sm text-app-text-light">
                {products.length} product{products.length === 1 ? "" : "s"} found
              </div>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : !query ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-app-green mb-2">
                No search query provided
              </p>
              <p className="text-sm text-app-text-light">
                Use the search input in the navbar to search products.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-semibold text-app-green mb-2">
                No products found
              </p>
              <p className="text-sm text-app-text-light mb-4">
                Try a different keyword or browse the product collection.
              </p>
              <Link
                to="/products"
                className="inline-flex px-5 py-3 text-sm font-medium bg-app-green text-white rounded-xl hover:bg-app-green-light transition-colors"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-8">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
