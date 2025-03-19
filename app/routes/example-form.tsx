import { useState } from "react";
import { CloudImageUploader } from "~/components/CloudImageUploader";
import { json } from "@remix-run/node";
import { useActionData } from "@remix-run/react";

export async function action() {
  // This would typically handle form submission
  // For this example, we're just returning success
  return json({ success: true });
}

export default function ExampleForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const actionData = useActionData<typeof action>();

  const handleUploadComplete = (url: string) => {
    setImageUrl(url);
    setUploadError(null);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Product Form</h1>
      
      <form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <CloudImageUploader
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            className="mb-2"
          />
          {uploadError && (
            <p className="text-red-500 text-sm">{uploadError}</p>
          )}
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <img
                src={imageUrl}
                alt="Preview"
                className="max-w-full h-auto max-h-48 rounded"
              />
              <input type="hidden" name="imageUrl" value={imageUrl} />
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>
        
        {actionData?.success && (
          <p className="text-green-500">Form submitted successfully!</p>
        )}
      </form>
    </div>
  );
} 