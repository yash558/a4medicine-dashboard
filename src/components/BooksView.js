import React, { useState, useEffect } from "react";
import API from "../API";
import toast, { Toaster } from "react-hot-toast";
import Loading from "./Loading";

const BooksView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingBook, setEditingBook] = useState(null);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const token = localStorage.getItem("token");
  const [file, setFile] = useState("");
  const [fileExt, setFileExtension] = useState("");
  const [image, setImage] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const getData = async () => {
    
    setLoading(true);
    try {
      const response = await fetch(`${API}book`);
      const dat = await response.json();
      console.log(dat.data.books);
      if (dat.status === "success") {
        setLoading(false);
        setData(dat?.data.books);
        // console.log(dat?.data.books);
      } else {
        toast.error(dat.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleEdit = (book) => {
    setEditingBook(book);
    setName(book.name);
    setPrice(book.price);
    setEditFormVisible(true);
  };
  console.log(data);
  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch(`${API}book/${editingBook.id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (result.status === "success") {
        const updatedData = data.map((book) => {
          if (book.id === editingBook.id) {
            return {
              ...book,
              name: formData.get("name"),
              price: formData.get("price"),
            };
          }
          return book;
        });
        setData(updatedData);
        toast.success("Book updated successfully!");
        hideEditForm();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while updating the book.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API}book/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (result.status === "success") {
        setData((prevData) => prevData.filter((book) => book.id !== id));
        toast.success("Book deleted successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the book.");
    }
  };

  const hideEditForm = () => {
    setEditFormVisible(false);
  };

 

    // function to get a file name
    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
  
      // Get the file name (including the extension)
      const fileName = selectedFile.name;
  
      // Split the file name to extract the file extension
      const parts = fileName.split(".");
      const fileExtension = parts[parts.length - 1]; // Get the last part which is the file extension
      setFileExtension(fileExtension);
    };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const key = await handleUpload();

      const apiUrl = `${API}/quiz`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price,
          paymentLink: paymentLink,
          description,
          image: key,
        }),
      });

      if (!response.ok) {
        // Handle non-JSON response (e.g., HTML error page)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
          throw new Error("Server returned an error");
        }
      }

      const data = await response.json();

      if (response.ok && data.status === "success") {
        toast.success("New Quiz Created!");
      } else {
        const errorMessage =
          data.message || "Error occurred while creating the quiz.";
        toast.error(errorMessage);
      }

      setShowForm(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const uploadFile = async (url, file) => {
    console.log("File uploading...");
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (response.status === 200) {
        return "File uploaded successfully!";
      } else {
        throw new Error("Error uploading file");
      }
    } catch (error) {
      throw new Error("Error uploading file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    try {
      const urlResponse = await fetch(`${API}image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderName: "charts",
          format: fileExt,
        }),
      });

      const urlData = await urlResponse.json();

      if (urlData.status === "success") {
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(urlData.message);
        return;
      }

      const url = urlData.data.signedUrl;
      const key = urlData.data.key;
      console.log("key in handle upload", key);
      setImage(key);

      console.log("Uploading file started...");
      const uploadResponse = await uploadFile(url, file);
      console.log("File uploaded successfully!");
      toast.success(uploadResponse);
      console.log("finished hande upload fn");
      return key;
      // Handle the successful upload
    } catch (error) {
      console.error("Error fetching upload URL:", error);
      toast.error("An error occurred while fetching the upload URL.");
    }
  };
  return (
    <div>
      <Toaster />
      <div className="r">
        <h1>Books</h1>
      </div>
      {loading ? (
        <div className="h-screen flex items-center justify-center">
          <Loading color="#000000" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-8 mt-12">
          {data.map((item) => (
            <div
              className="flex items-center p-4 justify-between rounded-md flex-col bg-white shadow-md space-x-2 space-y-4"
              key={item.id}
            >
              <div>
                <img
                  src={`https://a4medicine-charts.s3.ap-southeast-2.amazonaws.com/${item.image}`}
                  alt={item.name}
                  className="w-56 h-56"
                />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-gray-600">£ {item.price}</p>
              </div>
              <div className="ml-auto space-x-2">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editFormVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Book</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block font-medium text-gray-700"
                >
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block font-medium text-gray-700"
                >
                  Price:
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={hideEditForm}
                  className="px-4 py-2 ml-4 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksView;
