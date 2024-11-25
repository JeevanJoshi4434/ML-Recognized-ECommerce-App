"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState({});

  // Fetch products from localStorage and set products
  useEffect(() => {
    const data = localStorage.getItem("data");
    const parsedData = JSON.parse(data) || [];
    if (parsedData && parsedData.length > 0) {
      let productList = [];
      for (let i = 0; i < parsedData.length; i++) {
        const product = JSON.parse(parsedData[i].data.geminiInsights);
        productList.push(product);
      }
      setProducts(productList);
    }
  }, []);

  // Function to filter products based on search term
  const filterProducts = (products, term) => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(term.toLowerCase()) ||
      product.brand.toLowerCase().includes(term.toLowerCase()) ||
      product.categories.some((cat) =>
        cat.toLowerCase().includes(term.toLowerCase())
      )
    );
  };

  // Dynamically group filtered products by category
  const groupByCategory = (filteredProducts) => {
    const grouped = {};
    filteredProducts.forEach((product) => {
      const cat = product.categories[0];
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(product);
    });
    return grouped;
  };

  // Update filtered products and categories whenever searchTerm or products change
  useEffect(() => {
    if (products.length > 0) {
      const filtered = filterProducts(products, searchTerm);
      const groupedCategories = groupByCategory(filtered);
      setFilteredProducts(filtered);
      setCategories(groupedCategories);
    }
  }, [searchTerm, products]);
  if (products.length === 0) return <>No products added yet</>;
  return (
    <div>
      <div className="relative outline-none mt-5">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20 w-full outline-none" />
        <Button className="absolute right-1 top-1/2 -translate-y-1/2">
          <SearchIcon className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
      <main className="container mx-auto py-8">
        {Object.keys(categories).length > 0 ? (
          Object.keys(categories).map((category) => (
            <section key={category} className="mb-8">
              <h2 className="text-xl font-bold mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories[category].map((product, index) => (
                  <ProductCard key={index} product={product} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </main>
    </div>
  );
}

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ProductCard({ product }) {
  return (
    <div className="bg-background rounded-md shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{product.title}</h3>
        <Link href={`/company/${product.brand}`} className="text-muted-foreground mb-3">{product.brand}</Link>
        {
          product.price ?
            <p className="text-muted-foreground mb-2">Price: {(parseFloat(product.price.slice(1, -1)) * 84.24).toFixed(2)} (Estimated)</p>
            :
            <p className="text-muted-foreground mb-2">Price: Not Available</p>
        }
        <p className="text-sm line-clamp-3">{product.description}</p>
        <div className="my-2 flex w-full justify-end">
        <Button>Buy Now</Button>
        </div>
      </div>
    </div>
  );
}
