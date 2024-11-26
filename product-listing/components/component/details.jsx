import Link from "next/link";
import { useEffect, useState } from "react";

export function Details() {
  const [loader, setLoader] = useState(true);
  const [data, setData] = useState({});
  const [id, setId] = useState(null);

  function isValidJSON(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function loadData(id) {
    try {
      const data = JSON.parse(window.localStorage.getItem("data") || "[]");
      const filteredData = data?.find((item) => item.id === id);
      const ins = filteredData.data?.geminiInsights;
      if(!isValidJSON(ins)){
        setData(null);
        return;
        }
      const parsedData = JSON.parse(ins);
      setData(parsedData);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id'); // Get 'id' from the query string
    if (idParam) {
      setId(idParam);
      loadData(idParam);
    }
  }, []);

  if (!id) return <>Loading....</>;
  if(!data) return <>No data available</>;
  return (
    (<main className="w-full max-w-3xl mx-auto py-12 md:py-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Product Details</h1>
          <h1 className=" text-2xl mt-5 w-full font-bold tracking-tighter">{data?.title}</h1>
          <h1 className=" text-sm mt-5 w-full font-bold tracking-tighter">Brand: {data?.brand || ""}</h1>
          <h1 className=" text-xs font-semibold mt-5 w-full tracking-tighter flex items-center gap-1">Categories: {data?.categories?.map((i,id)=>(<Link href={`/category/${i}`} key={id}>#{i}</Link>))}</h1>
          <p className="mt-4 text-muted-foreground md:text-lg">
            {data?.description}
          </p>
          <h1 className=" text-sm  mt-5 w-full tracking-tighter flex items-center gap-1">Available Colors: {data?.color?.map((i,id)=>(<div key={id}>{i}{id !== data?.color?.length - 1 && ","}</div>))}</h1>
        </div>
        <div className="grid grid-cols-2">
          <div>

            <div className="flex items-center gap-3">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Features</div>
              <p className="text-sm text-muted-foreground">with price (estimated) {data?.price}</p>
            </div>
            <div className="grid gap-4 mt-2 ml-4">
              {
                data?.features?.map((i, ind) => {
                  return (
                    <ul key={ind}>
                      <li className="text-sm font-medium list-disc">{i}</li>
                    </ul>
                  )
                })
              }
            </div>
          </div>
          <div>

            <div className="flex items-center gap-3">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">About Product</div>
              <p className="text-sm text-muted-foreground">Abstracted highlights of the product</p>
            </div>
            <div className="grid gap-1 mt-2 ml-4">
              {
                data?.aboutThisItem?.map((i, ind) => {
                  return (
                    <ul key={ind}>
                      <li className="text-sm font-medium text-muted-foreground">{i}</li>
                    </ul>
                  )
                })
              }
            </div>
          </div>
        </div>
      </div>
    </main>)
  );
}
