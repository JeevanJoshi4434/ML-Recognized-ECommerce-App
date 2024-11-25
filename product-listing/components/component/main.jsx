"use client";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog";
import { v4 as uuidV4 } from "uuid";
import axios from "axios";
import { ProductList } from "./product-list";
export function Main() {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [imageLink, setImageLink] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("");

  const handleImageUpload = () => {
    setIsImageModalOpen(true)
    setUploadType("file");
  }
  const handleLinkInput = () => {
    setIsLinkModalOpen(true);
    setUploadType("link");
  }

  const handleAddToProducts = async () => {

    try {
      setUploading(true);
      console.log({
        imageLink, file, uploadType});
      const formData = new FormData();
      if (uploadType === "link") {
        formData.append('link', imageLink);
      } else {
        formData.append('file', file);
      }
      formData.append('type', uploadType);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/run/model`, 
          formData
      , {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsedData = response.data;
      if (response.data.success) {
        addToLocalStorage(parsedData);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setFile(null);
      setImageLink('');
      setUploadType("");
    }
  };


  const addToLocalStorage = async (result) => {
    try {
      if (!result) {
        throw new Error('Result is invalid');
      }
      const Id = uuidV4();
      const data = { id: Id, data: result };
      const dataArray = JSON.parse(window.localStorage.getItem("data") || "[]");
      dataArray.push(data);
      window.localStorage.setItem("data", JSON.stringify(dataArray));
      window.location.href = `/detail?id=${Id}`;
    } catch (error) {
      console.error(error);
    }
  };



  return (
    (<div
      className="flex flex-col items-center justify-center h-full min-h-screen bg-background">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Find or Add Amazing Products<sub className="text-xs">In Single Click.</sub></h1>
          <p className="text-muted-foreground">Search for products by uploading an image or entering a link.</p>
        </div>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleImageUpload}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
            <Button variant="outline" onClick={handleLinkInput}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Enter Link
            </Button>
          </div>
        </div>
      </div>
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className=" bg-white  sm:max-w-[425px]">
          <DialogTitle></DialogTitle>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <UploadIcon className="size-12 text-primary" />
            <p className="text-lg font-medium">Upload an Image</p>
            <Input
              type="file"
              placeholder="Choose file"
              onChange={(e) => setFile(e.target.files[0])} />
          </div>
          <DialogFooter>
            <Button onClick={handleAddToProducts}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add to Products
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="bg-white sm:max-w-[425px]">
          <DialogTitle></DialogTitle>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <LinkIcon className="size-12 text-primary" />
            <p className="text-lg font-medium">Enter a Product Link</p>
            <Input
              type="text"
              placeholder="Enter product link"
              value={imageLink}
              onChange={(e) => setImageLink(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleAddToProducts}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add to Products
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ProductList />
    </div>)
  );
}

function LinkIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>)
  );
}


function PlusIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>)
  );
}


function SearchIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>)
  );
}


function UploadIcon(props) {
  return (
    (<svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>)
  );
}
