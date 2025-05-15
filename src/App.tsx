import { useState, useEffect, ChangeEvent } from 'react';
import './App.css';

import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react"

import { FileWithPreview, useFileUpload } from "./hooks/use-file-upload"
interface Order {
  product: 'tshirt' | 'sweater';
  color: string;
  rate: string;
  material: 'light' | 'heavy';
  text: string;
  image?: File | null;
  price: number;
  cad: number;
  usd: number;
  eur: number;
}

function App() {
  const [product, setProduct] = useState<Order['product']>('tshirt');
  const [color, setColor] = useState<string>('black');
  const [rate, setRate] = useState<string>('USD');
  const [material, setMaterial] = useState<Order['material']>('light');
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<FileWithPreview[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [cad, setCad] = useState<number>(0);
  const [eur, setEur] = useState<number>(0);
  const [usd, setUsd] = useState<number>(0);

  // Cancel upload image
  const [uploading, setUploading] = useState<boolean>(false);

  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
  let u = 0; let c = 0; // rate
  const [
    { files, isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
  })

  const previewUrl = files[0]?.preview || null

  const fetchRates = async () => {
    const url = "https://api.exchangeratesapi.io/v1/latest?access_key=56979d1a5fbca8521a5de76a6691a6ae";
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.success === false) {
        console.error('API error:', data.error);
      } else {
        console.log('Base currency:', data.base);
        console.log('Rates:', data.rates);
        //   "rates": {
        //      "USD": 1.087,
        //      "CAD": 1.47,
        //      "EUR": 1.0
        //    }
        setCad(1.47) // data.rates.CAD;
        setEur(1) // data.rates.EUR;
        setUsd(1.087) // data.rates.USD;
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }
  
  useEffect(()=>{
    fetchRates();
  }, [rate]);
  
  useEffect(() => {
    calculatePrice();
  })
  
  useEffect(() => {
    setImage(files);
    console.log(files);
  }, [files]);

  const calculatePrice = (): void => {
    let basePrice = 0;

    if (product === 'tshirt') {
      basePrice = ['black', 'white'].includes(color) ? 16.95 : 18.95;
      if (material === 'heavy') basePrice += 3;
    } else if (product === 'sweater') {
      basePrice = ['black', 'white'].includes(color) ? 28.95 : 32.95;
    }

    if (text.length > 8) basePrice += 5;
    if (image[0]) basePrice += 10;

    setPrice(basePrice);  // USD
  };

  const handleSubmit = async (): Promise<void> => {
    if(window.confirm("Are you sure?")) {

      const formData = new FormData();
      formData.append('product', product);
      formData.append('color', color);
      formData.append('rate', rate);
      formData.append('material', material);
      formData.append('text', text);
      formData.append('price', price.toString());
      if (image[0]?.file instanceof File) {
        formData.append('image', image[0].file);
      }

      try {
        const res = await fetch('http://localhost:8080/api/order', {
          method: 'POST',
          body: formData,
        });
        const { ok } = await res.json();
        if(res.ok) {
          console.log(ok)
          setUploading(false);
        } else {
          alert("Failed to submit order");
        }
      } catch(error) {
        alert("An error occurred during upload.")
      }
      alert('Order submitted!');
    } else {
      return ;
    }
    };


  return (
    <div className='App min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white'>
      <div className=" min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 max-w-md mx-auto rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-bold text-center">T-Shirt Designer</h1>
        <div>
          <label className="block font-medium mb-1">Product</label>
          <select
            className="w-full p-2 border rounded border-slate-700 bg-slate-800 hover:border-slate-400 focus:border-slate-400"
            value={product}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setProduct(e.target.value as Order['product'])}
          >
            <option value="tshirt">T-Shirt</option>
            <option value="sweater">Sweater</option>
          </select>
        </div>
        <div className=''>
          <label className="block font-medium mb-1">Rate</label>
          <select
            className="w-full p-2 border-slate-700 border rounded bg-slate-800 hover:border-slate-400 focus:border-slate-400"
            value={rate}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setRate(e.target.value)}
          >
            <option value="CAD">CAD</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className=''>
          <label className="block font-medium mb-1">Color</label>
          <select
            className="w-full p-2 border-slate-700 border rounded bg-slate-800 hover:border-slate-400 focus:border-slate-400"
            value={color}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setColor(e.target.value)}
          >
            {product === 'tshirt' ? (
              <>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
              </>
            ) : (
              <>
                <option value="black">Black</option>
                <option value="white">White</option>
                <option value="pink">Pink</option>
                <option value="yellow">Yellow</option>
              </>
            )}
          </select>
        </div>
          

        {product === 'tshirt' && (
          <div>
            <label className="block font-medium mb-1">Material</label>
            <select
              className="w-full p-2 border-slate-700 border rounded bg-slate-800 hover:border-slate-400 focus:border-slate-400"
              value={material}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setMaterial(e.target.value as Order['material'])}
            >
              <option value="light">Light Cotton</option>
              <option value="heavy">Heavy Cotton (+$3)</option>
            </select>
          </div>
        )}
        <div>
          <label className="block font-medium mb-1">Text (First 8 chars free, +$5 for 9–16)</label>
          <input
            className="w-full p-2 border-slate-700 border rounded bg-slate-800 hover:border-slate-400 focus:border-slate-400"
            type="text"
            maxLength={16}
            value={text}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          />
        </div>

        <div className=''>
          <label className="block font-medium mb-1">Upload Image (+$10)</label>
            <div className="flex flex-col gap-2">
            <div className="relative">
              {/* Drop area */}
              <div
                role="button"
                onClick={openFileDialog}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                data-dragging={isDragging || undefined}
                className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex h-64  flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:ring-[3px]"
              >
                <input {...getInputProps()} className="sr-only" aria-label="Upload file" />
                {previewUrl ? (
                    <div className="absolute inset-0 z-0 rounded-xl overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={files[0]?.file?.name || "Uploaded image"}
                      className="w-full h-full object-cover"
                    />
                  </div>  
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                    <div
                      className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
                      aria-hidden="true"
                    >
                      <ImageUpIcon className="size-4 opacity-60" />
                    </div>
                    <p className="mb-1.5 text-sm font-medium">Drop your image here or click to browse</p>
                    <p className="text-muted-foreground text-xs">Max size: {maxSizeMB}MB</p>
                  </div>
                )}
              </div>
              {previewUrl && (
                <div className="absolute top-2 right-2 z-10">
                <button
                  type="button"
                  className="focus-visible:border-ring focus-visible:ring-ring/50 flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90 focus-visible:ring-[3px]"
                  onClick={() => removeFile(files[0]?.id)}
                  aria-label="Remove image"
                >
                  <XIcon className="size-4" />
                </button>
              </div>
              )}
            </div>

            {errors.length > 0 && (
              <div className="text-destructive flex items-center gap-1 text-xs" role="alert">
                <AlertCircleIcon className="size-3 shrink-0" />
                <span>{errors[0]}</span>
              </div>
            )}

          </div>
        </div>
        <div className="flex justify-between items-center">
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="border border-slate-300 hover:border-slate-400 bg-green-600 text-white p-2 rounded mt-1 hover:bg-green-700"
        >
          {uploading ? 'Uploading...' : 'Submit Order'}
        </button>
        <span className="text-lg font-bold">Price: {price}</span>
        </div>
        <table className="w-full table-fixed border-collapse border border-slate-500">
          <thead className='bg-slate-50 dark:bg-slate-700'>
            <tr>
              <th className='border border-slate-600'>Song</th>
              <th className='border border-slate-600'>Artist</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='border border-slate-700'>USD</td>
              <td className='border border-slate-700'>$ {price.toFixed(2)}</td>
            </tr>
            <tr>
              <td className='border border-slate-700'>CAD</td>
              <td className='border border-slate-700'>CA$ {(cad*price/usd).toFixed(2)}</td>
            </tr>
            <tr>
              <td className='border border-slate-700'>EUR</td>
              <td className='border border-slate-700'> € {(eur*price/usd).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;